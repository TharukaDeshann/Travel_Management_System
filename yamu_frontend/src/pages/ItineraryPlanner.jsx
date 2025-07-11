import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../services/axiosInstance";
import { useUser } from "../context/UserContext";

const ItineraryPlanner = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [tripTitle, setTripTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <div>Loading user...</div>; // Or navigate to login
  }

  const validateInputs = () => {
    if (!tripTitle) {
      setError("Please enter a trip title");
      return false;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return false;
    }
    if (startDate > endDate) {
      setError("End date cannot be before start date");
      return false;
    }
    if (Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) > 30) {
      setError("Maximum trip duration is 30 days");
      return false;
    }
    if (!budget || budget <= 0) {
      setError("Please enter a valid budget");
      return false;
    }
    return true;
  };

  const handleStartPlanning = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const initialItineraryData = {
        tripTitle,
        startDate,
        endDate,
        budget: parseFloat(budget),
        currency,
        travelerId: user.id,
        dayPlans: []
      };
      const response = await apiClient.post("/api/itineraries", initialItineraryData);
      // Pass itineraryId to map page
      navigate(`/map`, {
        state: {
          itineraryId: response.data.id,
          dates: getDateRange(startDate, endDate),
          tripTitle,
          budget,
          currency
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to start itinerary planning. Please try again.");
      console.error("Error starting itinerary planning:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use local time to avoid timezone issues
  const getDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const endDateObj = new Date(end);
    while (currentDate <= endDateObj) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
        Plan Your Journey with Yamu
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">
            Trip Title
          </label>
          <input
            type="text"
            placeholder="Give your trip a title (e.g., Trip to Galle)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Travel Dates
            </label>
            <div className="space-y-3">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={new Date()}
                placeholderText="Select start date"
                className="w-full p-3 border rounded-lg"
                dateFormat="MM/dd/yyyy"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate || new Date()}
                placeholderText="Select end date"
                className="w-full p-3 border rounded-lg"
                dateFormat="MM/dd/yyyy"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Budget Planning
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter budget"
                className="flex-1 p-3 border rounded-lg"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
              />
              <select
                className="p-3 border rounded-lg bg-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartPlanning}
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Starting Planning...' : 'Start Planning Your Trip'}
        </button>
      </div>
    </div>
  );
};

export default ItineraryPlanner;