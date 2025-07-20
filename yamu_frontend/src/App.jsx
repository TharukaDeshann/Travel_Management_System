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
import UsersSocialPage from "./pages/UsersSocialPage.jsx";


{/* admin dashboard */}
// import Overview from "./pages/admin_dashboard/Overview.jsx";
import UserManagement from "./pages/admin_dashboard/UserManagement.jsx";
import GuideManagement from "./pages/admin_dashboard/GuideManagement.jsx";
import TravelerManagement from "./pages/admin_dashboard/TravelerManagement.jsx";
import Analytics from "./pages/admin_dashboard/Analytics.jsx";

import EmergencyContacts from "./pages/EmergencyContacts.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import UnauthorizedPage from "./pages/unauthorized/UnauthorizedPage.jsx";
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
          
          {/* Email Verification Routes */}
          <Route path="/verify-email-pending" element={<VerifyEmailPending />}/>
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/emergency-contacts" element={<EmergencyContacts />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Admin Protected Routes */}
            {/* <Route path="/admin-overview" element={<Overview />} /> */}
            <Route path="/admin-user-management" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
              </RoleProtectedRoute>
              } />
            <Route path="/admin-guide-management" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <GuideManagement />
              </RoleProtectedRoute>
              } />
            <Route path="/admin-traveler-management" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <TravelerManagement />
              </RoleProtectedRoute>
              } />
            <Route path="/admin-analytics" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <Analytics />
              </RoleProtectedRoute>
              } />

            {/* Traveler Management Routes */}
            <Route path="/inbox" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER', 'GUIDE']}>
              <Inbox />
              </RoleProtectedRoute>
              } />
            <Route path="/traveler-dashboard" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER']}>
              <TravelerDashboard />
              </RoleProtectedRoute>
              } />
            <Route path="/guide-dashboard" element={
              <RoleProtectedRoute allowedRoles={['GUIDE']}>
              <GuideDashboard />
              </RoleProtectedRoute>
              } />
            <Route path="/guide-reviews" element={
              <RoleProtectedRoute allowedRoles={['GUIDE']}>
              <GuideReview />
              </RoleProtectedRoute>
              } />
            <Route path="/guide-calendar" element={
              <RoleProtectedRoute allowedRoles={['GUIDE']}>
              <GuideCalendar />
              </RoleProtectedRoute>
              } />
            <Route path="/guides-page" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER', 'GUIDE']}>
              <GuidesPage />
              </RoleProtectedRoute>
              } />

            <Route path="/map" element={<Map />} />

            <Route path="/itinerary-planner" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER']}>
              <ItineraryPlanner />
              </RoleProtectedRoute>
              } />
            <Route path="/reservations" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER']}>
              <Reservations />
              </RoleProtectedRoute>
              } />

            <Route path="/traveler-upcoming-trips" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER']}>
                <TravelerUpcomingTrips />
              </RoleProtectedRoute>
              } />

            <Route path="/finalize-itinerary" element={
              <RoleProtectedRoute allowedRoles={['TRAVELER']}>
                <FinalizeItinerary />
              </RoleProtectedRoute>
              } />

            <Route path="/users/users-by-role" element={<UsersSocialPage />} />

            {/* Profile Routes */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/update-profile" element={<UpdateUserProfile />} />
            <Route path="/users/profile/:userId" element={<ProfileView />} />
          </Route>

          

          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;
