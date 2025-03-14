import logo from './logo.svg';
import './App.css';
import React from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TravellerRegistration from "./components/Registration/TravellerRegistration.jsx";
import TourGuideRegistration from "./components/Registration/TourGuideRegistration.jsx";

import TravelerDashboard from "./pages/TravelerDashboard.jsx";
import GuideDashboard from "./pages/GuideDashboard.jsx";
import GuideReview from "./pages/GuideReview.jsx";
import GuideCalender from "./components/GuideCalender.jsx";
import Map from './components/Map.jsx';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Temporarily remove ProtectedRoute for testing */}
        <Route path="/home" element={<Home />} />
        
        <Route path="/" element={<Home />} />
        <Route path="/traveller-register" element={<TravellerRegistration />} />
        <Route path="/guide-register" element={<TourGuideRegistration />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
          <Route path="/guide-dashboard" element={<GuideDashboard />} />
        <Route path="/guide-review" element={<GuideReview />} />
        <Route path="/guide-calendar" element={<GuideCalender />} />
        <Route path="/map" element={<Map />} />
        </Route>
        
        
        
      </Routes>
    </Router>
  );
};

export default App;