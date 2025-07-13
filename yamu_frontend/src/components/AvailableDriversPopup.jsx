import React, { useEffect, useState } from "react";
import DriverDetailsCard from "./DriverDetailsCard";
import axios from "axios";
import apiClient from "../services/axiosInstance";

const AvailableDriversPopup = ({ isOpen, onClose, date, onSelectDriver }) => {
  const [drivers, setDrivers] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      apiClient.get(`/api/drivers/available?date=${date}`)
        .then(res => setDrivers(res.data))
        .catch(() => setDrivers([]));
    }
  }, [isOpen, date]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Available Drivers</h2>
        {drivers.length === 0 && <div>No drivers available.</div>}
        {drivers.map(driver =>
          <DriverDetailsCard
            key={driver.id}
            summary={driver}
            expanded={expandedId === driver.id}
            onExpand={() => setExpandedId(driver.id === expandedId ? null : driver.id)}
            onSelect={() => onSelectDriver(driver.id)}
          />
        )}
        <button className="mt-4 text-sm text-gray-500" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AvailableDriversPopup;