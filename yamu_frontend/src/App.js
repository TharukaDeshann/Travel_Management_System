import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TravellerRegistration from "./components/Registration/TravellerRegistration";
import TourGuideRegistration from "./components/Registration/TourGuideRegistration";
import TravellerForm from "./components/Registration/TravellerForm"; // Import the new traveller form component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/traveller-register" element={<TravellerRegistration />} />
        <Route path="/guide-register" element={<TourGuideRegistration />} />
        <Route path="/commonregister" element={<TravellerForm />} /> {/* Add the new route */}
      </Routes>
    </Router>
  );
}

export default App;