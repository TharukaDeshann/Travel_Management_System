import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Go from "./pages/Go.jsx";
import TravelerDashboard from "./pages/TravelerDashboard.jsx";
import ItineraryPlanner from "./pages/ItineraryPlanner.jsx";
import ItinerarySelection from "./pages/ItinerarySelection.jsx";
import FinalizeItinerary from "./pages/FinalizeItinerary.jsx"; // Import FinalizeItinerary

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/itinerary-planner" element={<ItineraryPlanner />} />
          <Route path="/itinerary-selection" element={<ItinerarySelection />} />
          <Route path="/finalize-itinerary" element={<FinalizeItinerary />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/go" element={<Go />} />
            <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;