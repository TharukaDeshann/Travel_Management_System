import React from "react";

const ConfirmDriverSelection = ({
  driver,
  totalCost,
  distanceKm,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1030]">
    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-3 text-gray-800">
          Confirm Driver Booking
        </h2>
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-600 mb-3 flex items-center justify-center bg-blue-50">
          {driver.photoBase64 ? (
            <img
              src={`data:image/jpeg;base64,${driver.photoBase64}`}
              alt="Driver"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-blue-400"> {/* user icon */} </span>
          )}
        </div>
        <div className="text-lg font-semibold text-blue-900">{driver.name}</div>
        <div className="text-sm text-gray-500 mb-1 flex flex-col items-center text-center">
          <div>
            <span className="mr-2">Rating: {driver.rating}</span>
            <span>| {driver.vehicleType}</span>
          </div>
          <div>
            <span>Distance: {distanceKm || 0} km </span>
            <span>| Total Cost: Rs.{totalCost ? totalCost.toFixed(2) : '0.00'}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-4 w-full">
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-white font-semibold"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="flex-1 bg-gray-200 hover:bg-gray-300 transition px-4 py-2 rounded text-gray-700 font-semibold"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ConfirmDriverSelection;
