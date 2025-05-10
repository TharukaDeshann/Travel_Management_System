import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/BackButton.css"; // Import your CSS file for styling

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button className="back-button" onClick={handleGoBack}>
      Back
    </button>
  );
};

export default BackButton;