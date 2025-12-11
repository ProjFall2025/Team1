import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  // Get user details to personalize the experience
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* --- HERO SECTION --- */}
      <div 
        className="text-center text-white d-flex flex-column justify-content-center align-items-center" 
        style={{ 
          // 🎨 Beautification: High-quality background image with gradient overlay
          backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover", 
          backgroundPosition: "center", 
          minHeight: "85vh",
          padding: "20px"
        }}
      >
        <h1 className="display-3 fw-bold mb-3" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
          Welcome to Eventuraa✨
        </h1>
        <p className="lead mb-5" style={{ maxWidth: "700px", fontSize: "1.25rem", opacity: "0.9" }}>
          The easiest way to discover, book, and host amazing events in your city.
          Start your next adventure today.
        </p>

        {/* Dynamic Buttons based on Login Status */}
        {!token ? (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/events" className="btn btn-primary btn-lg px-5 py-3 shadow">
              Browse Events
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="bg-glass p-4 rounded shadow-lg" style={{ backdropFilter: "blur(5px)", backgroundColor: "rgba(255,255,255,0.1)" }}>
            <h3 className="mb-2">👋 Welcome back, {name}!</h3>
            <p className="mb-4 text-white-50">What would you like to do today?</p>
            
            <div className="d-flex flex-wrap justify-content-center gap-3">
              
              {/* 🛑 LOGIC: Hide 'Explore Events' if the user is an Organizer */}
              {role !== "organizer" && (
                <Link to="/events" className="btn btn-primary btn-lg shadow">
                  Explore Events
                </Link>
              )}
              
              {/* ✅ LOGIC: Show Dashboard link ONLY if they are an Organizer */}
              {role === "organizer" && (
                <Link to="/organizer-dashboard" className="btn btn-warning btn-lg text-dark shadow">
                  Manage My Events
                </Link>
              )}
              
              {/* ✅ LOGIC: Show Bookings link ONLY if they are an Attendee */}
              {role === "attendee" && (
                <Link to="/bookings" className="btn btn-success btn-lg shadow">
                  View My Tickets
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="container py-5" style={{ marginTop: "-50px", position: "relative", zIndex: "2" }}>
        <div className="row text-center g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow p-4 border-0">
              <div className="fs-1 mb-3 text-primary">📅</div>
              <h5 className="card-title fw-bold">Discover Events</h5>
              <p className="card-text text-muted">
                Find concerts, workshops, and meetups happening around you with our curated lists.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow p-4 border-0">
              <div className="fs-1 mb-3 text-primary">🎟️</div>
              <h5 className="card-title fw-bold">Easy Booking</h5>
              <p className="card-text text-muted">
                Secure your spot in seconds with our seamless booking system and instant QR tickets.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow p-4 border-0">
              <div className="fs-1 mb-3 text-primary">☀️</div>
              <h5 className="card-title fw-bold">Plan Ahead</h5>
              <p className="card-text text-muted">
                Check the weather forecast for your event location instantly so you are never unprepared.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}