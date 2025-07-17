import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc' }
];

const BASE_CURRENCY = 'LKR'; // All prices are stored in LKR
const EXCHANGE_API_KEY = 'ee302ff3be157ca6a021f6a0';

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    if (selectedCurrency === BASE_CURRENCY) {
      setExchangeRates({ [BASE_CURRENCY]: 1 });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/${BASE_CURRENCY}/${selectedCurrency}`
      );
      const data = await response.json();

      if (data && data.conversion_rate) {
        setExchangeRates(prev => ({
          ...prev,
          [selectedCurrency]: data.conversion_rate
        }));
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback rates if API fails
      const fallbackRates = {
        USD: 0.003,
        EUR: 0.0027,
        CHF: 0.0028
      };
      if (fallbackRates[selectedCurrency]) {
        setExchangeRates(prev => ({
          ...prev,
          [selectedCurrency]: fallbackRates[selectedCurrency]
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Convert price from LKR to selected currency
  const convertPrice = (priceInLKR, targetCurrency = selectedCurrency) => {
    if (!priceInLKR || priceInLKR === 0) return 0;
    if (targetCurrency === BASE_CURRENCY) return priceInLKR;
    
    const rate = exchangeRates[targetCurrency];
    if (!rate) return priceInLKR;
    
    return Math.round((priceInLKR * rate) * 100) / 100;
  };

  // Format price with currency symbol
  const formatPrice = (priceInLKR, targetCurrency = selectedCurrency, options = {}) => {
    const convertedPrice = convertPrice(priceInLKR, targetCurrency);
    const currency = currencies.find(c => c.code === targetCurrency);
    const symbol = currency?.symbol || targetCurrency;
    
    const formatted = convertedPrice.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    });
    
    return `${symbol} ${formatted}`;
  };

  // Get currency symbol
  const getCurrencySymbol = (currencyCode = selectedCurrency) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  // Change currency
  const changeCurrency = (newCurrency) => {
    setSelectedCurrency(newCurrency);
  };

  // Fetch rates when currency changes
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 300000);
    return () => clearInterval(interval);
  }, [selectedCurrency]);

  const value = {
    selectedCurrency,
    currencies,
    exchangeRates,
    loading,
    lastUpdated,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    changeCurrency,
    refreshRates: fetchExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext; 