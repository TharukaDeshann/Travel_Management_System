import React, { useState, useCallback } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector = ({ 
  className = "",
  size = "default", // "small", "default", "large"
  showLabel = false,
  variant = "default" // "default", "compact", "minimal"
}) => {
  const {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    getCurrencySymbol,
    isLoading
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = useCallback((currencyCode) => {
    try {
      setSelectedCurrency(currencyCode);
      setIsOpen(false);
    } catch (error) {
      console.error('Error changing currency:', error);
    }
  }, [setSelectedCurrency]);

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Size variants
  const sizeClasses = {
    small: {
      button: "px-2 py-1.5 text-sm",
      icon: "w-4 h-4",
      symbol: "text-sm",
      dropdown: "w-44",
      dropdownPadding: "py-1",
      dropdownItem: "px-3 py-2 text-sm"
    },
    default: {
      button: "px-3 py-2.5 text-base",
      icon: "w-5 h-5",
      symbol: "text-base",
      dropdown: "w-52",
      dropdownPadding: "py-2",
      dropdownItem: "px-4 py-3 text-base"
    },
    large: {
      button: "px-4 py-3 text-lg",
      icon: "w-6 h-6",
      symbol: "text-lg",
      dropdown: "w-60",
      dropdownPadding: "py-2",
      dropdownItem: "px-5 py-3 text-lg"
    }
  };

  const currentSize = sizeClasses[size];

  // Variant styles
  const variantClasses = {
    default: "bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl border border-gray-200",
    compact: "bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 rounded-lg border border-gray-300",
    minimal: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-md"
  };

  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleToggleDropdown}
          disabled={isLoading}
          className={`flex items-center gap-2 ${currentSize.button} ${variantClasses[variant]} transition-all duration-200 group min-w-[70px] justify-center ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Change Currency"
        >
          <span className={`font-semibold ${currentSize.symbol}`}>
            {getCurrencySymbol()}
          </span>
          <ChevronDown
            className={`${currentSize.icon} transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={handleCloseDropdown}
            />
            <div className={`absolute right-0 mt-2 ${currentSize.dropdown} bg-white border border-gray-200 rounded-xl shadow-xl z-50 ${currentSize.dropdownPadding}`}>
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  disabled={isLoading}
                  className={`w-full ${currentSize.dropdownItem} text-left hover:bg-blue-50 flex items-center justify-between transition-colors ${
                    selectedCurrency === currency.code
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{currency.symbol}</span>
                    <span>{currency.code}</span>
                  </div>
                  {selectedCurrency === currency.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggleDropdown}
        disabled={isLoading}
        className={`flex items-center gap-2 ${currentSize.button} ${variantClasses[variant]} transition-all duration-200 group min-w-[90px] justify-center ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Change Currency"
      >
        {variant !== "minimal" && <Globe className={currentSize.icon} />}
        {showLabel && (
          <span className="hidden sm:inline">Currency:</span>
        )}
        <span className={`font-semibold ${currentSize.symbol}`}>
          {getCurrencySymbol()}
        </span>
        <ChevronDown
          className={`${currentSize.icon} transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCloseDropdown}
          />
          
          {/* Dropdown */}
          <div className={`absolute right-0 mt-2 ${currentSize.dropdown} bg-white border border-gray-200 rounded-xl shadow-xl z-50 ${currentSize.dropdownPadding}`}>
            <div className={`${currentSize.dropdownItem} text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100`}>
              Select Currency
            </div>
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                disabled={isLoading}
                className={`w-full ${currentSize.dropdownItem} text-left hover:bg-blue-50 flex items-center justify-between transition-colors ${
                  selectedCurrency === currency.code
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">{currency.symbol}</span>
                  <div>
                    <div className="font-semibold">{currency.code}</div>
                    <div className="text-sm text-gray-500">{currency.name}</div>
                  </div>
                </div>
                {selectedCurrency === currency.code && (
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;
