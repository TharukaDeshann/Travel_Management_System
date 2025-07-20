import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../services/axiosInstance";
import { useUser } from "../context/UserContext";
import { FaCalendarAlt, FaMoneyBillWave, FaFlag, FaPlaneDeparture, FaRegEdit } from "react-icons/fa";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 border border-blue-100">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center flex items-center justify-center gap-3">
            <FaPlaneDeparture className="text-blue-400" /> Plan Your Journey with Yamu
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-center font-semibold">
              {error}
            </div>
          )}

          <div className="mb-8">
            <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
              <FaFlag className="text-blue-400" /> Trip Title
            </label>
            <input
              type="text"
              placeholder="Give your trip a title (e.g., Trip to Galle)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
            />
          </div>

          <div className="h-px bg-blue-100 my-6" />

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                <FaCalendarAlt className="text-blue-400" /> Travel Dates
              </label>
              <div className="space-y-3">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  minDate={new Date()}
                  placeholderText="Select start date"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                  dateFormat="MM/dd/yyyy"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate || new Date()}
                  placeholderText="Select end date"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 text-lg"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" /> Budget Planning
              </label>
              <div className="flex gap-0 items-center bg-green-50 border border-green-100 rounded-lg p-2 w-full max-w-full">
                <input
                  type="number"
                  placeholder="Enter budget"
                  className="p-3 border rounded-l-lg focus:ring-2 focus:ring-green-400 text-lg bg-white w-full max-w-[180px] md:max-w-[220px] border-r-0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="0"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <select
                  className="p-3 border rounded-r-lg bg-white focus:ring-2 focus:ring-green-400 text-lg w-24 md:w-28 border-l-0"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-blue-100 my-6" />

          <button
            onClick={handleStartPlanning}
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg flex items-center justify-center gap-2 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaRegEdit /> {loading ? 'Starting Planning...' : 'Start Planning Your Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPlanner;