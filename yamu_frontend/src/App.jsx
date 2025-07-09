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

import FinalizeItinerary from "./pages/FinalizeItinerary.jsx"; 
import Inbox from "./pages/Inbox.jsx";
import TravelerUpcomingTrips from "./pages/TravelerUpcomingTrips";
import CancellationModal from "./components/CancellationModal.jsx"; // Import CancellationModal

import VerifyEmail from "./pages/VerifyEmail.jsx";
import VerifyEmailPending from "./pages/VerifyEmailPending.jsx";
import UserProfile from "./pages/profile/UserProfile.jsx";
import UpdateUserProfile from "./pages/profile/components/UpdateUserProfile.jsx";
import ProfileView from "./pages/ProfileView.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UsersSocialPage from "./pages/UsersSocialPage.jsx";

// import ProfileView from "./pages/ProfileView.jsx";

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/weather-details" element={<Weather />} />
          <Route path="/weather-card" element={<WeatherCard />} />

          <Route path="/" element={<Login />} />
          
          {/* Email verification pending */}
          <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
          {/* Email verification */}
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
            <Route path="/traveler-upcoming-trips" element={<TravelerUpcomingTrips />} />
            <Route path="/guide-dashboard" element={<GuideDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/guide-reviews" element={<GuideReview />} />
            <Route path="/guide-calendar" element={<GuideCalendar />} />
            <Route path="/visit-plan" element={<VisitPlanPage />} />
            <Route path="/guides-page" element={<GuidesPage />} />
            <Route path="/users/users-by-role" element={<UsersSocialPage />} />
            <Route path="/map" element={<Map />} />
            <Route path="/itinerary-planner" element={<ItineraryPlanner />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/profile-view" element={<ProfileView />} />

          
          <Route path="/finalize-itinerary" element={<FinalizeItinerary />} />

          

            {/* Profile Routes */}
            {/* <Route path="/users/profile/" */}
            <Route path="/profile" element={<UserProfile />} />

            

            {/* Cancellation Modal Route */}
            <Route path="/cancellation-modal" element={<CancellationModal isOpen={true} />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;
