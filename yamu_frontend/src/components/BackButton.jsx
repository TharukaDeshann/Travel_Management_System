import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = ({
  label = "Back",
  className = "",
  showIcon = true,
  onBeforeNavigate = null,
}) => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleGoBack}
      className={` flex items-center gap-2 rounded-md py-2 px-4 font-medium bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${className} `}
      aria-label="Go back to previous page"
    >
      {showIcon && <ArrowLeft className="w-5 h-5" />}
      {label}
    </button>
  );
};

export default BackButton;
