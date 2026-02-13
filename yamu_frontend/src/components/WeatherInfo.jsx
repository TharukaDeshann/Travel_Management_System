import React from 'react';
import { getWeatherIcon, formatTemperature } from '../services/weatherService';

const WeatherInfo = ({ weatherData, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-blue-600 text-sm">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <span className="text-red-600 text-sm">⚠️ Weather unavailable</span>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getWeatherIcon(weatherData.condition)}</span>
          <div>
            <div className="font-semibold text-blue-800 text-sm">
              {formatTemperature(weatherData.temperature)}
            </div>
            <div className="text-blue-600 text-xs">
              {weatherData.condition}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-blue-600">
          <div>💧 {weatherData.humidity}%</div>
          <div className="text-blue-500">{weatherData.date}</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
