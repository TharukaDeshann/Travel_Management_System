import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import yamuLogo from '../images/yamu-logo.png';
import profileIcon from '../images/profile.png';
import apiClient from "../services/axiosInstance";

const GuideDashboard = ({ currentUser }) => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (currentUser?.id) {
      const fetchReservations = async () => {
        try {
          const response = await apiClient.get(`/api/reservations/guide/${currentUser.id}`);
          console.log("Fetched reservations:", response.data);

          console.log("Current User ID:", currentUser.id);    
          setReservations(response.data);
        } catch (error) {
          console.error("Error fetching reservations:", error);
        }
      };
      fetchReservations();
    }
  }, [currentUser]);

  const handleReservationAction = async (reservationId, action) => {
    try {
      const endpoint = action === 'confirm' ? 'confirm' : 'decline';
      await apiClient.put(`/api/reservations/${reservationId}/${endpoint}`);
      
      // Update local state
      setReservations(prev => prev.map(res => 
        res.id === reservationId 
          ? { ...res, status: action === 'confirm' ? 'CONFIRMED' : 'DECLINED' } 
          : res
      ));
    } catch (error) {
      console.error(`Failed to ${action} reservation:`, error);
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (activeTab === "upcoming") {
      return res.status === 'PENDING' || res.status === 'CONFIRMED';
    } else if (activeTab === "past") {
      return res.status === 'DECLINED';
    }
    return true;
  });

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Navigation Bar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer"
        }} onClick={() => navigate('/')}>
          <img 
            src={yamuLogo} 
            alt="Yamu Logo" 
            style={{ height: "40px" }}
          />
          <span style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#532321"
          }}>YAMU</span>
        </div>
        
        <div style={{
          display: "flex",
          gap: "30px"
        }}>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "#532321",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer"
            }}
            onClick={() => navigate('/guide-dashboard')}
          >
            Dashboard
          </button>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "#333",
              fontSize: "16px",
              cursor: "pointer"
            }}
            onClick={() => navigate('/guide-calendar')}
          >
            Calendar
          </button>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "#333",
              fontSize: "16px",
              cursor: "pointer"
            }}
            onClick={() => navigate('/guide-reviews')}
          >
            Reviews
          </button>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "#333",
              fontSize: "16px",
              cursor: "pointer"
            }}
            onClick={() => navigate('/emergency-contacts')}
          >
            Emergency Contacts
          </button>
          <button 
            style={{
              background: "none",
              border: "none",
              color: "#333",
              fontSize: "16px",
              cursor: "pointer"
            }}
            onClick={() => navigate('/inbox')}
          >
            Inbox
          </button>
        </div>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}>
          <span style={{ fontSize: "20px" }}>🔔</span>
          <img 
            src={profileIcon} 
            alt="User" 
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer"
            }}
            onClick={() => navigate('/profile')}
          />
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* My Tours Heading */}
        <div style={{ marginTop: "20px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{
              fontSize: "24px",
              color: "#532321",
              fontWeight: "600",
              margin: 0
            }}>
              My Tours
            </h3>
            
            <div style={{
              display: "flex",
              gap: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              <button
                onClick={() => setActiveTab("upcoming")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeTab === "upcoming" ? "#532321" : "white",
                  color: activeTab === "upcoming" ? "white" : "#333",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("past")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: activeTab === "past" ? "#532321" : "white",
                  color: activeTab === "past" ? "white" : "#333",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Past
              </button>
            </div>
          </div>
          
          {filteredReservations.length === 0 ? (
            <div style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <p style={{ color: "#777", fontSize: "16px", margin: 0 }}>
                {activeTab === "upcoming" 
                  ? "You have no upcoming tours at the moment." 
                  : "No past tours found."}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              {filteredReservations.map(reservation => (
                <div key={reservation.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px' }}>
                        Reservation from {reservation.traveler.firstName} {reservation.traveler.lastName}
                      </h4>
                      <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
                        Created: {new Date(reservation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      backgroundColor: 
                        reservation.status === 'PENDING' ? '#FFD700' :
                        reservation.status === 'CONFIRMED' ? '#90EE90' : '#FF6347',
                      color: 'black',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {reservation.status}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <p style={{ margin: '5px 0', fontWeight: '500' }}>
                        <span style={{ color: '#666' }}>Contact:</span> {reservation.traveler.contactNumber}
                      </p>
                      <p style={{ margin: '5px 0', fontWeight: '500' }}>
                        <span style={{ color: '#666' }}>Email:</span> {reservation.traveler.email}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '5px 0', fontWeight: '500' }}>
                        <span style={{ color: '#666' }}>Duration:</span> {reservation.numberOfDays} days
                      </p>
                      <p style={{ margin: '5px 0', fontWeight: '500' }}>
                        <span style={{ color: '#666' }}>Total Travelers:</span> {reservation.dayDetails.reduce((sum, day) => sum + day.numberOfTravelers, 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px' }}>
                    <h5 style={{ 
                      marginBottom: '10px',
                      paddingBottom: '5px',
                      borderBottom: '1px solid #eee'
                    }}>
                      Itinerary Details:
                    </h5>
                    {reservation.dayDetails.map((day, index) => (
                      <div key={index} style={{
                        padding: '15px',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        backgroundColor: '#f9f9f9'
                      }}>
                        <p style={{ margin: '5px 0', fontWeight: '500' }}>
                          <span style={{ color: '#666' }}>Day {day.dayNumber}:</span> {day.place}
                        </p>
                        <p style={{ margin: '5px 0', fontWeight: '500' }}>
                          <span style={{ color: '#666' }}>Date:</span> {new Date(day.date).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '5px 0', fontWeight: '500' }}>
                          <span style={{ color: '#666' }}>Travelers:</span> {day.numberOfTravelers}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {reservation.status === 'PENDING' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      marginTop: '20px'
                    }}>
                      <button
                        onClick={() => handleReservationAction(reservation.id, 'decline')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#FF6347',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleReservationAction(reservation.id, 'confirm')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.opacity = '0.8'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideDashboard;