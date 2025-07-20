import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Edit, Trash2, X, Car } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../services/axiosInstance";
import { Layout } from "../components/Layout";
import { useUser } from "../context/UserContext";

const TravelerUpcomingTrips = ({ currentUser }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user: loggedUser } = useUser();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const user = loggedUser || currentUser || JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          setError("User information not available. Please login again.");
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

          return Math.abs(dateA - today) - Math.abs(dateB - today);
        });
        
        setReservations(sortedReservations);

        const countResponse = await apiClient.get('/api/messages/unread-count');
        setUnreadCount(countResponse.data);
      } catch (err) {
        console.error("Error loading reservations:", err);
        setError("Failed to load reservations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [loggedUser, currentUser]);

  const refreshData = async () => {
    try {
      const user = loggedUser || currentUser || JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        setError("User information not available. Cannot refresh.");
        return;
      }

      setLoading(true);
      const response = await apiClient.get(`/api/reservations/traveler/${user.id}`);
      const sortedReservations = response.data.sort((a, b) => {
        const today = new Date();
        const dateA = a.dayDetails && a.dayDetails.length > 0 
          ? new Date(a.dayDetails[0].date) 
          : new Date(a.createdAt);
        const dateB = b.dayDetails && b.dayDetails.length > 0 
          ? new Date(b.dayDetails[0].date) 
          : new Date(b.createdAt);

        return Math.abs(dateA - today) - Math.abs(dateB - today);
      });
      setReservations(sortedReservations);
      setError(null);
    } catch (err) {
      console.error("Refresh failed:", err);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (guideId) => {
    navigate(`/inbox?select=${guideId}`);
  };

  
  const handleEditReservation = (reservation) => {
    navigate('/guides-page', {
      state: {
        editReservation: true,
        reservationData: reservation,
        guideId: reservation.guideId
      }
    });
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      setProcessing(true);
      await apiClient.put(`/api/reservations/${reservationId}/cancel`);
      await refreshData();
      setShowCancelConfirm(null);
      toast.success("Reservation cancelled successfully");
    } catch (err) {
      console.error("Cancellation failed:", err);
      let errorMsg = "Failed to cancel reservation";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Please login to perform this action";
        } else if (err.response.status === 403) {
          errorMsg = "You don't have permission to cancel this reservation";
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveReservation = async (reservationId) => {
    try {
      setProcessing(true);
      await apiClient.delete(`/api/reservations/${reservationId}`);
      await refreshData();
      setShowRemoveConfirm(null);
      toast.success("Reservation removed successfully");
    } catch (err) {
      console.error("Removal failed:", err);
      let errorMsg = "Failed to remove reservation";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Please login to perform this action";
        } else if (err.response.status === 403) {
          errorMsg = "You don't have permission to remove this reservation";
        } else if (err.response.status === 404) {
          errorMsg = "Reservation not found";
        } else if (err.response.data?.message) {
          errorMsg = err.response.data.message;
        }
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const statusColors = {
    'PENDING': '#FFA500',
    'CONFIRMED': '#4CAF50',
    'DECLINED': '#F44336',
    'COMPLETED': '#2196F3',
    'CANCELLED': '#F44336'
   
  };

  const upcomingReservations = reservations.filter(res => res.status !== 'COMPLETED');
  const pastReservations = reservations.filter(res => res.status === 'COMPLETED');

  const VehicleInfo = ({ vehicle }) => {
    if (!vehicle) return null;

    return (
      <div style={{
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#f0f8ff",
        borderRadius: "4px",
        borderLeft: "3px solid #2196F3"
      }}>
        <p style={{ margin: "4px 0", fontWeight: "500" }}>
          <Car size={14} style={{ marginRight: "5px" }} />
          {vehicle.type} {vehicle.model}
        </p>
        <div style={{ display: "flex", gap: "15px", fontSize: "12px" }}>
          <span>Capacity: {vehicle.capacity}</span>
          <span>{vehicle.airConditioned ? 'AC Available' : 'No AC'}</span>
        </div>
        {vehicle.vehicleImageUrl && (
          <img 
            src={vehicle.vehicleImageUrl} 
            alt={`${vehicle.type} ${vehicle.model}`}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '150px', 
              marginTop: '10px',
              borderRadius: '4px'
            }}
          />
        )}
      </div>
    );
  };

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
                <strong>Estimated Price:</strong> {selectedCurrency} {reservation.estimatedPrice.toLocaleString()}
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
                    Day {day.dayNumber}: {day.places}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "13px" }}>
                    <strong>Date:</strong> {new Date(day.date).toLocaleDateString()}
                  </p>
                  {day.vehicleRequested && (
                    <>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>
                        <strong>Vehicle Requested:</strong> Yes
                      </p>
                      {day.selectedVehicle && (
                        <VehicleInfo vehicle={day.selectedVehicle} />
                      )}
                      {day.vehicleDetails && (
                        <p style={{ margin: "4px 0", fontSize: "13px" }}>
                          <strong>Special Requirements:</strong> {day.vehicleDetails}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#999", fontStyle: "italic" }}>No itinerary details available</p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          {reservation.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleEditReservation(reservation)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setShowCancelConfirm(reservation.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#F44336"
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
          
          {(reservation.status === 'DECLINED' || reservation.status === 'CANCELLED') && (
            <button
              onClick={() => setShowRemoveConfirm(reservation.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#F44336"
              }}
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
          
          {reservation.status === 'CONFIRMED' && (
            <button
              onClick={() => setShowCancelConfirm(reservation.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#F44336"
              }}
            >
              <X size={16} />
              Cancel
            </button>
          )}
          
          {reservation.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleEditReservation(reservation)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setShowCancelConfirm(reservation.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#F44336"
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
          
          {(reservation.status === 'DECLINED' || reservation.status === 'CANCELLED') && (
            <button
              onClick={() => setShowRemoveConfirm(reservation.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#F44336"
              }}
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
          
          {reservation.status === 'CONFIRMED' && (
            <button
              onClick={() => setShowCancelConfirm(reservation.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#F44336"
              }}
            >
              <X size={16} />
              Cancel
            </button>
          )}
          
          {reservation.guideId && (
            <button
              onClick={() => handleMessageClick(reservation.guideId)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Mail size={16} />
              Message
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout 
      user={loggedUser || currentUser}
      unreadCount={unreadCount}
      onCurrencyChange={setSelectedCurrency}
      selectedCurrency={selectedCurrency}
      navigate={navigate}
    >
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
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
            }}>{activeTab === 'upcoming' ? 'My Upcoming Trips' : 'My Past Trips'}</h3>

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
              <p>Loading your trips...</p>
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
                  <p>No past trips found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {showCancelConfirm && (
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
              <h3 style={{ marginTop: 0 }}>Cancel Reservation</h3>
              <p>Are you sure you want to cancel this reservation?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => handleCancelReservation(showCancelConfirm)}
                  disabled={processing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRemoveConfirm && (
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
              <h3 style={{ marginTop: 0 }}>Remove Reservation</h3>
              <p>Are you sure you want to remove this reservation from your list?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => setShowRemoveConfirm(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => handleRemoveReservation(showRemoveConfirm)}
                  disabled={processing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: processing ? 0.7 : 1
                  }}
                >
                  {processing ? 'Removing...' : 'Yes, Remove'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TravelerUpcomingTrips;