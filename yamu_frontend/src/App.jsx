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
import Go from './pages/Go.jsx';
import TravelerDashboard from "./pages/TravelerDashboard.jsx";
import GuideDashboard from "./pages/GuideDashboard.jsx";
import GuideReview from "./pages/GuideReview.jsx";
import GuideCalender from "./pages/GuideCalender.jsx";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/go" element={<Go />} />
        </Route>
        <Route path="/" element={<Login />} />
        <Route path="/traveller-register" element={<TravellerRegistration />} />
        <Route path="/guide-register" element={<TourGuideRegistration />} />
        <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
        <Route path="/guide-dashboard" element={<GuideDashboard />} />
        <Route path="/guide-review" element={<GuideReview />} />
        <Route path="/guide-calendar" element={<GuideCalender />} />
      </Routes>
    </Router>
  );
};

export default App;
