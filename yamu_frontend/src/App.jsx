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
      </Routes>
    </Router>
  );
};

export default App;
