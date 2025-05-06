import "./App.css";
import logo from "./logo.svg";
import "./App.css";
import React from "react";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import WeatherPage from "./pages/WeatherPage.jsx";
import Weather from "./components/Weather.jsx";
import VisitPlanPage from "./pages/VisitPlanPage";
import TravelerDashboard from "./pages/TravelerDashboard.jsx";
import GuideDashboard from "./pages/GuideDashboard.jsx";
import GuideReview from "./pages/GuideReview.jsx";
import GuideCalendar from "./components/GuideCalendar.jsx";
import Map from "./components/Map.jsx";
import GuidesPage from "./pages/GuidesPage.jsx";         
import WeatherCard from "./components/WeatherCard.jsx";
import ItineraryPlanner from "./pages/ItineraryPlanner.jsx";
import ItinerarySelection from "./pages/ItinerarySelection.jsx";
import FinalizeItinerary from "./pages/FinalizeItinerary.jsx"; // Import FinalizeItinerary

import VerifyEmail from "./pages/VerifyEmail.jsx";
import VerifyEmailPending from "./pages/VerifyEmailPending.jsx";
import UserProfile from "./pages/profile/UserProfile.jsx";
import UpdateEmail from "./pages/profile/components/UpdateEmail.jsx";
import UpdatePassword from "./pages/profile/components/UpdatePassword.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

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

          <Route path="/" element={<Login />} />
          <Route path="/itinerary-planner" element={<ItineraryPlanner />} />
          <Route path="/itinerary-selection" element={<ItinerarySelection />} />
          <Route path="/finalize-itinerary" element={<FinalizeItinerary />} />

          {/* Email verification pending */}
          <Route
            path="/verify-email-pending"
            element={<VerifyEmailPending />}
          />
          {/* Email verification */}
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
            <Route path="/guide-dashboard" element={<GuideDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/guide-review" element={<GuideReview />} />
            <Route path="/guide-calendar" element={<GuideCalendar />} />
            <Route path="/visit-plan" element={<VisitPlanPage />} />
            <Route path="/guides-page" element={<GuidesPage />} />


            {/* Profile Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/update-email" element={<UpdateEmail />} />
            <Route path="/profile/update-password" element={<UpdatePassword />} />
          </Route>

          

          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;
