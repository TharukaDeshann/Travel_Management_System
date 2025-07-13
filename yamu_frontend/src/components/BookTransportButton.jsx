import React from "react";

const BookTransportButton = ({ onClick, disabled }) => (
  <button
    className={`w-full px-6 py-3 rounded text-white ${disabled ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}
    onClick={onClick}
    disabled={disabled}
  >
    Book Transport
  </button>
);

export default BookTransportButton;