import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import yamuLogo from '../images/yamu-logo.png';
import profileIcon from '../images/profile.png';
import apiClient from "../services/axiosInstance";
import { getTravelerBookings } from '../services/hotelService';
import { transportationService } from '../services/transportationService';

const TravelerUpcomingTrips = ({ currentUser }) => {
  const [reservations, setReservations] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [transportBookings, setTransportBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        currentUser = JSON.parse(localStorage.getItem("user"));
        if (!currentUser?.id) {
          setError("User information not available. Please login again.");
          return;
        }

        // Fetch all data in parallel
        const [reservationsResponse, hotelBookingsData, transportBookingsData] = await Promise.all([
          apiClient.get(`/api/reservations/traveler/${currentUser.id}`),
          getTravelerBookings(currentUser.id).catch(err => {
            console.error('Failed to load hotel bookings:', err);
            return [];
          }),
          transportationService.getTravelerBookings(currentUser.id).catch(err => {
            console.error('Failed to load transport bookings:', err);
            return [];
          })
        ]);
        
        const sortedReservations = reservationsResponse.data.sort((a, b) => {
          const dateA = a.dayDetails && a.dayDetails.length > 0 
            ? new Date(a.dayDetails[0].date) 
            : new Date(a.createdAt);
          const dateB = b.dayDetails && b.dayDetails.length > 0 
            ? new Date(b.dayDetails[0].date) 
            : new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setReservations(sortedReservations);
        setHotelBookings(hotelBookingsData);
        setTransportBookings(transportBookingsData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load trip information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleCancelReservation = async (reservationId) => {
    try {
      await apiClient.put(`/api/reservations/${reservationId}/decline`);
      setReservations(reservations.map(res => 
        res.id === reservationId ? { ...res, status: 'DECLINED' } : res
      ));
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      setError("Failed to cancel reservation. Please try again.");
    }
  };

  const handleMessageClick = (guideId) => {
    navigate(`/inbox?select=${guideId}`);
  };

  // Function to get hotel bookings for a specific date
  const getHotelBookingsForDate = (date) => {
    const targetDate = new Date(date);
    return hotelBookings.filter(booking => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      return targetDate >= checkInDate && targetDate <= checkOutDate && booking.bookingStatus !== 'CANCELLED';
    });
  };

  // Function to get transport bookings for a specific date
  const getTransportBookingsForDate = (date) => {
    const targetDate = new Date(date).toDateString();
    return transportBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate).toDateString();
      return bookingDate === targetDate && booking.status !== 'CANCELLED';
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        transition: "all 0.2s ease",
        ':hover': {
          backgroundColor: "#e0e0e0"
        }
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
    'COMPLETED': '#2196F3'
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
                padding: "5px 10px",
                ':hover': {
                  color: "#532321"
                }
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
              padding: "5px 10px",
              ':hover': {
                color: "#532321"
              }
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
        <h2 style={{
          fontSize: "28px",
          color: "#532321",
          fontWeight: "600",
          marginBottom: "30px"
        }}>My Upcoming Trips</h2>

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
        ) : reservations.length === 0 ? (
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
                cursor: "pointer",
                ':hover': {
                  backgroundColor: "#3a1817"
                }
              }}
            >
              Find Guides
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {reservations.map(reservation => {
              const firstDayDate = reservation.dayDetails && reservation.dayDetails.length > 0
                ? new Date(reservation.dayDetails[0].date)
                : new Date(reservation.createdAt);
              
              return (
                <div key={reservation.id} style={{
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
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{
                      margin: "0 0 8px 0",
                      fontSize: "14px",
                      color: "#532321",
                      fontWeight: "500"
                    }}>Itinerary & Bookings</h4>
                    {reservation.dayDetails && reservation.dayDetails.length > 0 ? (
                      <div style={{ display: "grid", gap: "10px" }}>
                        {reservation.dayDetails.map((day, index) => {
                          const dayHotelBookings = getHotelBookingsForDate(day.date);
                          const dayTransportBookings = getTransportBookingsForDate(day.date);
                          
                          return (
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
                              
                              {/* Hotel Bookings for this date */}
                              {dayHotelBookings.length > 0 && (
                                <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
                                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: "500", color: "#1976d2" }}>
                                    🏨 Hotel Bookings:
                                  </p>
                                  {dayHotelBookings.map((booking, idx) => (
                                    <div key={idx} style={{ fontSize: "11px", color: "#1565c0", marginBottom: "2px" }}>
                                      • {booking.hotel?.name || booking.hotelName} - {booking.roomType} 
                                      ({formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)})
                                      <span style={{ color: booking.bookingStatus === 'CONFIRMED' ? '#4caf50' : '#ff9800', marginLeft: '4px' }}>
                                        [{booking.bookingStatus}]
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Transport Bookings for this date */}
                              {dayTransportBookings.length > 0 && (
                                <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "#f3e5f5", borderRadius: "4px" }}>
                                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: "500", color: "#7b1fa2" }}>
                                    🚗 Transport Bookings:
                                  </p>
                                  {dayTransportBookings.map((booking, idx) => (
                                    <div key={idx} style={{ fontSize: "11px", color: "#6a1b9a", marginBottom: "2px" }}>
                                      • {booking.driver?.name || 'Driver'} - {booking.driver?.vehicleType} {booking.driver?.vehicleNumber}
                                      {booking.startLocationName && booking.endLocationName && (
                                        <span> ({booking.startLocationName} → {booking.endLocationName})</span>
                                      )}
                                      <span style={{ color: booking.status === 'BOOKED' ? '#4caf50' : '#ff5722', marginLeft: '4px' }}>
                                        [{booking.status}]
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ color: "#999", fontStyle: "italic" }}>No itinerary details available</p>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    {reservation.guideId && (
                      <MessageButton guideId={reservation.guideId} />
                    )}
                    {reservation.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#F44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          ':hover': {
                            backgroundColor: "#d32f2f"
                          }
                        }}
                      >
                        Cancel Reservation
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/reservations')}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        ':hover': {
                          backgroundColor: "#1976D2"
                        }
                      }}
                    >
                      Manage Bookings
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelerUpcomingTrips;