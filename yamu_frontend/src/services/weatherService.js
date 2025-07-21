import apiClient from './axiosInstance';

/**
 * Fetch weather data for a specific location and date
 * @param {string} location - The location name
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Promise<Object>} Weather data object
 */
export const fetchWeatherData = async (location, date) => {
  try {
    const response = await apiClient.get('/api/weather', {
      params: {
        location: location,
        date: date
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Get weather icon based on condition
 * @param {string} condition - Weather condition
 * @returns {string} Weather icon emoji
 */
export const getWeatherIcon = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return '☀️';
  } else if (conditionLower.includes('cloud')) {
    return '☁️';
  } else if (conditionLower.includes('rain')) {
    return '🌧️';
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return '⛈️';
  } else if (conditionLower.includes('snow')) {
    return '❄️';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return '🌫️';
  } else if (conditionLower.includes('wind')) {
    return '💨';
  } else {
    return '🌤️'; // Default partly cloudy
  }
};

/**
 * Format temperature with unit
 * @param {number} temperature - Temperature value
 * @param {string} unit - Temperature unit (default: 'C')
 * @returns {string} Formatted temperature string
 */
export const formatTemperature = (temperature, unit = 'C') => {
  return `${temperature}°${unit}`;
};
