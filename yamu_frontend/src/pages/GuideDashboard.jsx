import React, { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";

import yamuLogo from '../images/yamu-logo.png';
import apiClient from "../services/axiosInstance";

import { useUser } from "../context/UserContext";
import { Layout } from "../components/Layout";

const RESERVATIONS_STORAGE_KEY = 'guideReservations';

const GuideDashboard = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedCurrency, setSelectedCurrency] = useState('LKR');

  const loggedUser = useUser().user;


  useEffect(() => {
    currentUser = JSON.parse(localStorage.getItem("user"));
    const loadReservations = async () => {
      try {
        const savedReservations = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
        if (savedReservations) {
          const parsed = JSON.parse(savedReservations);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReservations(parsed);
          }
        }

        if (currentUser?.id) {
          const response = await apiClient.get(`/api/reservations/guide/${currentUser.id}`);
          const freshData = response.data;
          setReservations(freshData);
          localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(freshData));

          // Fetch unread message count
          const countResponse = await apiClient.get('/api/messages/unread-count');
          setUnreadCount(countResponse.data);
        } else {
          setError("User information not available. Please login again.");
        }
      } catch (err) {
        console.error("Error loading reservations:", err);
        //setError("Failed to load reservations. Showing cached data if available.");
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [currentUser]);

  const refreshData = async () => {
    try {
      currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) {
        setError("User information not available. Cannot refresh.");
        return;
      }

      setLoading(true);
      const response = await apiClient.get(`/api/reservations/guide/${currentUser.id}`);
      const freshData = response.data;
      setReservations(freshData);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(freshData));
      setError(null);
    } catch (err) {
      console.error("Refresh failed:", err);
      //setError("Failed to refresh. Showing cached data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      currentUser = JSON.parse(localStorage.getItem("user"));currentUser = JSON.parse(localStorage.getItem("user"));
      if (!currentUser?.id) {
        setError("User information not available. Cannot update status.");
        return;
      }

      let endpoint;
      switch (newStatus) {
        case 'CONFIRMED': endpoint = 'confirm'; break;
        case 'DECLINED': endpoint = 'decline'; break;
        case 'COMPLETED': endpoint = 'complete'; break;
        default: return;
      }

      const response = await apiClient.put(`/api/reservations/${reservationId}/${endpoint}`);
      const updatedReservations = reservations.map(res =>
        res.id === reservationId ? response.data : res
      );
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
    } catch (err) {
      console.error("Status change failed:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const upcomingReservations = reservations
    .filter(res => res.status !== 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pastReservations = reservations
    .filter(res => res.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


  const ReservationCard = ({ reservation, onStatusChange, isPast = false }) => {
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
                  Day {day.dayNumber}: {day.places}
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
                  onClick={() => onStatusChange(reservation.id, 'DECLINED')}
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
                  onClick={() => onStatusChange(reservation.id, 'CONFIRMED')}
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
                onClick={() => onStatusChange(reservation.id, 'COMPLETED')}
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
    <Layout
      user={loggedUser}
      unreadCount={unreadCount}
      onCurrencyChange={setSelectedCurrency}
      selectedCurrency={selectedCurrency}
    >

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
                  onStatusChange={handleStatusChange}
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
    </Layout>
  );
};

const ReservationCard = ({ reservation, onStatusChange, isPast = false }) => {
  const statusColors = {
    'PENDING': '#FFA500',
    'CONFIRMED': '#4CAF50',
    'DECLINED': '#F44336',
    'COMPLETED': '#2196F3'
  };

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
                Day {day.dayNumber}: {day.places}
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
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px"
        }}>
          {reservation.status === 'PENDING' && (
            <>
              <button
                onClick={() => onStatusChange(reservation.id, 'CONFIRMED')}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  ':hover': {
                    backgroundColor: "#3e8e41"
                  }
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => onStatusChange(reservation.id, 'DECLINED')}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#F44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  ':hover': {
                    backgroundColor: "#d32f2f"
                  }
                }}
              >
                Decline
              </button>
            </>
          )}
          
          {reservation.status === 'CONFIRMED' && (
            <button
              onClick={() => onStatusChange(reservation.id, 'COMPLETED')}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                ':hover': {
                  backgroundColor: "#1976D2"
                }
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

export default GuideDashboard;