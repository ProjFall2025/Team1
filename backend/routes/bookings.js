const express = require("express");
const router = express.Router();
const db = require("../models/db");
const jwt = require("jsonwebtoken");

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Get User Bookings
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.booking_id, e.title AS event_name, b.booking_date, b.status 
       FROM bookings b JOIN events e ON b.event_id = e.event_id 
       WHERE b.user_id = ?`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching bookings" });
  }
});

// CREATE BOOKING (With Capacity Check)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { event_id } = req.body;
    const userId = req.user.user_id;

    // 1. Check if User already booked (Prevent double booking)
    const [existing] = await db.query(
      "SELECT * FROM bookings WHERE user_id = ? AND event_id = ?",
      [userId, event_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "⚠️ You already booked this event!" });
    }

    // 2. CHECK SEAT AVAILABILITY (The new logic)
    const [eventData] = await db.query("SELECT capacity FROM events WHERE event_id = ?", [event_id]);
    const [bookingCount] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE event_id = ?", [event_id]);
    
    const capacity = eventData[0].capacity;
    const currentBookings = bookingCount[0].count;

    if (currentBookings >= capacity) {
      return res.status(400).json({ error: "❌ Sold Out! No seats available." });
    }

    // 3. Create Booking
    await db.query(
      "INSERT INTO bookings (user_id, event_id, status) VALUES (?, ?, 'confirmed')",
      [userId, event_id]
    );

    res.json({ message: "✅ Booking successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ DELETE Booking (The 24-Hour Rule)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.user_id;

    // 1. Get Event Date
    const [booking] = await db.query(
      `SELECT b.booking_id, e.date 
       FROM bookings b 
       JOIN events e ON b.event_id = e.event_id 
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [bookingId, userId]
    );

    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    // 2. Check Time Difference
    const eventDate = new Date(booking[0].date);
    const now = new Date();
    const diffHours = (eventDate - now) / (1000 * 60 * 60);

    // 🛑 UPDATED LOGIC:
    // Only block if the event is in the FUTURE (diffHours > 0)
    // AND starts in less than 24 hours.
    // This allows you to delete past events (where diffHours is negative).
    if (diffHours > 0 && diffHours < 24) {
      return res.status(400).json({ 
        error: "❌ Cannot cancel. Event starts in less than 24 hours." 
      });
    }

    // 3. Delete
    await db.query("DELETE FROM bookings WHERE booking_id = ?", [bookingId]);
    res.json({ message: "✅ Booking cancelled successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;