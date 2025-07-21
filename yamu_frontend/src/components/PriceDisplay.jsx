import React from 'react';
import { usePriceDisplay } from '../hooks/useCurrencyConverter';

const PriceDisplay = ({ 
  price, 
  amount, // Support both 'price' and 'amount' props
  fromCurrency = 'LKR', 
  className = "",
  showOriginal = false,
  size = "default", // "small", "default", "large"
  inline = false
}) => {
  // Use amount if provided, otherwise use price
  const priceValue = amount !== undefined ? amount : price;
  
  // Add validation for the price value
  if (priceValue === undefined || priceValue === null || isNaN(priceValue)) {
    return (
      <span className={`${className} text-red-500`}>
        Invalid price
      </span>
    );
  }
  
  const { 
    convertedPrice, 
    formattedPrice, 
    isConverting, 
    originalPrice, 
    originalCurrency 
  } = usePriceDisplay(priceValue, fromCurrency);

  const sizeClasses = {
    small: "text-sm",
    default: "text-base", 
    lg: "text-lg",
    large: "text-lg"
  };

  if (isConverting) {
    return (
      <span className={`${sizeClasses[size]} ${className} text-gray-500`}>
        Converting...
      </span>
    );
  }

  const content = (
    <>
      <span className="font-semibold">{formattedPrice}</span>
      {showOriginal && fromCurrency !== 'LKR' && (
        <span className="text-gray-500 text-sm ml-2">
          (Originally: Rs. {originalPrice?.toLocaleString()})
        </span>
      )}
    </>
  );

  if (inline) {
    return (
      <span className={`${sizeClasses[size]} ${className}`}>
        {content}
      </span>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {content}
    </div>
  );
};

export default PriceDisplay;
