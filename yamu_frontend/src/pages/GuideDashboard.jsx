import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import yamuLogo from '../images/yamu-logo.png';
import profileIcon from '../images/profile.png';
import apiClient from "../services/axiosInstance";
import { useUser } from "../context/UserContext";
const RESERVATIONS_STORAGE_KEY = 'guideReservations';

const GuideDashboard = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showPricePrompt, setShowPricePrompt] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);

  const loggedUser = useUser().user;

  useEffect(() => {
    const user = currentUser || JSON.parse(localStorage.getItem("user"));
    const loadReservations = async () => {
      try {
        const savedReservations = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
        if (savedReservations) {
          const parsed = JSON.parse(savedReservations);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReservations(parsed);
          }
        }

        if (user?.id) {
          const response = await apiClient.get(`/api/reservations/guide/${user.id}`);
          const freshData = response.data;
          setReservations(freshData);
          localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(freshData));

          const countResponse = await apiClient.get('/api/messages/unread-count');
          setUnreadCount(countResponse.data);
        } else {
          setError("User information not available. Please login again.");
        }
      } catch (err) {
        console.error("Error loading reservations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [currentUser]);

  const refreshData = async () => {
    try {
      const user = currentUser || JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setError("User information not available. Cannot refresh.");
        return;
      }

      setLoading(true);
      const response = await apiClient.get(`/api/reservations/guide/${user.id}`);
      const freshData = response.data;
      setReservations(freshData);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(freshData));
      setError(null);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClick = (reservationId) => {
    setCurrentReservationId(reservationId);
    setShowPricePrompt(true);
    setEstimatedPrice('');
    setPriceError('');
  };

  const handlePriceSubmit = async () => {
    if (!estimatedPrice) {
      setPriceError('Price is required');
      return;
    }
    
    const priceValue = parseFloat(estimatedPrice);
    if (isNaN(priceValue)) {
      setPriceError('Please enter a valid number');
      return;
    }
    
    if (priceValue <= 0) {
      setPriceError('Price must be positive');
      return;
    }

    try {
      await apiClient.put(`/api/reservations/${currentReservationId}/set-price`, {
        estimatedPrice: priceValue
      });

      const response = await apiClient.put(`/api/reservations/${currentReservationId}/confirm`);
      
      const updatedReservations = reservations.map(res => 
        res.id === currentReservationId ? response.data : res
      );
      
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      setShowPricePrompt(false);
    } catch (err) {
      console.error("Status change failed:", err);
      setError("Failed to update status. Please try again.");
      setShowPricePrompt(false);
    }
  };

  const handleCompleteClick = (reservationId) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const hasFutureDays = reservation.dayDetails?.some(day => {
      const dayDate = new Date(day.date);
      const today = new Date();
      return dayDate > today;
    });

    if (hasFutureDays) {
      setError("Cannot complete reservation with future dates");
      return;
    }

    setCurrentReservationId(reservationId);
    setShowCompletionConfirm(true);
  };

  const handleCompleteConfirm = async () => {
    try {
      const response = await apiClient.put(`/api/reservations/${currentReservationId}/complete`);
      
      const updatedReservations = reservations.map(res => 
        res.id === currentReservationId ? response.data : res
      );
      
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      setShowCompletionConfirm(false);
    } catch (err) {
      console.error("Status change failed:", err);
      setError("Failed to update status. Please try again.");
      setShowCompletionConfirm(false);
    }
  };

  const upcomingReservations = reservations
    .filter(res => res.status !== 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pastReservations = reservations
    .filter(res => res.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const ReservationCard = ({ reservation, isPast = false }) => {
    const statusColors = {
      'PENDING': '#FFA500',
      'CONFIRMED': '#4CAF50',
      'DECLINED': '#F44336',
      'COMPLETED': '#2196F3'
    };

    const handleMessageClick = () => {
      navigate(`/inbox?select=${reservation.traveler?.id}`);
    };

    const MessageButton = () => (
      <button
        onClick={handleMessageClick}
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
          <h4 style={{
            margin: "0 0 5px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#532321"
          }}>Reservation #{reservation.id}</h4>
          <p style={{
            margin: 0,
            color: "#666",
            fontSize: "14px"
          }}>
            Created: {new Date(reservation.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "15px"
        }}>
          <div>
            <h5 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "#532321",
              fontWeight: "500"
            }}>Traveler Details</h5>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Name:</strong> {reservation.traveler?.firstName} {reservation.traveler?.lastName}
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              <strong>Contact:</strong> {reservation.traveler?.contactNumber}
            </p>
          </div>

          <div>
            <h5 style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "#532321",
              fontWeight: "500"
            }}>Tour Details</h5>
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
          <h5 style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            color: "#532321",
            fontWeight: "500"
          }}>Itinerary</h5>
          <div style={{ display: "grid", gap: "10px" }}>
            {reservation.dayDetails?.map((day, index) => (
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
        </div>

        {!isPast && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
            {reservation.status !== 'DECLINED' && <MessageButton />}

            {reservation.status === 'PENDING' && (
              <>
                <button
                  onClick={() => {
                    const response = window.confirm("Are you sure you want to decline this reservation?");
                    if (response) {
                      apiClient.put(`/api/reservations/${reservation.id}/decline`)
                        .then(res => {
                          const updated = reservations.map(r => 
                            r.id === reservation.id ? res.data : r
                          );
                          setReservations(updated);
                          localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updated));
                        });
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#F44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={() => handleConfirmClick(reservation.id)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Confirm
                </button>
              </>
            )}

            {reservation.status === 'CONFIRMED' && (
              <button
                onClick={() => handleCompleteClick(reservation.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Mark as Completed
              </button>
            )}
          </div>
        )}
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
        }} onClick={() => navigate('/')}>
          <img src={yamuLogo} alt="Yamu Logo" style={{ height: "40px" }} />
          <span style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#532321"
          }}>YAMU</span>
        </div>
        
        <div style={{ display: "flex", gap: "30px" }}>
          {['Dashboard', 'Calendar', 'Reviews', 'Emergency Contacts'].map((item) => (
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
              onClick={() => navigate(`/guide-${item.toLowerCase().replace(' ', '-')}`)}
            >
              {item}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative' }}>
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
            aria-label="Inbox"
          >
            <Mail size={20} />
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#532321',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img 
            src={loggedUser.profileImageUrl} 
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
          <h3 style={{
            fontSize: "24px",
            color: "#532321",
            fontWeight: "600",
            margin: 0
          }}>My Tours</h3>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={refreshData} style={{
              padding: "8px 16px",
              backgroundColor: "#f0f0f0",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              <span>↻</span> Refresh
            </button>
            
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
            <p>Loading reservations...</p>
          </div>
        ) : activeTab === 'upcoming' ? (
          <div style={{ display: "grid", gap: "20px" }}>
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map(reservation => (
                <ReservationCard 
                  key={reservation.id}
                  reservation={reservation}
                />
              ))
            ) : (
              <div style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <p>No upcoming reservations found</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {pastReservations.length > 0 ? (
              pastReservations.map(reservation => (
                <ReservationCard 
                  key={reservation.id}
                  reservation={reservation}
                  isPast={true}
                />
              ))
            ) : (
              <div style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <p>No past reservations found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showPricePrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Enter Estimated Price</h3>
            <p>Please provide the estimated cost for this reservation (LKR):</p>
            <input
              type="number"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                margin: '10px 0',
                border: `1px solid ${priceError ? '#F44336' : '#ddd'}`,
                borderRadius: '4px'
              }}
              placeholder="Enter amount in LKR"
            />
            {priceError && (
              <p style={{ color: '#F44336', margin: '5px 0' }}>{priceError}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowPricePrompt(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePriceSubmit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompletionConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Confirm Completion</h3>
            <p>Are you sure you want to mark this reservation as completed?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCompletionConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteConfirm}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Yes, mark as completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboard;