import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

const Price = ({ 
  amount, 
  className = '', 
  showCurrencyCode = false,
  originalCurrency = 'LKR',
  ...props 
}) => {
  const { formatPrice, selectedCurrency, convertPrice } = useCurrency();

  if (!amount || amount === 0) return <span className={className} {...props}>-</span>;

  // If the original currency is different from LKR, we assume it's already in LKR
  const convertedAmount = originalCurrency === 'LKR' ? amount : amount;
  
  const formattedPrice = showCurrencyCode 
    ? `${formatPrice(convertedAmount)} ${selectedCurrency}`
    : formatPrice(convertedAmount);

  return (
    <span className={className} {...props}>
      {formattedPrice}
    </span>
  );
};

export default Price; 