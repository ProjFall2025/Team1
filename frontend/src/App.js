import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Weather from "./pages/Weather";
import AdminPanel from "./pages/AdminPanel";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
// ✅ Import the new Organizer Dashboard
import OrganizerDashboard from "./pages/OrganizerDashboard"; 

function App() {
  return (
    <Router>
      <Navbar /> {/* ✅ Only one navbar here */}
      <div style={{ marginTop: "80px", padding: "20px", minHeight: "100vh" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/events" element={<Events />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User / Attendee Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/payments" element={<Payments />} />
          

          {/* ✅ Organizer Route (New) */}
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;