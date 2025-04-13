import React, { useState, useEffect } from "react";

const API_KEY = "dfc11c5ddc264f6191bd008aec37ec29"; // Your API key

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Fetching...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation("Location unavailable");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();

      if (data.name) {
        setLocation(data.name);
      }

      setWeather({
        temperature: Math.round(data.main.temp), // Rounded temperature
        description: data.weather[0].main, // Main weather description
        sunrise: data.sys.sunrise, // Sunrise timestamp
        sunset: data.sys.sunset, // Sunset timestamp
        timezone: data.timezone, // Timezone offset in seconds
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const isDayTime = (sunrise, sunset, timezone) => {
    const now = Math.floor(Date.now() / 1000); // Current time in UTC
    const localTime = now + timezone; // Adjusted to city's local time
    return localTime >= sunrise && localTime < sunset; // Returns true if it's daytime
  };

  const getWeatherEmoji = (description, sunrise, sunset, timezone) => {
    if (!description) return "❓"; // Unknown

    const condition = description.toLowerCase();
    const day = isDayTime(sunrise, sunset, timezone); // Check if it's day or night

    if (condition.includes("clear")) return day ? "☀️" : "🌙";
    if (condition.includes("cloud")) return day ? "🌤️" : "☁️";
    if (condition.includes("rain")) return day ? "🌦️" : "🌧️";
    if (condition.includes("storm")) return day ? "⛈️" : "🌩️";
    if (condition.includes("snow")) return day ? "❄️" : "🌨️";
    if (condition.includes("mist") || condition.includes("fog")) return "🌫️";
    
    return day ? "🌍" : "🌎"; // Default icons for day/night
  };

  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow">
      {weather ? (
        <>
          <p className="font-semibold text-gray-800">{location}</p>
          <p className="text-lg font-bold text-blue-600">
            {getWeatherEmoji(weather.description, weather.sunrise, weather.sunset, weather.timezone)} {weather.temperature}°C
          </p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
