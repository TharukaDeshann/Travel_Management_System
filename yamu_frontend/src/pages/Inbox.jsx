import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiClient from '../services/axiosInstance';
import { useUser } from '../context/UserContext';

const Inbox = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  
  const [chatPartners, setChatPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const handleIncomingMessage = useCallback((message) => {
    setMessages(prev => {
      const messageExists = prev.some(m => m.id === message.id);
      if (messageExists) return prev;

      const isUnread = message.receiverId === user.id && !message.read;
      if (isUnread) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1
        }));
      }

      return [...prev, message];
    });

    if (selectedPartner === message.senderId) {
      apiClient.post(`/api/messages/mark-read/${message.id}`);
    }
  }, [user, selectedPartner]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const setupWebSocket = () => {
      const client = new Client({
        webSocketFactory: () =>  new SockJS('http://localhost:8080/ws'),
            // new SockJS(`http://localhost:8080/ws?token=${localStorage.getItem('accessToken')}`),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => {
          if (str.includes('ERROR')) {
            console.log('WebSocket Error:', str);
          }
        },
        onConnect: () => {
          setIsConnected(true);
          
          // Subscribe to user's private queue
          client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
            try {
              const parsedMessage = JSON.parse(message.body);
              handleIncomingMessage(parsedMessage);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });
        },
        onStompError: (error) => {
          console.error('STOMP error:', error);
          setIsConnected(false);
        },
        onDisconnect: () => {
          setIsConnected(false);
        }
      });

      client.activate();
      setStompClient(client);

      return () => {
        client.deactivate();
      };
    };

    const cleanup = setupWebSocket();

    return () => {
      cleanup();
    };
  }, [user, navigate, handleIncomingMessage]);

  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      try {
        const [partnersResponse, countsResponse, usersResponse] = await Promise.all([
          apiClient.get('/api/messages/chat-partners'),
          apiClient.get('/api/messages/unread-count'),
          apiClient.get(`/api/users/role/${user.role === 'TRAVELER' ? 'GUIDE' : 'TRAVELER'}`)
        ]);

        setChatPartners(partnersResponse.data);
        setUnreadCounts(countsResponse.data);
        setAllUsers(usersResponse.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  useEffect(() => {
    const userIdParam = searchParams.get('select');
    if (userIdParam) {
      const userId = parseInt(userIdParam);
      if (!isNaN(userId)) {
        setSelectedPartner(userId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedPartner) return;

    const loadMessages = async () => {
      try {
        const response = await apiClient.get(`/api/messages/conversation/${selectedPartner}`);
        setMessages(response.data);
        setUnreadCounts(prev => ({
          ...prev,
          [selectedPartner]: 0
        }));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [selectedPartner]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;

    const messageData = {
      receiverId: selectedPartner,
      content: newMessage,
    };

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      receiverId: selectedPartner,
      receiverName: allUsers.find(u => u.id === selectedPartner)?.name || '',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    console.log(stompClient, stompClient.connected);
    

    try {
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(messageData),
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'content-type': 'application/json'
          }
        });
        console.log("Web Socket")
      } else {
        const response = await apiClient.post('/api/messages', messageData);
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? response.data : msg
        ));
        console.log("Database endpoint")
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message');
    }
  };

  const filteredUsers = allUsers.filter(u =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getChatItemStyle = (partnerId) => {
    const baseStyle = {
      padding: "12px 16px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #f0f0f0",
      transition: "background-color 0.2s",
      ':hover': {
        backgroundColor: "#f5f5f5",
      }
    };

    const activeStyle = {
      backgroundColor: "#f0f7ff",
    };

    const selectedFromParamStyle = {
      backgroundColor: "#e6f7ff",
      borderLeft: "3px solid #532321"
    };

    let style = { ...baseStyle };
    if (selectedPartner === partnerId) {
      style = { ...style, ...activeStyle };
    }

    const userIdParam = searchParams.get('select');
    if (userIdParam && partnerId === parseInt(userIdParam)) {
      style = { ...style, ...selectedFromParamStyle };
    }

    return style;
  };

  const styles = {
    container: {
      display: 'flex',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#f5f5f5',
      position: 'relative',
    },
    connectionBanner: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      padding: '8px 16px',
      backgroundColor: isConnected ? '#4CAF50' : '#FFC107',
      color: 'white',
      borderRadius: '20px',
      fontSize: '14px',
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sidebar: {
      width: '320px',
      borderRight: '1px solid #e0e0e0',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
    },
    searchContainer: {
      padding: '16px',
      borderBottom: '1px solid #e0e0e0',
    },
    searchInput: {
      width: '100%',
      padding: '10px 16px',
      border: '1px solid #ddd',
      borderRadius: '20px',
      outline: 'none',
      fontSize: '14px',
    },
    sectionHeader: {
      padding: '12px 16px',
      margin: 0,
      fontSize: '16px',
      fontWeight: '600',
      color: '#532321',
      backgroundColor: '#f9f9f9',
    },
    chatItemContent: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    partnerName: {
      fontWeight: '500',
      marginBottom: '4px',
    },
    unreadCount: {
      backgroundColor: '#532321',
      color: 'white',
      borderRadius: '50%',
      minWidth: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      padding: '0 4px',
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
    },
    chatHeader: {
      padding: '16px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#f9f9f9',
    },
    messagesContainer: {
      flex: 1,
      padding: '16px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f7fa',
    },
    message: {
      maxWidth: '75%',
      marginBottom: '12px',
      padding: '12px 16px',
      borderRadius: '18px',
      position: 'relative',
      wordBreak: 'break-word',
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#532321',
      color: 'white',
      borderBottomRightRadius: '4px',
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: 'white',
      color: '#333',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    messageContent: {
      marginBottom: '6px',
      lineHeight: '1.4',
    },
    messageTime: {
      fontSize: '11px',
      opacity: 0.8,
      textAlign: 'right',
    },
    inputContainer: {
      padding: '16px',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
    },
    messageInput: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #ddd',
      borderRadius: '20px',
      marginRight: '12px',
      outline: 'none',
      fontSize: '14px',
    },
    sendButton: {
      padding: '12px 24px',
      backgroundColor: '#532321',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#3a1817',
      },
      ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
      },
    },
    emptyState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#666',
      textAlign: 'center',
      padding: '20px',
    },
    errorMessage: {
      color: '#d32f2f',
      padding: '12px',
      textAlign: 'center',
      fontSize: '14px',
    },
    loadingIndicator: {
      padding: '20px',
      textAlign: 'center',
      color: '#666',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.connectionBanner}>
        {isConnected ? 'Connected' : 'Offline Mode - Messages may be delayed'}
      </div>

      <div style={styles.sidebar}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <h3 style={styles.sectionHeader}>Your Conversations</h3>
        
        {loading ? (
          <div style={styles.loadingIndicator}>Loading chats...</div>
        ) : error ? (
          <div style={styles.errorMessage}>{error}</div>
        ) : (
          chatPartners.map(partnerId => {
            const partner = allUsers.find(u => u.id === partnerId);
            if (!partner) return null;

            return (
              <div
                key={partner.id}
                style={getChatItemStyle(partner.id)}
                onClick={() => {
                  setSelectedPartner(partner.id);
                  navigate('/inbox');
                }}
              >
                <div style={styles.chatItemContent}>
                  <div style={styles.partnerName}>
                    {partner.firstName} {partner.lastName}
                  </div>
                </div>
                {unreadCounts[partner.id] > 0 && (
                  <div style={styles.unreadCount}>
                    {unreadCounts[partner.id]}
                  </div>
                )}
              </div>
            );
          })
        )}

        <h3 style={styles.sectionHeader}>
          {user?.role === 'TRAVELER' ? 'Available Guides' : 'Travelers'}
        </h3>
        
        {filteredUsers.map(u => (
          <div
            key={u.id}
            style={getChatItemStyle(u.id)}
            onClick={() => {
              setSelectedPartner(u.id);
              navigate('/inbox');
            }}
          >
            <div style={styles.chatItemContent}>
              <div style={styles.partnerName}>
                {u.firstName} {u.lastName}
              </div>
              {u.role === 'GUIDE' && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {u.expertiseCityRegion}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chatArea}>
        {selectedPartner ? (
          <>
            <div style={styles.chatHeader}>
              <h3 style={{ margin: 0 }}>
                {allUsers.find(u => u.id === selectedPartner)?.firstName}{' '}
                {allUsers.find(u => u.id === selectedPartner)?.lastName}
                {allUsers.find(u => u.id === selectedPartner)?.role === 'GUIDE' && (
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>
                    - {allUsers.find(u => u.id === selectedPartner)?.expertiseCityRegion}
                  </span>
                )}
              </h3>
            </div>

            <div style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    style={{
                      ...styles.message,
                      ...(message.senderId === user.id ? styles.sentMessage : styles.receivedMessage),
                    }}
                  >
                    <div style={styles.messageContent}>{message.content}</div>
                    <div style={{
                      ...styles.messageTime,
                      color: message.senderId === user.id ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'
                    }}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputContainer}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={styles.messageInput}
              />
              <button
                onClick={handleSendMessage}
                style={styles.sendButton}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <p>Select a conversation from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;