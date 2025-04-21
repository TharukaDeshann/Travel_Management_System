import React from "react";
import "../styles/GuideDashboard.css";
import yamuLogo from '../images/yamu-logo.png'; // Make sure to add your logo file

const GuideDashboard = () => {
  // Dummy data for tours
  const tours = [
    { id: 1, name: "Devid Perera", country: "USA", image: "src/images/David.png" },
    { id: 2, name: "Govindu Bandara", country: "UK", image: "src/images/Govindu.png" },
    { id: 3, name: "Tharuka Deshan", country: "Germany", image: "src/images/Tharuka.png" },
  ];

  return (
    <div className="guide-dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={yamuLogo} alt="Yamu Logo" className="logo-image"/>
          YAMU
        </div>
        <div className="nav-links">
          <a href="#">Dashboard</a>
          <a href="/guide-calendar">Calendar</a>
          <a href="/guide-review">Reviews</a>
          <a href="#">Emergency Contacts</a>
        </div>
        <div className="user-section">
          <span className="notification">🔔</span>
          <img className="user-avatar" src="src/images/profile.png" alt="User" />
        </div>
      </nav>

      {/* Content */}
      <div className="content">
        <h2>My Tours</h2>
        {tours.map((tour) => (
          <div key={tour.id} className="tour-card">
            <img src={tour.image} alt={tour.name} className="tour-avatar" />
            <div className="tour-info">
              <p className="tour-name">{tour.name}</p>
              <p className="tour-country">{tour.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuideDashboard;
