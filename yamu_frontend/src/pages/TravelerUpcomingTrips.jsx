import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import yamuLogo from '../images/yamu-logo.png';
import profileIcon from '../images/profile.png';
import apiClient from "../services/axiosInstance";

const TravelerUpcomingTrips = ({ currentUser }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Use local variable, don't assign to prop
        let user = currentUser || JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          setError("User information not available. Please login again.");
          setLoading(false);
          return;
        }

        const response = await apiClient.get(`/api/reservations/traveler/${user.id}`);
        
        const sortedReservations = response.data.sort((a, b) => {
          const today = new Date();
          const dateA = a.dayDetails && a.dayDetails.length > 0 
            ? new Date(a.dayDetails[0].date) 
            : new Date(a.createdAt);
          const dateB = b.dayDetails && b.dayDetails.length > 0 
            ? new Date(b.dayDetails[0].date) 
            : new Date(b.createdAt);

          // Sort by proximity to today's date
          return Math.abs(dateA - today) - Math.abs(dateB - today);
        });
        
        setReservations(sortedReservations);
      } catch (err) {
        console.error("Error loading reservations:", err);
        setError("Failed to load reservations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    
  }, [currentUser]);
  

  const handleMessageClick = (guideId) => {
    navigate(`/inbox?select=${guideId}`);
  };

  const MessageButton = ({ guideId }) => (
    <button
      onClick={() => handleMessageClick(guideId)}
      style={{
        padding: "8px 16px",
        backgroundColor: "#f0f0f0",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        transition: "all 0.2s ease"
      }}
    >
      <Mail size={16} />
      Message
    </button>
  );

  const statusColors = {
    'PENDING': '#FFA500',
    'CONFIRMED': '#4CAF50',
    'DECLINED': '#F44336',
    'COMPLETED': '#2196F3',
    'CANCELLED': '#9E9E9E'
  };

  const upcomingReservations = reservations.filter(res => res.status !== 'COMPLETED');
  const pastReservations = reservations.filter(res => res.status === 'COMPLETED');

  const ReservationCard = ({ reservation }) => {
    const firstDayDate = reservation.dayDetails && reservation.dayDetails.length > 0
      ? new Date(reservation.dayDetails[0].date)
      : new Date(reservation.createdAt);

    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "20px",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "4px 8px",
          borderRadius: "4px",
          color: "white",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: statusColors[reservation.status] || '#9E9E9E'
        }}>
          {reservation.status}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{
            margin: "0 0 5px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#532321"
          }}>Reservation #{reservation.id}</h3>
          <p style={{
            margin: "4px 0",
            color: "#666",
            fontSize: "14px"
          }}>
            <strong>Trip Date:</strong> {firstDayDate.toLocaleDateString()}
          </p>
          <p style={{
            margin: "4px 0",
            color: "#666",
            fontSize: "14px"
          }}>
            <strong>Created:</strong> {new Date(reservation.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "15px"
        }}>
          <div>
            <h4 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "#532321",
              fontWeight: "500"
            }}>Guide Details</h4>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Name:</strong> {reservation.guideName || 'Not available'}
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Contact:</strong> {reservation.guideContact || 'Not available'}
            </p>
          </div>

          <div>
            <h4 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "#532321",
              fontWeight: "500"
            }}>Tour Details</h4>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Days:</strong> {reservation.numberOfDays}
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Travelers:</strong> {reservation.dayDetails?.[0]?.numberOfTravelers || 'N/A'}
            </p>
            {reservation.estimatedPrice && (
              <p style={{
                margin: "4px 0",
                fontSize: "14px",
                color: "#2196F3",
                fontWeight: "bold"
              }}>
                <strong>Estimated Price:</strong> LKR {reservation.estimatedPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            color: "#532321",
            fontWeight: "500"
          }}>Itinerary</h4>
          {reservation.dayDetails && reservation.dayDetails.length > 0 ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {reservation.dayDetails.map((day, index) => (
                <div key={index} style={{
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px"
                }}>
                  <p style={{ margin: "4px 0", fontWeight: "500" }}>
                    Day {day.dayNumber}: {day.place}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}>
                    <strong>Date:</strong> {new Date(day.date).toLocaleDateString()}
                  </p>
                  {day.vehicleRequested && (
                    <p style={{ margin: "4px 0", fontSize: "13px" }}>
                      <strong>Vehicle:</strong> {day.vehicleDetails || 'No details'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#999", fontStyle: "italic" }}>No itinerary details available</p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          {reservation.guideId && (
            <MessageButton guideId={reservation.guideId} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
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
        }} onClick={() => navigate('/traveler-dashboard')}>
          <img src={yamuLogo} alt="Yamu Logo" style={{ height: "40px" }} />
          <span style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#532321"
          }}>YAMU</span>
        </div>
        
        <div style={{ display: "flex", gap: "30px" }}>
          {['Dashboard', 'Hotels', 'Guides', 'Places', 'Emergency Contacts'].map((item) => (
            <button
              key={item}
              style={{
                background: "none",
                border: "none",
                color: "#333",
                fontSize: "16px",
                cursor: "pointer",
                padding: "5px 10px"
              }}
              onClick={() => navigate(`/traveler-${item.toLowerCase().replace(' ', '-')}`)}
            >
              {item}
            </button>
          ))}
          <button
            style={{
              background: "none",
              border: "none",
              color: "#333",
              fontSize: "16px",
              cursor: "pointer",
              padding: "5px 10px"
            }}
            onClick={() => navigate('/inbox')}
          >
            <Mail size={20} />
          </button>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img 
            src={profileIcon} 
            alt="Profile" 
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

      <div style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h2 style={{
            fontSize: "28px",
            color: "#532321",
            fontWeight: "600",
            margin: 0
          }}>{activeTab === 'upcoming' ? 'My Upcoming Trips' : 'My Past Trips'}</h2>
          
          <div style={{
            display: "flex",
            gap: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            padding: "4px"
          }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: activeTab === 'upcoming' ? "#532321" : "transparent",
                color: activeTab === 'upcoming' ? "white" : "#333",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: activeTab === 'past' ? "#532321" : "transparent",
                color: activeTab === 'past' ? "white" : "#333",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Past
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: "15px",
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px"
          }}>
            <p>Loading your trips...</p>
          </div>
        ) : activeTab === 'upcoming' ? (
          <div style={{ display: "grid", gap: "20px" }}>
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            ) : (
              <div style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <p>No upcoming trips found. Start by booking a guide!</p>
                <button
                  onClick={() => navigate('/guides-page')}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#532321",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Find Guides
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {pastReservations.length > 0 ? (
              pastReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            ) : (
              <div style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <p>No past trips found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelerUpcomingTrips;