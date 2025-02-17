import React from "react";
import "../styles/Dashboard.css"; // Add a CSS file for styling

const Dashboard = () => {
  // Sample data (replace with real data from your backend)
  const upcomingTrips = [
    {
      id: 1,
      destination: "Paris, France",
      date: "2023-12-15",
      bookingType: "Hotel & Flight",
      status: "Confirmed",
    },
    {
      id: 2,
      destination: "Tokyo, Japan",
      date: "2024-01-20",
      bookingType: "Hotel & Guide",
      status: "Pending",
    },
  ];

  const travelDocuments = [
    { id: 1, name: "Flight Ticket to Paris", type: "Flight" },
    { id: 2, name: "Hotel Booking Confirmation", type: "Hotel" },
    { id: 3, name: "Visa for Japan", type: "Visa" },
  ];

  const weatherForecast = {
    destination: "Paris, France",
    date: "2023-12-15",
    temperature: "12°C",
    condition: "Partly Cloudy",
  };

  const recommendations = [
    "Explore the Eiffel Tower in Paris.",
    "Try local cuisine in Tokyo.",
    "Book a guided tour of Mount Fuji.",
  ];

  return (
    <div className="dashboard-container">
      <h1>Welcome to Your Dashboard</h1>
      <div className="dashboard-sections">
        {/* Upcoming Trips */}
        <section className="dashboard-section">
          <h2>Upcoming Trips</h2>
          <div className="trip-list">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <h3>{trip.destination}</h3>
                <p>
                  <strong>Date:</strong> {trip.date}
                </p>
                <p>
                  <strong>Booking Type:</strong> {trip.bookingType}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-${trip.status.toLowerCase()}`}>
                    {trip.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Travel Documents */}
        <section className="dashboard-section">
          <h2>Travel Documents</h2>
          <div className="document-list">
            {travelDocuments.map((doc) => (
              <div key={doc.id} className="document-card">
                <h3>{doc.name}</h3>
                <p>
                  <strong>Type:</strong> {doc.type}
                </p>
                <button className="download-button">Download</button>
              </div>
            ))}
          </div>
        </section>

        {/* Weather Forecast */}
        <section className="dashboard-section">
          <h2>Weather Forecast</h2>
          <div className="weather-card">
            <h3>{weatherForecast.destination}</h3>
            <p>
              <strong>Date:</strong> {weatherForecast.date}
            </p>
            <p>
              <strong>Temperature:</strong> {weatherForecast.temperature}
            </p>
            <p>
              <strong>Condition:</strong> {weatherForecast.condition}
            </p>
          </div>
        </section>

        {/* Recommendations */}
        <section className="dashboard-section">
          <h2>Personalized Recommendations</h2>
          <ul className="recommendation-list">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;