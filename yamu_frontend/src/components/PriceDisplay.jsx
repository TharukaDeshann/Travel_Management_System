import React from 'react';
import { usePriceDisplay } from '../hooks/useCurrencyConverter';

const PriceDisplay = ({ 
  price, 
  fromCurrency = 'LKR', 
  className = "",
  showOriginal = false,
  size = "default" // "small", "default", "large"
}) => {
  const { 
    convertedPrice, 
    formattedPrice, 
    isConverting, 
    originalPrice, 
    originalCurrency 
  } = usePriceDisplay(price, fromCurrency);

  const sizeClasses = {
    small: "text-sm",
    default: "text-base", 
    large: "text-lg"
  };

  if (isConverting) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <span className="text-gray-500">Converting...</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <span className="font-semibold">{formattedPrice}</span>
      {showOriginal && fromCurrency !== 'LKR' && (
        <span className="text-gray-500 text-sm ml-2">
          (Originally: Rs. {originalPrice?.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
