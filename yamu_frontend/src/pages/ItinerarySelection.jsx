import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const ItinerarySelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dates = JSON.parse(searchParams.get("dates")) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [locations, setLocations] = useState(Array(dates.length).fill(""));
  const [hotelBooked, setHotelBooked] = useState(false);
  const [transportBooked, setTransportBooked] = useState(false);

  useEffect(() => {
    if (dates.length === 0) {
      navigate("/"); // Redirect if no dates are found
    }
  }, [dates, navigate]);

  const handleNext = () => {
    if (currentIndex < dates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/finalize-itinerary", {
        state: { dates, locations },
      });
    }
  };

  const handleBookHotel = () => {
    // Simulate API call
    setHotelBooked(true);
    setTimeout(() => {
      alert("Hotel booked via API.");
      setHotelBooked(false);
    }, 500);
  };

  const handleBookTourGuide = () => {
    // Display a dialog box for now
    alert("Navigated to Tour Guide Booking Form.");
  };

  const handleBookTransport = () => {
    // Simulate API call
    setTransportBooked(true);
    setTimeout(() => {
      alert("Transport mode booked via API.");
      setTransportBooked(false);
    }, 500);
  };

  const handleLocationChange = (e) => {
    const updatedLocations = [...locations];
    updatedLocations[currentIndex] = e.target.value;
    setLocations(updatedLocations);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold">Itinerary</h1>
      <h2 className="text-xl mt-2">Day {currentIndex + 1} — {dates[currentIndex]}</h2>

      {/* Places to Visit */}
      <div className="w-full max-w-lg mt-4">
        <h3 className="text-lg font-semibold">Places to Visit</h3>
        <div className="flex items-center border p-2 rounded bg-white shadow-md mt-2">
          <FaMapMarkerAlt className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Add places"
            className="flex-1 p-2 outline-none"
            value={locations[currentIndex]}
            onChange={handleLocationChange}
          />
        </div>
      </div>

      {/* Booking Buttons */}
      <div className="w-full max-w-lg flex flex-col space-y-4 mt-6">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded"
          onClick={handleBookHotel}
          disabled={hotelBooked}
        >
          {hotelBooked ? "Booking Hotel..." : "Book a Hotel"}
        </button>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded"
          onClick={handleBookTourGuide}
        >
          Book a Tour Guide
        </button>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded"
          onClick={handleBookTransport}
          disabled={transportBooked}
        >
          {transportBooked ? "Booking Transport..." : "Book a Transportation Mode"}
        </button>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="mt-6 px-6 py-3 bg-green-500 text-white rounded text-lg font-semibold"
      >
        {currentIndex < dates.length - 1 ? "Next" : "Finalize Itinerary"}
      </button>
    </div>
  );
};

export default ItinerarySelection;