import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Weather = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const weather = location.state?.weather;

  if (!weather) {
    return (
      <div>
        <h2>No Weather Data Found</h2>
        <button onClick={() => navigate("/weather")}>Back to Search</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Weather in {weather.name}, {weather.sys.country}
        </h1>
        <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
        <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> {weather.wind.speed} m/s</p>
        <p><strong>Description:</strong> {weather.weather[0].description}</p>
        <button onClick={() => navigate("/weather")} style={styles.button}>
          Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  card: { backgroundColor: "#fff", padding: "20px", borderRadius: "10px", textAlign: "center" },
  title: { fontSize: "24px", marginBottom: "10px" },
  button: { padding: "10px", width: "100%", background: "gray", color: "white", cursor: "pointer" },
};

export default Weather;
