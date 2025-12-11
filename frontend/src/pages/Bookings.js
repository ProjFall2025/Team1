import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react"; // 👈 Import the QR library

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must log in first.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5001/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        console.warn("Unexpected response format:", response.data);
        setBookings([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load bookings:", err);
      setError("Could not fetch bookings. Please try again later.");
      setLoading(false);
    }
  };

  // Handle deleting a booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `http://localhost:5001/api/bookings/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Booking deleted");
      fetchBookings(); // refresh list
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert(err.response?.data?.error || "Failed to delete booking");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet. Book your first event below 👇</p>
      ) : (
        bookings
          .filter((b) => b && b.booking_id)
          .map((b) => (
            <div
              key={b.booking_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "20px",
                margin: "15px 0",
                backgroundColor: "#fff",
                display: "flex", // 👈 Flexbox for Ticket Layout
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}
            >
              {/* LEFT SIDE: Ticket Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{b.event_name}</h3>
                <p style={{ margin: "5px 0" }}>
                  <strong>Date:</strong>{" "}
                  {b.booking_date
                    ? new Date(b.booking_date).toLocaleDateString()
                    : "Unknown"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: b.status === "confirmed" ? "#d4edda" : "#f8d7da",
                      color: b.status === "confirmed" ? "#155724" : "#721c24",
                      fontWeight: "bold"
                    }}
                  >
                    {b.status || "N/A"}
                  </span>
                </p>
                <p style={{ fontSize: "0.9em", color: "#666" }}>Ticket ID: #{b.booking_id}</p>

                <button
                  onClick={() => handleDeleteBooking(b.booking_id)}
                  style={{
                    marginTop: "15px",
                    padding: "8px 16px",
                    backgroundColor: "crimson",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  ❌ Cancel Booking
                </button>
              </div>

              {/* RIGHT SIDE: QR Code (Only if Confirmed) */}
              {b.status === "confirmed" && (
                <div style={{ textAlign: "center", marginLeft: "20px", borderLeft: "1px dashed #ccc", paddingLeft: "20px" }}>
                  <QRCodeCanvas 
                    value={JSON.stringify({ 
                      ticket_id: b.booking_id, 
                      event: b.event_name, 
                      user: "Valid Attendee" 
                    })} 
                    size={120} 
                  />
                  <p style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>Scan for Entry</p>
                </div>
              )}
            </div>
          ))
      )}
    </div>
  );
};

export default Bookings;