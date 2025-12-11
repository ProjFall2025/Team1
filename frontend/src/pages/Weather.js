import React, { useState } from "react";
import axios from "axios";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);

  const fetchWeather = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=21706f5acb475e46171f95d6739799bf&units=metric`
      );
      setData(res.data);
    } catch {
      alert("City not found!");
    }
  };

  return (
    <div style={{ backgroundColor: "#fafana", minHeight: "100vh" }}>
      <div style={{ marginTop: "100px", textAlign: "center" }}>
        <h2>🌦 Weather Info</h2>
        <form onSubmit={fetchWeather}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
          />
          <button type="submit">Search</button>
        </form>
        {data && (
          <div style={{ marginTop: "20px" }}>
            <h3>{data.name}</h3>
            <p>{data.weather[0].description}</p>
            <p>🌡 {data.main.temp} °C</p>
          </div>
        )}
      </div>
    </div>
  );
}
