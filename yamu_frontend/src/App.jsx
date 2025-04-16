import logo from './logo.svg';
import './App.css';
import React from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import WeatherPage from "./pages/WeatherPage.jsx";
import Weather from "./components/Weather.jsx";
import TravelerDashboard from "./pages/TravelerDashboard.jsx";
import GuideDashboard from "./pages/GuideDashboard.jsx";
import GuideReview from "./pages/GuideReview.jsx";
import GuideCalender from "./components/GuideCalender.jsx";
import Map from './components/Map.jsx';
import WeatherCard from "./components/WeatherCard.jsx";

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/map" element={<Map />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/weather-details" element={<Weather />} />
          <Route path="/weather-card" element={<WeatherCard />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />

            <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
            <Route path="/guide-dashboard" element={<GuideDashboard />} />
            <Route path="/guide-review" element={<GuideReview />} />
            <Route path="/guide-calendar" element={<GuideCalender />} />
          </Route>
          
          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;