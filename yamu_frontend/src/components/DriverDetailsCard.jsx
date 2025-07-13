import React, { useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../services/axiosInstance";

const DriverDetailsCard = ({ summary, expanded, onExpand, onSelect }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (expanded)
      apiClient.get(`/api/drivers/${summary.id}`).then(res => setDetails(res.data));
  }, [expanded, summary.id]);

  return (
    <div className="border rounded p-3 mb-2">
      <div className="flex items-center">
        {summary.photoBase64 && (
          <img src={`data:image/jpeg;base64,${summary.photoBase64}`} alt="Driver" className="w-12 h-12 rounded mr-3" />
        )}
        <div>
          <div className="font-semibold">{summary.name}</div>
          <div className="text-xs text-gray-500">⭐ {summary.rating} | {summary.vehicleType}</div>
        </div>
        <button className="ml-auto text-blue-600 text-xs" onClick={onExpand}>
          {expanded ? "Hide" : "View"}
        </button>
      </div>
      {expanded && details && (
        <div className="mt-2 text-sm">
          <div><b>Description:</b> {details.description}</div>
          <div><b>Vehicle:</b> {details.brand} {details.model} ({details.color})</div>
          <div><b>Vehicle No:</b> {details.vehicleNumber}</div>
          <button className="mt-2 px-3 py-1 bg-green-500 text-white rounded" onClick={onSelect}>Select</button>
        </div>
      )}
    </div>
  );
};

export default DriverDetailsCard;