import "./App.css";
import logo from "./logo.svg";
import "./App.css";
import React from "react";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Reservations from "./pages/Reservations.jsx";
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
import Inbox from "./pages/Inbox.jsx";// Import FinalizeItinerary
import TravelerUpcomingTrips from "./pages/TravelerUpcomingTrips";

import VerifyEmail from "./pages/VerifyEmail.jsx";
import VerifyEmailPending from "./pages/VerifyEmailPending.jsx";
import UserProfile from "./pages/profile/UserProfile.jsx";
import UpdateUserProfile from "./pages/profile/components/UpdateUserProfile.jsx";
import ProfileView from "./pages/ProfileView.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UsersSocialPage from "./pages/UsersSocialPage.jsx";
import SpeechToTextDemo from "./pages/SpeechToTextDemo.jsx";



const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ai search */}
          <Route path="/user-search" element={<UserSearch />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/weather-details" element={<Weather />} />
          <Route path="/weather-card" element={<WeatherCard />} />
          <Route path="/finalize-itinerary" element={<FinalizeItinerary />} />
          <Route path="/speech-demo" element={<SpeechToTextDemo />} />
          <Route path="/" element={<Login />} />
          
          {/* Email verification pending */}
          <Route
            path="/verify-email-pending"
            element={<VerifyEmailPending />}
          />
          {/* Email verification */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/home" element={<Home />} />
            <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
            <Route path="/guide-dashboard" element={<GuideDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/guide-reviews" element={<GuideReview />} />
            <Route path="/guide-calendar" element={<GuideCalendar />} />
            <Route path="/visit-plan" element={<VisitPlanPage />} />
            <Route path="/guides-page" element={<GuidesPage />} />
            <Route path="/users/users-by-role" element={<UsersSocialPage />} />
            <Route path="/map" element={<Map />} />
            <Route path="/itinerary-planner" element={<ItineraryPlanner />} />
            <Route path="/reservations" element={<Reservations></Reservations>}></Route>
          
        

            

            {/* Profile Routes */}
            {/* <Route path="/users/profile/" */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/update-profile" element={<UpdateUserProfile />} />
            <Route path="/users/profile/:userId" element={<ProfileView />} />
          </Route>

          

          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;
