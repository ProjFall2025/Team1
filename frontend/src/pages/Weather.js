import React, { useState } from "react";
import axios from "axios";

export default function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city) return;
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=21706f5acb475e46171f95d6739799bf&units=metric`
      );
      setData(res.data);
    } catch (err) {
      setError("❌ City not found! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", marginTop: "50px" }}>
      
      <div className="card shadow-lg border-0 p-4" style={{ maxWidth: "450px", width: "100%", borderRadius: "20px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">🌦 Weather Check</h2>
          <p className="text-muted">Plan your event with confidence.</p>
        </div>

        <form onSubmit={fetchWeather} className="d-flex gap-2 mb-4">
          <input
            className="form-control form-control-lg"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g. New York)"
            autoFocus
          />
          <button type="submit" className="btn btn-primary fw-bold" disabled={loading}>
            {loading ? "..." : "🔍"}
          </button>
        </form>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {data && (
          <div className="text-center animate__animated animate__fadeIn">
            <h3 className="fw-bold">{data.name}, {data.sys.country}</h3>
            
            <div className="my-3">
              <img 
                src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`} 
                alt="weather icon" 
                style={{ width: "100px", height: "100px" }}
              />
              <h1 className="display-4 fw-bold text-dark mb-0">
                {Math.round(data.main.temp)}°C
              </h1>
              <p className="text-capitalize fs-5 text-muted">{data.weather[0].description}</p>
            </div>

            <div className="row mt-4 pt-3 border-top">
              <div className="col-6 border-end">
                <small className="text-muted">Humidity</small>
                <h5 className="fw-bold text-primary">{data.main.humidity}%</h5>
              </div>
              <div className="col-6">
                <small className="text-muted">Wind Speed</small>
                <h5 className="fw-bold text-primary">{data.wind.speed} m/s</h5>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}