import React, { useEffect, useState } from "react";
import apiClient from "../services/axiosInstance";

const DriverDetailsCard = ({ summary, expanded, onExpand, onSelect }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded) {
      setLoading(true);
      apiClient.get(`/api/drivers/${summary.id}`).then((res) => {
        setDetails(res.data);
        setLoading(false);
      });
    }
  }, [expanded, summary.id]);

  return (
    <div
      className={`border rounded-xl p-4 bg-gray-50 shadow-sm transition-all ${
        expanded ? "ring-2 ring-blue-200" : ""
      }`}
    >
      <div className="flex items-center">
        {summary.photoBase64 ? (
          <img
            src={`data:image/jpeg;base64,${summary.photoBase64}`}
            alt="Driver"
            className="w-14 h-14 rounded-full border-2 border-blue-300 mr-4 object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4 text-blue-500 font-bold text-xl uppercase border-2 border-blue-200">
            {summary.name?.[0] || "?"}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg text-blue-900">
            {summary.name}
          </div>
          <div className="text-xs text-gray-500">
            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mr-2">
              {summary.rating} ★
            </span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {summary.vehicleType}
            </span>
            <span className="ml-2 text-gray-600">
              Rs.{summary.ratePerLng}/Km
            </span>
          </div>
        </div>
        <button
          className="ml-auto text-blue-500 font-medium px-3 py-1 rounded hover:bg-blue-100 transition"
          onClick={onExpand}
        >
          {expanded ? "Hide" : "View"}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 border-t pt-4">
          {loading ? (
            <div className="text-blue-500">Loading details...</div>
          ) : details ? (
            <>
              <div className="mb-2">
                <span className="block text-sm text-gray-500 mb-1">
                  Description
                </span>
                <span className="block text-gray-700">
                  {details.description}
                </span>
              </div>
              <div className="mb-2">
                <span className="block text-sm text-gray-500 mb-1">
                  Vehicle
                </span>
                <span className="block text-gray-700">
                  {details.brand} {details.model} ({details.color})
                </span>
              </div>
              <div className="mb-2">
                <span className="block text-sm text-gray-500 mb-1">
                  Vehicle Number
                </span>
                <span className="block text-gray-700">
                  {details.vehicleNumber}
                </span>
              </div>
              <div className="mb-2">
                <span className="block text-sm text-gray-500 mb-1">
                  Rate per Km
                </span>
                <span className="block text-gray-700">
                  Rs.{details.ratePerLng}
                </span>
              </div>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition w-full font-semibold"
                onClick={onSelect}
              >
                Select Driver
              </button>
            </>
          ) : (
            <div className="text-gray-400">No details found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDetailsCard;
