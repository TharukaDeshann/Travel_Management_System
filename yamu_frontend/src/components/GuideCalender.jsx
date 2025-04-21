import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/GuideCalender.css";
import yamuLogo from '../images/yamu-logo.png';

const data = [
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

const GuideCalender = () => {
  return (
    <div className="calendar-container">
      <nav className="navbar">
        <div className="logo">
          <img src={yamuLogo} alt="Yamu Logo" className="logo-image"/>
          <span>YAMU</span>
        </div>
        <div className="nav-links">
          <a href="/guide-dashboard">Dashboard</a>
          <a href="#">Calendar</a>
          <a href="/guide-review">Reviews</a>
          <a href="#">Emergency</a>
        </div>
      </nav>

      <div className="content">
        <h2 className="title">Calendar</h2>
        {/* Calendar UI */}
        <div className="calendar">
          <div className="calendar-header">SEPTEMBER 2022</div>
          <div className="calendar-grid">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className={`day ${i + 1 === 14 || i + 1 === 17 ? "event" : ""}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Year Plan Chart */}
        <h2 className="title">Year Plan</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tours" fill="#007BFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GuideCalender;
