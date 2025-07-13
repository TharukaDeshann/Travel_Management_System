import React from "react";

const ConfirmDriverSelection = ({ driver, onConfirm, onCancel }) => (
  <div>
    <div className="font-semibold mb-2">Confirm selection for:</div>
    <div>{driver}</div>
    <button className="mt-4 bg-green-600 px-4 py-2 rounded text-white" onClick={onConfirm}>Confirm</button>
    <button className="ml-2 text-gray-600" onClick={onCancel}>Cancel</button>
  </div>
);

export default ConfirmDriverSelection;