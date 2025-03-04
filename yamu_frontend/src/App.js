import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CommonRegistration from "./components/Registration/CommonRegistration";
import TourGuideRegistration from "./components/Registration/TourGuideRegistration";
import TravellerForm from "./components/Registration/TravellerForm"; // Import the new traveller form component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/common-register" element={<CommonRegistration />} />
        <Route path="/guide-register" element={<TourGuideRegistration />} />
        <Route path="/registertraveller" element={<TravellerForm />} /> {/* Add the new route */}
      </Routes>
    </Router>
  );
}

export default App;