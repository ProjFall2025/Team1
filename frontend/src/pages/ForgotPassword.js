import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Sending email...");
    try {
      await axios.post("http://localhost:5001/api/users/forgot-password", { email });
      setMsg("✅ Check your inbox! A reset link has been sent.");
    } catch (err) {
      setMsg("❌ Error: " + (err.response?.data?.error || "Failed to send"));
    }
  };

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: "400px" }}>
      <h2>🔑 Forgot Password?</h2>
      <p className="text-muted">Enter your email to receive a reset link.</p>
      
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3 text-start">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Send Reset Link</button>
      </form>
      
      {msg && <p className="mt-3 fw-bold">{msg}</p>}
    </div>
  );
}