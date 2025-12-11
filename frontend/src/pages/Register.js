import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // FIX: Default state must match DB ENUM ('attendee'), not 'user'
  const [role, setRole] = useState("attendee"); 
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure this URL matches your backend port (usually 5000 or 5001)
      const res = await axios.post("http://localhost:5001/api/users/register", {
        name,
        email,
        password,
        role,
      });
      
      alert(res.data.message || "✅ Registered successfully!");
      navigate("/login"); // Use React Router to redirect instead of window.location
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.error || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Create Account</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label>Full Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>I want to register as:</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {/* FIX: Values match DB ENUMs exactly */}
            <option value="attendee">Attendee (Book Events)</option>
            <option value="organizer">Organizer (Create Events)</option>
          </select>
          <div className="form-text">
            Note: Admin registration is restricted.
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-center mt-3">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}

export default Register;