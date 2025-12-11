import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  // Get auth details
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name"); // ✅ Get name for display

  // ✅ SAFE FIX: Closes the mobile menu only if it's open
  const handleLinkClick = () => {
    const navbarCollapse = document.getElementById("navbarNav");
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      const toggler = document.querySelector(".navbar-toggler");
      if (toggler) toggler.click();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert("👋 Logged out successfully!");
    navigate("/login");
    window.location.reload();
  };

  return (
    // 🎨 BEAUTIFICATION: 'navbar-light' for dark text, 'fixed-top' to stay visible
    <nav 
      className="navbar navbar-expand-lg navbar-light fixed-top px-3"
      style={{
        background: "rgba(255, 255, 255, 0.85)", // Glass effect
        backdropFilter: "blur(12px)",             // Blurry background
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.3)"
      }}
    >
      <div className="container">
        {/* Brand Logo with Gradient Text */}
        <Link 
          className="navbar-brand fw-bold d-flex align-items-center gap-2" 
          to="/home" 
          onClick={handleLinkClick}
          style={{ fontSize: "1.5rem", letterSpacing: "-0.5px" }}
        >
          <span style={{ fontSize: "1.8rem" }}>🎉</span> 
          <span style={{ 
            background: "linear-gradient(135deg, #6366f1, #a855f7)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent" 
          }}>
            Eventuraa
          </span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
          style={{ outline: "none", boxShadow: "none" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            
            {/* --- PUBLIC LINKS --- */}
            
            {/* Hide "Browse Events" for Organizers (They use Dashboard) */}
            {role !== "organizer" && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/events" onClick={handleLinkClick}>
                  Browse Events
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/weather" onClick={handleLinkClick}>
                🌦 Weather
              </Link>
            </li>

            {/* --- GUEST LINKS --- */}
            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/login" onClick={handleLinkClick}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="btn btn-primary text-white fw-bold px-4 shadow-sm" 
                    to="/register" 
                    onClick={handleLinkClick}
                    style={{ borderRadius: "12px" }}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              // --- LOGGED IN LINKS ---
              <>
                {role === "attendee" && (
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold text-primary" to="/bookings" onClick={handleLinkClick}>
                      My Tickets
                    </Link>
                  </li>
                )}

                {role === "organizer" && (
                  <li className="nav-item">
                    <Link className="nav-link fw-bold text-warning" to="/organizer-dashboard" onClick={handleLinkClick}>
                      Dashboard
                    </Link>
                  </li>
                )}

                {role === "admin" && (
                  <li className="nav-item">
                    <Link className="nav-link fw-bold text-danger" to="/admin" onClick={handleLinkClick}>
                      Admin Panel
                    </Link>
                  </li>
                )}

                {/* Profile Link with Name */}
                <li className="nav-item">
                  <Link className="nav-link fw-bold text-dark" to="/profile" onClick={handleLinkClick}>
                    👤 {name || "Profile"}
                  </Link>
                </li>
                
                {/* Logout Button */}
                <li className="nav-item">
                  <button 
                    onClick={() => { handleLinkClick(); handleLogout(); }} 
                    className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
                    style={{ borderRadius: "20px", marginLeft: "10px" }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;