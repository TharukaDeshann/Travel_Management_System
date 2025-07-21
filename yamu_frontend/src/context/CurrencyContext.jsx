import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  // Initialize currency from localStorage or default to LKR
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    try {
      const savedCurrency = localStorage.getItem('selectedCurrency');
      return savedCurrency || 'LKR';
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return 'LKR';
    }
  });

  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const currencies = useMemo(() => [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc' },
  ], []);

  // Save currency selection to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('selectedCurrency', selectedCurrency);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [selectedCurrency]);

  // Fetch exchange rates when currency changes
  const fetchExchangeRates = useCallback(async (fromCurrency = 'LKR', toCurrency = selectedCurrency) => {
    if (fromCurrency === toCurrency) {
      const rate = 1;
      setExchangeRates(prev => ({ ...prev, [`${fromCurrency}_${toCurrency}`]: rate }));
      return rate;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}`;
    
    // Check if we have cached rates (valid for 1 minute)
    try {
      const cachedData = localStorage.getItem(`exchangeRate_${cacheKey}`);
      if (cachedData) {
        const { rate, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        if (now - timestamp < 60000) { // 1 minute cache
          setExchangeRates(prev => ({ ...prev, [cacheKey]: rate }));
          return rate;
        }
      }
    } catch (error) {
      console.warn('Failed to read cached exchange rate:', error);
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/ee302ff3be157ca6a021f6a0/pair/${fromCurrency}/${toCurrency}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.conversion_rate) {
        const rate = data.conversion_rate;
        setExchangeRates(prev => ({ ...prev, [cacheKey]: rate }));
        
        // Cache the rate
        try {
          localStorage.setItem(`exchangeRate_${cacheKey}`, JSON.stringify({
            rate,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('Failed to cache exchange rate:', error);
        }
        
        return rate;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Return 1 as fallback to prevent conversion errors
      const fallbackRate = 1;
      setExchangeRates(prev => ({ ...prev, [cacheKey]: fallbackRate }));
      return fallbackRate;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCurrency]);

  // Convert amount from one currency to another
  const convertAmount = useCallback(async (amount, fromCurrency = 'LKR', toCurrency = selectedCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    try {
      const rate = await fetchExchangeRates(fromCurrency, toCurrency);
      return Math.round((amount * rate) * 100) / 100;
    } catch (error) {
      console.error('Error converting amount:', error);
      return amount; // Return original amount on error
    }
  }, [fetchExchangeRates, selectedCurrency]);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currencyCode = selectedCurrency) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }, [currencies, selectedCurrency]);

  // Get currency name
  const getCurrencyName = useCallback((currencyCode = selectedCurrency) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.name : currencyCode;
  }, [currencies, selectedCurrency]);

  // Format amount with currency symbol
  const formatAmount = useCallback((amount, currencyCode = selectedCurrency, showSymbol = true) => {
    try {
      // Validate the amount
      if (amount === undefined || amount === null || isNaN(amount)) {
        console.warn('formatAmount: Invalid amount received:', amount);
        return showSymbol ? `${getCurrencySymbol(currencyCode)} 0` : '0';
      }
      
      const symbol = getCurrencySymbol(currencyCode);
      const formattedAmount = Number(amount).toLocaleString();
      return showSymbol ? `${symbol} ${formattedAmount}` : formattedAmount;
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount}`;
    }
  }, [getCurrencySymbol, selectedCurrency]);

  const value = useMemo(() => ({
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    exchangeRates,
    isLoading,
    fetchExchangeRates,
    convertAmount,
    getCurrencySymbol,
    getCurrencyName,
    formatAmount,
  }), [
    selectedCurrency,
    currencies,
    exchangeRates,
    isLoading,
    fetchExchangeRates,
    convertAmount,
    getCurrencySymbol,
    getCurrencyName,
    formatAmount,
  ]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
