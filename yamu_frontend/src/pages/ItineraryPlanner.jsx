import React, { useState } from "react";
import { FaMicrophone, FaImage, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const ItineraryPlanner = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showTravelHistory, setShowTravelHistory] = useState(false);
  const [speechResult, setSpeechResult] = useState("");

  const travelHistory = [
    { destination: "Trip ID 001", date: "2025-03-01" },
    { destination: "Trip ID 002", date: "2025-02-15" },
    { destination: "Trip ID 003", date: "2025-01-20" },
  ];

  const getDateRange = (start, end) => {
    let dates = [];
    let currentDate = new Date(start);
    let lastDate = new Date(end);

    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleStartPlanning = () => {
    if (!startDate || !endDate) {
      alert("Please select a start and end date.");
      return;
    }

    const dates = getDateRange(startDate, endDate);
    navigate(`/itinerary-selection?dates=${JSON.stringify(dates)}`);
  };

  const handleSpeechRecognition = () => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      "DJD3J9eQ6hg3Q5qH3lVHk8mnf1ekE8tgJvuCFKT3IfxJcYtqjVtfJQQJ99BAACqBBLyXJ3w3AAAYACOG7y9y",
      "southeastasia"
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setSpeechResult(result.text);
          alert(`Recognized: ${result.text}`);
        } else {
          alert("Speech recognition failed. Please try again.");
          console.error("Speech recognition error:", result);
        }
      },
      (err) => {
        alert("An error occurred during speech recognition.");
        console.error("Speech recognition error:", err);
      }
    );
  };

  const handleImageMenu = (action) => {
    setShowImageMenu(false);
    if (action === "attach") {
      alert("Attach a photo functionality triggered.");
    } else if (action === "take") {
      alert("Take a photo functionality triggered.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Profile & Travel History Box - Aligned to Right */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {/* Travel History */}
        <div className="relative">
          <button
            className="px-4 py-2 bg-white text-blue-500 border border-blue-500 rounded hover:bg-blue-500 hover:text-white transition"
            onClick={() => setShowTravelHistory(!showTravelHistory)}
          >
            Travel History
          </button>
          {showTravelHistory && (
            <div className="absolute right-0 mt-2 bg-white shadow-md rounded p-2 w-48">
              {travelHistory.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.destination} - {item.date}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Icon */}
        <FaUserCircle className="text-3xl text-gray-600 cursor-pointer" />
      </div>

      <h1 className="text-3xl font-bold text-blue-600 mb-6">Plan a New Trip</h1>

      {/* Destination Search Bar */}
      <div className="w-full max-w-lg bg-white p-4 rounded shadow-md flex items-center space-x-2 border relative">
        <input
          type="text"
          placeholder="Where to? e.g. Galle, Sigiriya, Kandy"
          className="flex-1 p-2 outline-none"
          value={speechResult}
          onChange={(e) => setSpeechResult(e.target.value)}
        />
        <button
          className="p-2 bg-gray-200 rounded"
          onClick={handleSpeechRecognition}
        >
          <FaMicrophone />
        </button>
        <button
          className="p-2 bg-gray-200 rounded"
          onClick={() => setShowImageMenu(!showImageMenu)}
        >
          <FaImage />
        </button>
        {showImageMenu && (
          <div className="absolute top-12 right-0 bg-white shadow-md rounded p-2">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleImageMenu("attach")}
            >
              Attach a Photo
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleImageMenu("take")}
            >
              Take a Photo
            </button>
          </div>
        )}
        <button className="p-2 bg-blue-500 text-white rounded">Search</button>
      </div>

      {/* Date Selection */}
      <div className="w-full max-w-lg bg-white p-4 rounded shadow-md mt-4 flex items-center space-x-2 border">
        <input
          type="date"
          className="flex-1 p-2 border rounded"
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="flex-1 p-2 border rounded"
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Budget Input */}
      <div className="w-full max-w-lg bg-white p-4 rounded shadow-md mt-4 flex items-center space-x-2 border">
        <input
          type="number"
          placeholder="Enter your budget"
          className="flex-1 p-2 outline-none"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="LKR">LKR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      {/* Start Planning Button */}
      <button
        onClick={handleStartPlanning}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded text-lg font-semibold"
      >
        Start Planning
      </button>
    </div>
  );
};

export default ItineraryPlanner;