import React, { useEffect, useState } from "react";
import DriverDetailsCard from "./DriverDetailsCard";
import apiClient from "../services/axiosInstance";

const AvailableDriversPopup = ({ isOpen, onClose, date, onSelectDriver }) => {
  const [drivers, setDrivers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError("");
      apiClient
        .get(`/api/drivers/available?date=${date}`)
        .then((res) => setDrivers(res.data))
        .catch(() => setError("Failed to fetch drivers."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, date]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Available Drivers</h2>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-600">Loading drivers...</span>
          </div>
        )}
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
        {!loading && drivers.length === 0 && !error && (
          <div className="text-gray-500 text-center py-8">No drivers available.</div>
        )}
        <div className="space-y-3 max-h-96 overflow-auto scrollbar-thin pr-2">
          {drivers.map((driver) => (
            <DriverDetailsCard
              key={driver.id}
              summary={driver}
              expanded={expandedId === driver.id}
              onExpand={() =>
                setExpandedId(driver.id === expandedId ? null : driver.id)
              }
              onSelect={() => onSelectDriver(driver.id, driver)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailableDriversPopup;