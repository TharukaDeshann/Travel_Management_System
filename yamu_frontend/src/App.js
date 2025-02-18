import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TravellerRegistration from "./components/Registration/TravellerRegistration";
import TourGuideRegistration from "./components/Registration/TourGuideRegistration";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/traveller-register" element={<TravellerRegistration />} />
        <Route path="/guide-register" element={<TourGuideRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
