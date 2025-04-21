import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import yamuLogo from '../images/yamu-logo.png';

const API_KEY = "60a812acea9defd9b340c6082663b878";

const WeatherPage = () => {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message || 'City not found. Please try again.');
      }

      // Navigate to Weather component with data
      navigate("/weather-details", { 
        state: { weather: data }
      });

    } catch (error) {
      setError(error.message || "Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div>
      <nav className="nav-container">
        <div className="logo-container">
          <img src={yamuLogo} alt="YAMU Logo" className="nav-logo-image" />
          <h1 className="nav-logo">YAMU</h1>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>What is the city that you currently in?</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
            <button 
              type="submit" 
              style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
              disabled={loading}
            >
              {loading ? "Getting Weather..." : "Get Weather"}
            </button>
          </form>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    minHeight: "calc(100vh - 80px)", // Account for nav height
    padding: "20px"
  },
  card: { 
    backgroundColor: "#fff", 
    padding: "30px", 
    borderRadius: "12px", 
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px"
  },
  title: { 
    fontSize: "24px", 
    marginBottom: "20px",
    color: "#333",
    textAlign: "center"
  },
  form: {
    width: "100%"
  },
  input: { 
    padding: "12px", 
    marginBottom: "15px", 
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px"
  },
  button: { 
    padding: "12px", 
    width: "100%", 
    background: "#532321", 
    color: "white", 
    cursor: "pointer",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    transition: "background 0.3s ease"
  },
  buttonDisabled: {
    background: "#cccccc",
    cursor: "not-allowed"
  },
  error: { 
    color: "#dc3545", 
    marginTop: "10px",
    textAlign: "center" 
  }
};

export default WeatherPage;
