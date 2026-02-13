import { useState, useEffect, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext';

export const useCurrencyConverter = () => {
  const {
    selectedCurrency,
    convertAmount,
    formatAmount,
    getCurrencySymbol,
    isLoading
  } = useCurrency();

  // Convert a single amount
  const convertSingleAmount = useCallback(async (amount, fromCurrency = 'LKR') => {
    try {
      return await convertAmount(amount, fromCurrency, selectedCurrency);
    } catch (error) {
      console.error('Error converting single amount:', error);
      return amount;
    }
  }, [convertAmount, selectedCurrency]);

  // Convert an array of items with prices
  const convertItemPrices = useCallback(async (items, priceField = 'price', fromCurrency = 'LKR') => {
    if (!Array.isArray(items)) return items;
    
    try {
      const convertedItems = await Promise.all(
        items.map(async (item) => {
          if (item[priceField] !== undefined) {
            const convertedPrice = await convertAmount(item[priceField], fromCurrency, selectedCurrency);
            return {
              ...item,
              [`converted${priceField.charAt(0).toUpperCase() + priceField.slice(1)}`]: convertedPrice,
              originalPrice: item[priceField],
              originalCurrency: fromCurrency
            };
          }
          return item;
        })
      );
      
      return convertedItems;
    } catch (error) {
      console.error('Error converting item prices:', error);
      return items;
    }
  }, [convertAmount, selectedCurrency]);

  // Convert packages (specific for your use case)
  const convertPackages = useCallback(async (packages, fromCurrency = 'LKR') => {
    if (!Array.isArray(packages)) return [];
    
    try {
      const convertedPackages = await Promise.all(
        packages.map(async (pkg) => {
          const convertedPrice = await convertAmount(
            pkg.budgetPerPerson, 
            fromCurrency, 
            selectedCurrency
          );
          return {
            ...pkg,
            convertedPrice,
            originalPrice: pkg.budgetPerPerson,
            originalCurrency: fromCurrency
          };
        })
      );
      
      return convertedPackages;
    } catch (error) {
      console.error('Error converting packages:', error);
      return packages;
    }
  }, [convertAmount, selectedCurrency]);

  return {
    selectedCurrency,
    convertSingleAmount,
    convertItemPrices,
    convertPackages,
    formatAmount,
    getCurrencySymbol,
    isLoading
  };
};

// Hook for handling price display with automatic conversion
export const usePriceDisplay = (price, fromCurrency = 'LKR') => {
  const { selectedCurrency, convertAmount, formatAmount } = useCurrency();
  const [convertedPrice, setConvertedPrice] = useState(price);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const convert = async () => {
      // Validate the price input
      if (price === undefined || price === null || isNaN(price) || price < 0) {
        console.warn('usePriceDisplay: Invalid price value:', price);
        if (isMounted) setConvertedPrice(0);
        return;
      }

      if (fromCurrency === selectedCurrency) {
        if (isMounted) setConvertedPrice(price);
        return;
      }

      setIsConverting(true);
      try {
        const converted = await convertAmount(price, fromCurrency, selectedCurrency);
        if (isMounted) setConvertedPrice(converted);
      } catch (error) {
        console.error('Error converting price:', error);
        if (isMounted) setConvertedPrice(price);
      } finally {
        if (isMounted) setIsConverting(false);
      }
    };

    convert();

    return () => {
      isMounted = false;
    };
  }, [price, fromCurrency, selectedCurrency, convertAmount]);

  return {
    convertedPrice,
    formattedPrice: formatAmount(convertedPrice, selectedCurrency),
    isConverting,
    originalPrice: price,
    originalCurrency: fromCurrency
  };
};
