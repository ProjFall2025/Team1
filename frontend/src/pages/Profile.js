import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig"; // ✅ use centralized axios instance


export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return;
        }

        const res = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        

        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please log in again.");
        localStorage.removeItem("token");
      }
    };

    fetchProfile();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      
      <div style={{ marginTop: "100px", padding: "20px", textAlign: "center" }}>
        <h2>👤 Profile</h2>
        {user ? (
          <div style={{ lineHeight: "1.8" }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Joined On:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
}
