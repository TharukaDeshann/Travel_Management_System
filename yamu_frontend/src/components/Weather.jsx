import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import yamuLogo from '../images/yamu-logo.png';

const Weather = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const weather = location.state?.weather;

  if (!weather) {
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
            <h2 style={styles.title}>No Weather Data Found</h2>
            <p style={styles.message}>Please search for a city to see weather details.</p>
            <button onClick={() => navigate("/weather")} style={styles.button}>
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Convert weather condition code to more readable description
  const getWeatherDescription = (code) => {
    const descriptions = {
      '01': 'Clear sky',
      '02': 'Few clouds',
      '03': 'Scattered clouds',
      '04': 'Broken clouds',
      '09': 'Shower rain',
      '10': 'Rain',
      '11': 'Thunderstorm',
      '13': 'Snow',
      '50': 'Mist'
    };
    const codePrefix = weather.weather[0].icon.slice(0, 2);
    return descriptions[codePrefix] || weather.weather[0].description;
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
          <h1 style={styles.title}>
            Weather in {weather.name}
            <span style={styles.country}>, {weather.sys.country}</span>
          </h1>
          
          <div style={styles.weatherIcon}>
            <img 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
          </div>

          <div style={styles.tempContainer}>
            <span style={styles.temperature}>{Math.round(weather.main.temp)}°C</span>
            <span style={styles.description}>{getWeatherDescription(weather.weather[0].icon)}</span>
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.label}>Feels like</span>
              <span style={styles.value}>{Math.round(weather.main.feels_like)}°C</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Humidity</span>
              <span style={styles.value}>{weather.main.humidity}%</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Wind Speed</span>
              <span style={styles.value}>{Math.round(weather.wind.speed * 3.6)} km/h</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.label}>Pressure</span>
              <span style={styles.value}>{weather.main.pressure} hPa</span>
            </div>
          </div>

          <button onClick={() => navigate("/weather")} style={styles.button}>
            Back to Search
          </button>
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
    minHeight: "calc(100vh - 80px)",
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
  country: {
    fontSize: "20px",
    color: "#666"
  },
  weatherIcon: {
    textAlign: "center",
    margin: "10px 0"
  },
  tempContainer: {
    textAlign: "center",
    margin: "20px 0"
  },
  temperature: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#532321",
    display: "block"
  },
  description: {
    fontSize: "20px",
    color: "#666",
    textTransform: "capitalize"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    margin: "30px 0"
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  label: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px"
  },
  value: {
    fontSize: "18px",
    color: "#333",
    fontWeight: "500"
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
  message: {
    color: "#666",
    marginBottom: "20px",
    textAlign: "center"
  }
};

export default Weather;
