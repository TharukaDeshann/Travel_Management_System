import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Trash2, X, Car } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../services/axiosInstance";
import { useUser } from "../context/UserContext";
import { Layout } from "../components/Layout";

const RESERVATIONS_STORAGE_KEY = 'guideReservations';

const GuideDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const { user: loggedUser } = useUser();

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const savedReservations = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
        if (savedReservations) {
          const parsed = JSON.parse(savedReservations);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReservations(parsed);
          }
        }

        if (loggedUser?.id) {
          const response = await apiClient.get(`/api/reservations/guide/${loggedUser.id}`);
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
        setError("Failed to load reservations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [loggedUser]);

  const refreshData = async () => {
    try {
      if (!loggedUser?.id) {
        setError("User information not available. Cannot refresh.");
        return;
      }

      setLoading(true);
      const response = await apiClient.get(`/api/reservations/guide/${loggedUser.id}`);
      const freshData = response.data;
      setReservations(freshData);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(freshData));
      setError(null);
    } catch (err) {
      console.error("Refresh failed:", err);
      setError("Failed to refresh data. Please try again.");
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
      toast.success("Reservation confirmed successfully");
      toast.success("Reservation confirmed successfully");
    } catch (err) {
      console.error("Status change failed:", err);
      setError("Failed to update status. Please try again.");
      toast.error("Failed to confirm reservation");
      toast.error("Failed to confirm reservation");
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
      toast.error("Cannot complete reservation with future dates");
      toast.error("Cannot complete reservation with future dates");
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
      toast.success("Reservation marked as completed");
      toast.success("Reservation marked as completed");
    } catch (err) {
      console.error("Status change failed:", err);
      setError("Failed to update status. Please try again.");
      toast.error("Failed to complete reservation");
      toast.error("Failed to complete reservation");
      setShowCompletionConfirm(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      setProcessing(true);
      const response = await apiClient.put(`/api/reservations/${currentReservationId}/cancel`);
      const updatedReservations = reservations.map(res =>
        res.id === currentReservationId ? response.data : res
      );
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      setShowCancelConfirm(false);
      toast.success("Reservation cancelled successfully");
    } catch (err) {
      console.error("Cancellation failed:", err);
      setError("Failed to cancel reservation. Please try again.");
      toast.error("Failed to cancel reservation");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveReservation = async () => {
    try {
      setProcessing(true);
      await apiClient.delete(`/api/reservations/${currentReservationId}`);
      const updatedReservations = reservations.filter(r => r.id !== currentReservationId);
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      setShowRemoveConfirm(false);
      toast.success("Reservation removed successfully");
    } catch (err) {
      console.error("Removal failed:", err);
      setError("Failed to remove reservation. Please try again.");
      toast.error("Failed to remove reservation");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      setProcessing(true);
      const response = await apiClient.put(`/api/reservations/${currentReservationId}/cancel`);
      const updatedReservations = reservations.map(res =>
        res.id === currentReservationId ? response.data : res
      );
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      setShowCancelConfirm(false);
      toast.success("Reservation cancelled successfully");
    } catch (err) {
      console.error("Cancellation failed:", err);
      setError("Failed to cancel reservation. Please try again.");
      toast.error("Failed to cancel reservation");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveReservation = async () => {
    try {
      setProcessing(true);
      await apiClient.delete(`/api/reservations/${currentReservationId}`);
      const updatedReservations = reservations.filter(r => r.id !== currentReservationId);
      setReservations(updatedReservations);
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(updatedReservations));
      setShowRemoveConfirm(false);
      toast.success("Reservation removed successfully");
    } catch (err) {
      console.error("Removal failed:", err);
      setError("Failed to remove reservation. Please try again.");
      toast.error("Failed to remove reservation");
    } finally {
      setProcessing(false);
    }
  };

  const upcomingReservations = reservations
    .filter(res => res.status !== 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pastReservations = reservations
    .filter(res => res.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
          <span>Status: {vehicle.available ? 'Available' : 'Unavailable'}</span>
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

  const ReservationCard = ({ reservation, isPast = false }) => {
    const statusColors = {
      'PENDING': '#FFA500',
      'CONFIRMED': '#4CAF50',
      'DECLINED': '#F44336',
      'COMPLETED': '#2196F3',
      'CANCELLED': '#F44336'
      'COMPLETED': '#2196F3',
      'CANCELLED': '#F44336'
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
                <strong>Estimated Price:</strong> {selectedCurrency} {reservation.estimatedPrice.toLocaleString()}
              </p>
            )}
          </div>
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
                <strong>Estimated Price:</strong> {selectedCurrency} {reservation.estimatedPrice.toLocaleString()}
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
        </div>

        {!isPast && (
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            alignItems: "center"
          }}>
            {reservation.status !== 'DECLINED' && reservation.status !== 'CANCELLED' && <MessageButton />}
        {!isPast && (
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            alignItems: "center"
          }}>
            {reservation.status !== 'DECLINED' && reservation.status !== 'CANCELLED' && <MessageButton />}

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
                          toast.success("Reservation declined");
                        })
                        .catch(err => {
                          console.error("Failed to decline reservation:", err);
                          setError("Failed to decline reservation. Please try again.");
                          toast.error("Failed to decline reservation");
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

            {(reservation.status === 'DECLINED' || reservation.status === 'CANCELLED') && (
              <button
                onClick={() => {
                  setCurrentReservationId(reservation.id);
                  setShowRemoveConfirm(true);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  color: "#F44336",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
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
                          toast.success("Reservation declined");
                        })
                        .catch(err => {
                          console.error("Failed to decline reservation:", err);
                          setError("Failed to decline reservation. Please try again.");
                          toast.error("Failed to decline reservation");
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

            {(reservation.status === 'DECLINED' || reservation.status === 'CANCELLED') && (
              <button
                onClick={() => {
                  setCurrentReservationId(reservation.id);
                  setShowRemoveConfirm(true);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  color: "#F44336",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}

            {reservation.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => {
                    setCurrentReservationId(reservation.id);
                    setShowCancelConfirm(true);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f0f0f0",
                    color: "#F44336",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
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
              </>
            )}
          </div>
        )}
            {reservation.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => {
                    setCurrentReservationId(reservation.id);
                    setShowCancelConfirm(true);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f0f0f0",
                    color: "#F44336",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
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
              </>
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
      navigate={navigate}
      location={location}
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
                  Submit
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
                  onClick={() => setShowCancelConfirm(false)}
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
                  onClick={handleCancelReservation}
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
                  onClick={() => setShowRemoveConfirm(false)}
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
                  onClick={handleRemoveReservation}
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
                  onClick={() => setShowCancelConfirm(false)}
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
                  onClick={handleCancelReservation}
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
                  onClick={() => setShowRemoveConfirm(false)}
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
                  onClick={handleRemoveReservation}
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

export default GuideDashboard;