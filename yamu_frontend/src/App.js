import logo from './logo.svg';
import './App.css';
import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TravellerRegistration from "./components/Registration/TravellerRegistration";
import TourGuideRegistration from "./components/Registration/TourGuideRegistration";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
        <Route path="/traveller-register" element={<TravellerRegistration />} />
        <Route path="/guide-register" element={<TourGuideRegistration />} />
      </Routes>
    </Router>
  );
};

export default App;
