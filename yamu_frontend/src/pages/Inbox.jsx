import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import apiClient from '../services/axiosInstance';
import { useUser } from '../context/UserContext';

const Inbox = () => {
  console.log('[Inbox] Component rendering');
  const { user } = useUser();
  console.log('[UserContext] Current user:', user);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  
  const [chatPartners, setChatPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const handleIncomingMessage = useCallback((message) => {
    console.log('[WebSocket] Incoming message:', message);
    
    setMessages(prev => {
      // Check for duplicates
      if (prev.some(m => m.id === message.id)) {
        console.log('[MessageHandler] Duplicate message detected, ignoring');
        return prev;
      }

      // Update unread counts
      if (message.receiverId === user.id && !message.read) {
        console.log(`[UnreadCounter] Incrementing unread count for sender ${message.senderId}`);
        setUnreadCounts(prevCounts => ({
          ...prevCounts,
          [message.senderId]: (prevCounts[message.senderId] || 0) + 1
        }));
      }

      // Mark as read if in current conversation
      if (selectedPartner && 
          ((message.senderId === selectedPartner && message.receiverId === user.id) ||
           (message.receiverId === selectedPartner && message.senderId === user.id))) {
        console.log(`[MessageHandler] Marking message ${message.id} as read`);
        return [...prev, { ...message, read: true }];
      }

      console.log(`[MessageHandler] Adding new message to state (ID: ${message.id})`);
      return [...prev, message];
    });

    // Mark as read if it's in the current conversation
    if (selectedPartner === message.senderId) {
      console.log(`[API] Marking message ${message.id} as read on server`);
      apiClient.post(`/api/messages/mark-read/${message.id}`)
        .then(() => console.log(`[API] Message ${message.id} marked as read successfully`))
        .catch(err => console.error('[API] Error marking message as read:', err));
    }
  }, [user, selectedPartner]);

  // WebSocket setup
  useEffect(() => {
    console.log('[Effect] Setting up WebSocket');
    
    if (!user) {
      console.log('[Auth] No user detected, redirecting to login');
      navigate('/login');
      return;
    }

    const setupWebSocket = () => {
      console.log('[WebSocket] Creating new STOMP client');
      
      const client = new Client({
        webSocketFactory: () => {
          console.log('[WebSocket] Creating SockJS instance');
          return new SockJS('http://localhost:8080/ws');
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => {
          if (str.includes('ERROR')) console.error('[WebSocket] Error:', str);
          else console.debug('[WebSocket] Debug:', str);
        },
        onConnect: () => {
          console.log('[WebSocket] Connection established');
          setIsConnected(true);
          
          // Subscribe to personal queue
          client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
            console.log(`[WebSocket] Received message on personal queue: ${message.body}`);
            try {
              const parsed = JSON.parse(message.body);
              handleIncomingMessage(parsed);
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
            }
          });

          // Subscribe to general topic
          client.subscribe(`/topic/${user.id}`, (message) => {
            console.log(`[WebSocket] Received message on general topic: ${message.body}`);
            try {
              const parsed = JSON.parse(message.body);
              handleIncomingMessage(parsed);
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
            }
          });
        },
        onStompError: (error) => {
          console.error('[WebSocket] STOMP error:', error);
          setIsConnected(false);
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          setIsConnected(false);
        }
      });

      console.log('[WebSocket] Activating client');
      client.activate();
      setStompClient(client);

      return () => {
        console.log('[WebSocket] Cleanup - deactivating client');
        client.deactivate();
      };
    };

    const cleanup = setupWebSocket();
    return cleanup;
  }, [user, navigate, handleIncomingMessage]);

  // Load initial data
  useEffect(() => {
    console.log('[Effect] Loading initial data');
    
    if (!user) {
      console.log('[Effect] No user, skipping initial data load');
      return;
    }

    const loadInitialData = async () => {
      try {
        console.log('[API] Fetching initial data in parallel');
        const [partnersResponse, countsResponse, usersResponse] = await Promise.all([
          apiClient.get('/api/messages/chat-partners'),
          apiClient.get('/api/messages/unread-count'),
          apiClient.get(`/api/users/role/${user.role === 'TRAVELER' ? 'GUIDE' : 'TRAVELER'}`)
        ]);

        console.log('[API] Initial data loaded:', {
          partners: partnersResponse.data,
          counts: countsResponse.data,
          users: usersResponse.data
        });

        setChatPartners(partnersResponse.data);
        setUnreadCounts(countsResponse.data);
        setAllUsers(usersResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('[API] Error loading initial data:', error);
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Handle URL parameter for selected partner
  useEffect(() => {
    console.log('[Effect] Checking URL parameters');
    const userIdParam = searchParams.get('select');
    console.log('[Router] URL search params:', { select: userIdParam });

    if (userIdParam) {
      const userId = parseInt(userIdParam);
      if (!isNaN(userId)) {
        console.log(`[Router] Setting selected partner from URL: ${userId}`);
        setSelectedPartner(userId);
      } else {
        console.warn(`[Router] Invalid user ID in URL: ${userIdParam}`);
      }
    }
  }, [searchParams]);

  // Load messages when partner changes
  useEffect(() => {
    if (!selectedPartner) {
      console.log('[Effect] No selected partner, skipping messages load');
      return;
    }

    console.log(`[Effect] Loading messages for partner ${selectedPartner}`);
    
    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        console.log(`[API] Fetching conversation with user ${selectedPartner}`);
        
        const response = await apiClient.get(`/api/messages/conversation/${selectedPartner}`);
        console.log('[Data] message:', response.data);
        console.log(`[API] Loaded ${response.data.length} messages for conversation`);
        
        setMessages(response.data);
        setUnreadCounts(prev => ({
          ...prev,
          [selectedPartner]: 0
        }));
        
        console.log(`[UI] Scrolling to bottom of messages`);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (error) {
        console.error('[API] Error loading messages:', error);
        setError('Failed to load messages');
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [selectedPartner]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) {
      console.log('[Message] Empty message or no partner selected, ignoring send');
      return;
    }

    console.log(`[Message] Sending message to ${selectedPartner}: "${newMessage}"`);
    
    const messageData = {
      receiverId: selectedPartner,
      content: newMessage,
    };

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const partner = allUsers.find(u => u.id === selectedPartner);
    const optimisticMessage = {
      id: tempId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      receiverId: selectedPartner,
      receiverName: partner ? `${partner.firstName} ${partner.lastName}` : '',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      isOptimistic: true
    };

    console.log('[OptimisticUpdate] Adding temporary message to UI');
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    try {
      if (stompClient && stompClient.connected) {
        console.log('[WebSocket] Sending message via STOMP');
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(messageData),
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'content-type': 'application/json'
          }
        });
      } else {
        console.log('[WebSocket] Not connected, falling back to HTTP API');
        const response = await apiClient.post('/api/messages', messageData);
        console.log('[API] Message sent successfully, replacing optimistic update');
        
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? response.data : msg
        ));
        console.log("Database endpoint")
      }
    } catch (error) {
      console.error('[Message] Error sending message:', error);
      console.log('[Rollback] Removing optimistic message from UI');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message');
    }
  };

  const filteredUsers = allUsers.filter(u =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  console.log('[Render] Current state:', {
    chatPartners,
    selectedPartner,
    messagesCount: messages.length,
    loading,
    messagesLoading,
    error,
    unreadCounts,
    allUsersCount: allUsers.length,
    filteredUsersCount: filteredUsers.length,
    isConnected
  });

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

    if (selectedPartner === partnerId) {
      return { ...baseStyle, backgroundColor: "#f0f7ff" };
    }
    return baseStyle;
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
    messageStatus: {
      marginLeft: '8px',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.connectionBanner}>
        {isConnected ? 'Connected' : 'Offline Mode - Messages may be delayed'}
      </div>
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
              {messagesLoading ? (
                <div style={styles.loadingIndicator}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => {
                  const isSent = message.senderId === user.id;
                  const partner = allUsers.find(u => u.id === (isSent ? message.receiverId : message.senderId));
                  
                  return (
                    <div
                      key={message.id || message.timestamp}
                      style={{
                        ...styles.message,
                        ...(isSent ? styles.sentMessage : styles.receivedMessage),
                        opacity: message.isOptimistic ? 0.7 : 1
                      }}
                    >
                      {!isSent && (
                        <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                          {partner?.firstName} {partner?.lastName}
                        </div>
                      )}
                      <div style={styles.messageContent}>{message.content}</div>
                      <div style={{
                        ...styles.messageTime,
                        color: isSent ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isSent && (
                          <span style={styles.messageStatus}>
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
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