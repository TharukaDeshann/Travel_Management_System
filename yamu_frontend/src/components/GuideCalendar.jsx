import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Layout } from "../components/Layout";
import apiClient from "../services/axiosInstance";
import { refreshToken, fetchLoggedInUser } from "../services/authService";

const GuideCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    type: "TOUR",
    travelerName: "",
    place: "",
    timePeriod: ""
  });
  const [lastClickedDate, setLastClickedDate] = useState(null);

  const tourData = [
    { month: "Jan", tours: 10 },
    { month: "Feb", tours: 25 },
    { month: "Mar", tours: 36 },
    { month: "Apr", tours: 50 },
    { month: "May", tours: 65 },
    { month: "Jun", tours: 60 },
    { month: "Jul", tours: 70 },
    { month: "Aug", tours: 0 },
    { month: "Sep", tours: 0 },
    { month: "Oct", tours: 20 },
    { month: "Nov", tours: 0 },
    { month: "Dec", tours: 70 },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await fetchLoggedInUser();
        setCurrentUser(user);
        await fetchReservations();
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadData();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await apiClient.get("/api/guide/reservations");
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          const retryResponse = await apiClient.get("/api/guide/reservations");
          setReservations(retryResponse.data);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      }
    }
  };

  const formatDateForComparison = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const formatDateForDisplay = (date) => {
    const localDate = new Date(date);
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleDateClick = (date) => {
    const clickedDate = new Date(date);
    setSelectedDate(clickedDate);
    setLastClickedDate(clickedDate);
    
    const formattedClickedDate = formatDateForComparison(clickedDate);
    const reservation = reservations.find(res => 
      res.date === formattedClickedDate
    );

    if (reservation) {
      setSelectedReservation(reservation);
      setShowViewModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setShowDeleteConfirm(false);
    setLastClickedDate(null);
  };

  const handleConfirmReservation = () => {
    setShowConfirmModal(false);
    setShowDetailsModal(true);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const classes = [];
    const currentDate = new Date();
    const tileDate = new Date(date);
    const formattedTileDate = formatDateForComparison(tileDate);
    
    if (
      tileDate.getDate() === currentDate.getDate() &&
      tileDate.getMonth() === currentDate.getMonth() &&
      tileDate.getFullYear() === currentDate.getFullYear()
    ) {
      classes.push('today-date');
    }
    
    if (lastClickedDate && 
        tileDate.getDate() === lastClickedDate.getDate() &&
        tileDate.getMonth() === lastClickedDate.getMonth() &&
        tileDate.getFullYear() === lastClickedDate.getFullYear()
    ) {
      classes.push('selected-date');
    }
    
    const isReserved = reservations.some(res => 
      res.date === formattedTileDate
    );
    
    if (isReserved) {
      classes.push('reserved-date');
    }
    
    return classes.join(' ');
  };

  const handleReserveSubmit = async () => {
    try {
      const formattedDate = formatDateForComparison(selectedDate);
      await apiClient.post("/api/guide/reservations", {
        date: formattedDate,
        ...reservationForm
      });
      fetchReservations();
      setShowDetailsModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create reservation:", error);
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          const formattedDate = formatDateForComparison(selectedDate);
          await apiClient.post("/api/guide/reservations", {
            date: formattedDate,
            ...reservationForm
          });
          fetchReservations();
          setShowDetailsModal(false);
          resetForm();
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      }
    }
  };

  const handleDeleteReservation = async () => {
    try {
      await apiClient.delete(`/api/guide/reservations/${selectedReservation.id}`);
      fetchReservations();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      if (error.response?.status === 401) {
        try {
          await refreshToken();
          await apiClient.delete(`/api/guide/reservations/${selectedReservation.id}`);
          fetchReservations();
          handleCloseModal();
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      }
    }
  };

  const resetForm = () => {
    setReservationForm({
      type: "TOUR",
      travelerName: "",
      place: "",
      timePeriod: ""
    });
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '10px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
    padding: '20px'
  };

  const modalHeaderStyle = {
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee'
  };

  const modalTitleStyle = {
    margin: 0,
    color: '#2c3e50',
    fontSize: '20px',
    fontWeight: '600'
  };

  const modalFooterStyle = {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#555',
    border: '1px solid #ddd'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none'
  };

  const formGroupStyle = {
    marginBottom: '15px'
  };

  const formLabelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#2c3e50'
  };

  const formControlStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '16px'
  };

  const calendarStyles = `
    .react-calendar {
      width: 100%;
      max-width: 800px;
      border: none;
      border-radius: 10px;
      padding: 15px;
      background-color: #fff;
      box-shadow: 0 2px 15px rgba(0,0,0,0.05);
    }
    
    .react-calendar__tile--now {
      background: transparent !important;
    }
    
    .today-date {
      background-color: #ffff76 !important;
      color: #000 !important;
      border-radius: 50%;
    }
    
    .selected-date {
      background-color: #e6e6e6 !important;
      border-radius: 50%;
    }
    
    .reserved-date {
      background-color: #007bff !important;
      color: white !important;
      border-radius: 50%;
    }
    
    .react-calendar__tile--active {
      background: transparent !important;
    }
    
    .react-calendar__tile {
      color: #000;
    }
    
    .reserved-date .react-calendar__tile-content {
      color: white;
    }
  `;

  return (
    <Layout 
      user={currentUser || {}} 
      unreadCount={0} // You can pass actual unread count from your state
      onCurrencyChange={() => {}} // Add currency change handler if needed
      selectedCurrency="LKR" // Set default currency
    >
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f5f7fa',
        minHeight: '100vh'
      }}>
        <style>{calendarStyles}</style>

        <div style={{ 
          backgroundColor: '#fff', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '25px',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px'
          }}>Guide Calendar</h2>
          
          <div style={{ 
            margin: '25px 0',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px'
          }}>
            <Calendar
              onChange={setDate}
              value={date}
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
            />
          </div>

          <h2 style={{ 
            color: '#2c3e50', 
            margin: '30px 0 20px 0',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px'
          }}>Year Plan</h2>
          <div style={{ 
            height: '350px', 
            marginBottom: '40px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 15px rgba(0,0,0,0.05)'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tourData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#7f8c8d' }}
                />
                <YAxis 
                  tick={{ fill: '#7f8c8d' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                />
                <Bar 
                  dataKey="tours" 
                  fill="#3498db" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {showConfirmModal && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                  <h3 style={modalTitleStyle}>Reserve Date</h3>
                </div>
                <p style={{ marginBottom: '20px' }}>
                  Do you want to reserve {formatDateForDisplay(selectedDate)}?
                </p>
                <div style={modalFooterStyle}>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmReservation}
                    style={primaryButtonStyle}
                  >
                    Yes, Reserve
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDetailsModal && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                  <h3 style={modalTitleStyle}>Reservation Details</h3>
                </div>
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}>Reservation Type</label>
                  <select
                    value={reservationForm.type}
                    onChange={(e) => setReservationForm({...reservationForm, type: e.target.value})}
                    style={formControlStyle}
                  >
                    <option value="TOUR">Tour Reservation</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>

                {reservationForm.type === "TOUR" && (
                  <>
                    <div style={formGroupStyle}>
                      <label style={formLabelStyle}>Traveler Name</label>
                      <input
                        type="text"
                        value={reservationForm.travelerName}
                        onChange={(e) => setReservationForm({...reservationForm, travelerName: e.target.value})}
                        style={formControlStyle}
                        placeholder="Enter traveler's name"
                      />
                    </div>
                    <div style={formGroupStyle}>
                      <label style={formLabelStyle}>Place</label>
                      <input
                        type="text"
                        value={reservationForm.place}
                        onChange={(e) => setReservationForm({...reservationForm, place: e.target.value})}
                        style={formControlStyle}
                        placeholder="Enter location"
                      />
                    </div>
                    <div style={formGroupStyle}>
                      <label style={formLabelStyle}>Time Period</label>
                      <input
                        type="text"
                        value={reservationForm.timePeriod}
                        onChange={(e) => setReservationForm({...reservationForm, timePeriod: e.target.value})}
                        style={formControlStyle}
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                      />
                    </div>
                  </>
                )}
                <div style={modalFooterStyle}>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReserveSubmit}
                    style={primaryButtonStyle}
                  >
                    Confirm Reservation
                  </button>
                </div>
              </div>
            </div>
          )}

          {showViewModal && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                  <h3 style={modalTitleStyle}>Reservation Details</h3>
                </div>
                {selectedReservation && (
                  <div>
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontWeight: '600', color: '#2c3e50' }}>Date: </span>
                      <span>{formatDateForDisplay(selectedReservation.date)}</span>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ fontWeight: '600', color: '#2c3e50' }}>Type: </span>
                      <span>{selectedReservation.type}</span>
                    </div>
                    
                    {selectedReservation.type === "TOUR" && (
                      <>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ fontWeight: '600', color: '#2c3e50' }}>Traveler: </span>
                          <span>{selectedReservation.travelerName}</span>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ fontWeight: '600', color: '#2c3e50' }}>Place: </span>
                          <span>{selectedReservation.place}</span>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <span style={{ fontWeight: '600', color: '#2c3e50' }}>Time: </span>
                          <span>{selectedReservation.timePeriod}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div style={modalFooterStyle}>
                  <button 
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                    style={dangerButtonStyle}
                  >
                    Remove Reservation
                  </button>
                  <button 
                    onClick={handleCloseModal}
                    style={secondaryButtonStyle}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                <div style={modalHeaderStyle}>
                  <h3 style={modalTitleStyle}>Confirm Removal</h3>
                </div>
                <p style={{ marginBottom: '20px' }}>
                  Are you sure you want to remove this reservation for {selectedReservation && formatDateForDisplay(selectedReservation.date)}?
                </p>
                <div style={modalFooterStyle}>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteReservation}
                    style={dangerButtonStyle}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GuideCalendar;