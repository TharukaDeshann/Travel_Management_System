import React, { useState } from 'react';
import axios from 'axios';
import '../styles/VisitPlanner.css';

const VisitPlanner = () => {
  const [visits, setVisits] = useState([]);
  const [newVisit, setNewVisit] = useState({
    place: '',
    date: '',
  });
  const [weatherData, setWeatherData] = useState(null);
  const [selectedVisitIndex, setSelectedVisitIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add the new visit to the list
    setVisits([...visits, newVisit]);
    
    // Check if the date is within the next 5 days
    const visitDate = new Date(newVisit.date);
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);

    if (visitDate <= fiveDaysFromNow && visitDate >= today) {
      try {
        // Call weather API for the location and date
        const response = await axios.get(`http://localhost:8000/api/weather`, {
          params: {
            location: newVisit.place,
            date: newVisit.date
          }
        });
        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    // Reset form
    setNewVisit({ place: '', date: '' });
  };

  const isDateWithin5Days = (date) => {
    const visitDate = new Date(date);
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);
    return visitDate <= fiveDaysFromNow && visitDate >= today;
  };

  return (
    <div className="visit-planner">
      <h2>Plan Your Visit</h2>
      
      <form onSubmit={handleSubmit} className="visit-form">
        <div className="form-group">
          <label>Place:</label>
          <input
            type="text"
            value={newVisit.place}
            onChange={(e) => setNewVisit({...newVisit, place: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={newVisit.date}
            onChange={(e) => setNewVisit({...newVisit, date: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <button 
          type="submit"
          role="button"
          aria-label="Add visit plan"
        >
          Add Visit
        </button>
      </form>

      <div className="visits-list">
        <h3>Planned Visits</h3>
        {visits.map((visit, index) => (
          <div key={index} className={`visit-item ${selectedVisitIndex === index ? 'selected' : ''}`}>
            <div className="visit-details">
              <p><strong>Place:</strong> {visit.place}</p>
              <p><strong>Date:</strong> {new Date(visit.date).toLocaleDateString()}</p>
            </div>
            {isDateWithin5Days(visit.date) && (
              <button 
                className="weather-button"
                onClick={async () => {
                  try {
                    const response = await axios.get(`http://localhost:8000/api/weather`, {
                      params: {
                        location: visit.place,
                        date: visit.date
                      }
                    });
                    setWeatherData(response.data);
                    setSelectedVisitIndex(index);
                  } catch (error) {
                    console.error("Error fetching weather data:", error);
                  }
                }}
              >
                Check Weather
              </button>
            )}
          </div>
        ))}
      </div>

      {weatherData && selectedVisitIndex !== null && (
        <div className="weather-data">
          <h3>Weather Forecast for {visits[selectedVisitIndex].place}</h3>
          <p><strong>Date:</strong> {new Date(visits[selectedVisitIndex].date).toLocaleDateString()}</p>
          <p><strong>Temperature:</strong> {weatherData.temperature}°C</p>
          <p><strong>Condition:</strong> {weatherData.condition}</p>
          <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
        </div>
      )}
    </div>
  );
};

export default VisitPlanner;