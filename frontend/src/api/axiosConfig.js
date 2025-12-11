import axios from "axios";

const api = axios.create({
  // 👇 This handles the switch automatically
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
});

// Optional: Add this to automatically attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;