import React, { useState, useEffect } from "react";

const API_KEY = "dfc11c5ddc264f6191bd008aec37ec29"; // API key

// Emoji mapping using Unicode escape sequences
const WEATHER_EMOJIS = {
  // Day time emojis
  clearDay: '\u2600\uFE0F',        // sun
  cloudyDay: '\u26C5\uFE0F',       // sun behind cloud
  rainyDay: '\uD83C\uDF26\uFE0F',  // sun behind rain cloud
  stormDay: '\u26C8\uFE0F',        // cloud with lightning and rain
  snowDay: '\u2744\uFE0F',         // snowflake
  defaultDay: '\uD83C\uDF0D',      // earth globe
  
  // Night time emojis
  clearNight: '\uD83C\uDF19',      // crescent moon
  cloudyNight: '\u2601\uFE0F',     // cloud
  rainyNight: '\uD83C\uDF27\uFE0F', // cloud with rain
  stormNight: '\uD83C\uDF29\uFE0F', // cloud with lightning
  snowNight: '\uD83C\uDF28\uFE0F',  // cloud with snow
  defaultNight: '\uD83C\uDF0E',    // earth globe
  
  // All weather emojis
  fog: '\uD83C\uDF2B\uFE0F',       // fog
  unknown: '\u2753'                // question mark
};

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Fetching...");

  useEffect(() => {
    //check if the browser supports geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;//get the latitude and longitude
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

  const fetchWeather = async (lat, lon) => {//from openweathermap
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();//parse the response as json

      if (data.name) {//check the response contains a name
        setLocation(data.name);//set the location to the name
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

  //check if day or night
  const isDayTime = (sunrise, sunset, timezone) => {
    const now = Math.floor(Date.now() / 1000); // Current time in UTC
    const localTime = now + timezone; // Adjusted to city's local time
    return localTime >= sunrise && localTime < sunset; 
  };

  const getWeatherEmoji = (description, sunrise, sunset, timezone) => {
    if (!description) return WEATHER_EMOJIS.unknown;

    const condition = description.toLowerCase();
    const day = isDayTime(sunrise, sunset, timezone); // Check if it's day or night

    if (condition.includes("clear")) {
      return day ? WEATHER_EMOJIS.clearDay : WEATHER_EMOJIS.clearNight;
    }
    if (condition.includes("cloud")) {
      return day ? WEATHER_EMOJIS.cloudyDay : WEATHER_EMOJIS.cloudyNight;
    }
    if (condition.includes("rain")) {
      return day ? WEATHER_EMOJIS.rainyDay : WEATHER_EMOJIS.rainyNight;
    }
    if (condition.includes("storm")) {
      return day ? WEATHER_EMOJIS.stormDay : WEATHER_EMOJIS.stormNight;
    }
    if (condition.includes("snow")) {
      return day ? WEATHER_EMOJIS.snowDay : WEATHER_EMOJIS.snowNight;
    }
    if (condition.includes("mist") || condition.includes("fog")) {
      return WEATHER_EMOJIS.fog;
    }
    
    return day ? WEATHER_EMOJIS.defaultDay : WEATHER_EMOJIS.defaultNight;
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
