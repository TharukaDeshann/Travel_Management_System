import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FinalizeItinerary = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve itinerary data from state passed via navigation
  const itineraryData = location.state || {
    dates: [],
    locations: [],
    hotel: "",
    transportation: "",
    tourGuideId: "",
    other: "", // Add a field for additional information
  };

  const handleDownload = () => {
    const itinerary = {
      Dates: itineraryData.dates,
      Locations: itineraryData.locations,
      Hotel: itineraryData.hotel,
      Transportation: itineraryData.transportation,
      TourGuideId: itineraryData.tourGuideId,
      Other: itineraryData.other, // Include additional information in the download
    };

    const blob = new Blob([JSON.stringify(itinerary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "itinerary.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Finalize Your Itinerary</h1>

      {/* Tabular Format */}
      <table className="table-auto border-collapse border border-gray-300 w-full max-w-4xl mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Location</th>
          </tr>
        </thead>
        <tbody>
          {itineraryData.dates.map((date, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{date}</td>
              <td className="border border-gray-300 px-4 py-2">
                {itineraryData.locations[index] || "Not Selected"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Additional Details */}
      <div className="w-full max-w-4xl bg-white p-4 rounded shadow-md mb-6">
        <p className="text-lg">
          <strong>Hotel:</strong> {itineraryData.hotel || "Not Booked"}
        </p>
        <p className="text-lg">
          <strong>Transportation:</strong>{" "}
          {itineraryData.transportation || "Not Booked"}
        </p>
        <p className="text-lg">
          <strong>Tour Guide ID:</strong>{" "}
          {itineraryData.tourGuideId || "Not Booked"}
        </p>
        <p className="text-lg">
          <strong>Other:</strong> {itineraryData.other || "No Additional Information"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end w-full max-w-4xl">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-500 text-white rounded mr-4"
        >
          Download
        </button>
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-gray-500 text-white rounded"
        >
          Go Back and Edit
        </button>
      </div>
    </div>
  );
};

export default FinalizeItinerary;