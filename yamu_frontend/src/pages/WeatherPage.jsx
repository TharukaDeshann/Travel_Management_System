import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = "dfc11c5ddc264f6191bd008aec37ec29"; // Replace with your actual API key

const WeatherPage = () => {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchWeather = async () => {
    if (!city) {
      setError("Please enter a city name.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod !== 200) {
        setError("City not found. Please try again.");
        return;
      }

      // Navigate to Weather page with data
      navigate("/weather-details", { state: { weather: data } });

    } catch (error) {
      setError("Error fetching weather data.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>What is the city that you currently in?</h1>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
          required
        />
        <button onClick={fetchWeather} style={styles.button}>
          Get Weather
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  card: { backgroundColor: "#fff", padding: "20px", borderRadius: "10px", textAlign: "center" },
  title: { fontSize: "24px", marginBottom: "10px" },
  input: { padding: "10px", marginBottom: "10px", width: "100%" },
  button: { padding: "10px", width: "100%", background: "blue", color: "white", cursor: "pointer" },
  error: { color: "red", marginTop: "10px" },
};

export default WeatherPage;
