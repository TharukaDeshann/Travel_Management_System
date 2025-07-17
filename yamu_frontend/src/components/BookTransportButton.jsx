import React from "react";

const BookTransportButton = ({ onClick, disabled, className = "", style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-6 py-3 rounded-xl transition font-semibold text-white shadow-lg 
      ${disabled ? "bg-gradient-to-r from-purple-300 to-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"}
      ${className}`}
    style={style}
  >
    <span role="img" aria-label="vehicle" className="mr-2"></span>
    Book Transport
  </button>
);

export default BookTransportButton;