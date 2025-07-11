import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/axiosInstance';
import { useUser } from '../context/UserContext';

const Inbox = ({currentUser}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chatPartners, setChatPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChatPartners = async () => {
      try {
        const response = await apiClient.get('/api/messages/chat-partners');
        setChatPartners(response.data);
        
        const counts = {};
        for (const partnerId of response.data) {
          const countResponse = await apiClient.get(`/api/messages/unread-count?partnerId=${partnerId}`);
          counts[partnerId] = countResponse.data;
        }
        setUnreadCounts(counts);
      } catch (err) {
        setError('Failed to load chat partners');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const role = user.role === 'TRAVELER' ? 'GUIDE' : 'TRAVELER';
        const response = await apiClient.get(`/api/users/role/${role}`);
        setAllUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchChatPartners();
    fetchAllUsers();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedPartner) {
      const fetchMessages = async () => {
        try {
            currentUser = JSON.parse(localStorage.getItem("user"));
          const response = await apiClient.get(`/api/messages/conversation/${selectedPartner.id}`);
          setMessages(response.data);
          // Mark messages as read when conversation is opened
          await apiClient.post(`/api/messages/mark-as-read/${selectedPartner.id}`);
        } catch (err) {
          setError('Failed to load messages');
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [selectedPartner]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;

    try {
      const response = await apiClient.post('/api/messages', {
        receiverId: selectedPartner.id,
        content: newMessage
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const filteredUsers = allUsers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '300px',
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {/* Search */}
        <div style={{ padding: '15px', borderBottom: '1px solid #e0e0e0' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        {/* Chat List */}
        <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#532321' }}>Your Chats</h3>
          {loading ? (
            <p>Loading chats...</p>
          ) : error ? (
            <p style={{ color: '#d32f2f', padding: '10px' }}>{error}</p>
          ) : (
            chatPartners.map(partner => (
              <div 
                key={partner.id}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginBottom: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: selectedPartner?.id === partner.id ? '#e8f0fe' : 'transparent',
                  ':hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={() => setSelectedPartner(partner)}
              >
                <div style={{ fontWeight: 500 }}>
                  {partner.firstName} {partner.lastName}
                </div>
                {unreadCounts[partner.id] > 0 && (
                  <div style={{
                    backgroundColor: '#532321',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    {unreadCounts[partner.id]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* User List */}
        <div style={{ padding: '15px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#532321' }}>
            {user?.role === 'TRAVELER' ? 'Available Guides' : 'Travelers'}
          </h3>
          {filteredUsers.map(user => (
            <div 
              key={user.id}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '5px',
                display: 'flex',
                flexDirection: 'column',
                ':hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
              onClick={() => setSelectedPartner(user)}
            >
              <div>
                {user.firstName} {user.lastName}
              </div>
              {user.role === 'GUIDE' && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {user.expertiseCityRegion}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {selectedPartner ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ margin: 0 }}>
                {selectedPartner.firstName} {selectedPartner.lastName}
                {selectedPartner.role === 'GUIDE' && (
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>
                    - {selectedPartner.expertiseCityRegion}
                  </span>
                )}
              </h3>
            </div>
            
            {/* Messages */}
            <div style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: '#666'
                }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id}
                    style={{
                      maxWidth: '70%',
                      marginBottom: '15px',
                      padding: '10px 15px',
                      borderRadius: '18px',
                      position: 'relative',
                      alignSelf: message.senderId === user.id ? 'flex-end' : 'flex-start',
                      backgroundColor: message.senderId === user.id ? '#532321' : '#f1f1f1',
                      color: message.senderId === user.id ? 'white' : 'black',
                      borderBottomRightRadius: message.senderId === user.id ? '0' : '18px',
                      borderBottomLeftRadius: message.senderId === user.id ? '18px' : '0'
                    }}
                  >
                    <div style={{ marginBottom: '5px' }}>{message.content}</div>
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.8,
                      textAlign: 'right',
                      color: message.senderId === user.id ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                    }}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Message Input */}
            <div style={{
              padding: '15px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  marginRight: '10px'
                }}
              />
              <button 
                onClick={handleSendMessage}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#532321',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  ':hover': {
                    backgroundColor: '#3a1817'
                  }
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#666'
          }}>
            <p>Select a chat from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;