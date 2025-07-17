import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../services/axiosInstance";
import { useCurrency } from "../context/CurrencyContext";

const API_KEY = "dfc11c5ddc264f6191bd008aec37ec29";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ItineraryPlanner = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [budget, setBudget] = useState("");
  const [tripTitle, setTripTitle] = useState("");
  const [error, setError] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [weatherResults, setWeatherResults] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  // Use global currency context
  const { selectedCurrency, currencies } = useCurrency();

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

    try {
      const response = await apiClient.post("/api/itineraries", {
        tripTitle,
        startDate,
        endDate,
        budget,
        currency: selectedCurrency,
      });

      console.log("Itinerary saved:", response.data);

      // Generate the date range
      const dateRange = getDateRange(startDate, endDate);

      // Navigate to the map page with the date range as query parameters
      navigate(`/map?dates=${JSON.stringify(dateRange)}`);
    } catch (error) {
      console.error("Error saving itinerary:", error);
      setError("Failed to save itinerary. Please try again.");
    }
  };

  const getDateRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      // Format as YYYY-MM-DD in local time
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const fetchWeatherForRange = async () => {
    if (!locationInput || !startDate || !endDate) {
      setWeatherError("Please enter location and select dates.");
      return;
    }
    setWeatherLoading(true);
    setWeatherError("");
    setWeatherResults([]);
    try {
      // Get coordinates for location
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationInput)}&limit=1&appid=${API_KEY}`);
      const geoData = await geoRes.json();
      if (!geoData[0]) throw new Error("Location not found");
      const { lat, lon } = geoData[0];
      // Get 5-day/3-hour forecast
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
      const weatherData = await weatherRes.json();
      // Map forecast to daily (OpenWeather gives 3-hour intervals)
      const dateMap = {};
      weatherData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dateMap[date]) dateMap[date] = [];
        dateMap[date].push(item);
      });
      // Build results for each date in range (from startDate to endDate only)
      const range = getDateRange(startDate, endDate);
      const results = range.map(dateStr => {
        if (dateMap[dateStr]) {
          // Average temp, pick most common weather
          const temps = dateMap[dateStr].map(i => i.main.temp);
          const avgTemp = Math.round(temps.reduce((a,b) => a+b, 0) / temps.length);
          const conditions = dateMap[dateStr].map(i => i.weather[0].main);
          const condition = conditions.sort((a,b) => conditions.filter(v=>v===a).length - conditions.filter(v=>v===b).length).pop();
          return { date: dateStr, temp: avgTemp, condition };
        } else {
          return { date: dateStr, pending: true };
        }
      });
      setWeatherResults(results);
    } catch (e) {
      setWeatherError(e.message || "Failed to fetch weather");
    } finally {
      setWeatherLoading(false);
    }
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
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">
            Traveling Location
          </label>
          <input
            type="text"
            placeholder="Enter location (e.g., Colombo)"
            className="w-full p-3 border rounded-lg"
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
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
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate || new Date()}
                placeholderText="Select end date"
                className="w-full p-3 border rounded-lg"
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
                value={selectedCurrency}
                disabled
                title="Currency is managed globally via the navigation bar"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>{curr.code}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button
          onClick={handleStartPlanning}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4"
        >
          Start Planning Your Trip
        </button>
        <button
          onClick={fetchWeatherForRange}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium mb-4"
          disabled={weatherLoading}
        >
          {weatherLoading ? 'Loading Weather...' : 'Show Weather Forecast'}
        </button>
        {weatherError && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{weatherError}</div>}
        {weatherResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Weather Forecast</h3>
            <ul>
              {weatherResults.map((res, idx) => (
                <li key={idx} className="mb-2 p-2 rounded border flex items-center justify-between">
                  <span>{res.date}</span>
                  {res.pending ? (
                    <span className="text-yellow-600">Pending (Weather data not available for this date)</span>
                  ) : (
                    <span className="text-blue-700 font-semibold">{res.temp}°C, {res.condition}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-500 mt-2">Weather data is available for up to 5 days in advance. Later dates will show as pending.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPlanner;