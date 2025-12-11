const express = require("express");
const router = express.Router();
const db = require("../models/db");
// ✅ Import the auth middleware correctly
const { verifyToken } = require("../controllers/middleware/auth");

// =========================================================
// ✅ 1. SPECIFIC ROUTES FIRST (Crucial for 404 Fix)
// =========================================================

// GET "MY BOOKINGS" (For Payments Page & Dashboard)
router.get("/my-bookings", verifyToken, async (req, res) => {
  try {
    // We join 'bookings' with 'events' to get the Title and Price
    const [rows] = await db.query(
      `SELECT b.booking_id, e.title AS event_name, b.booking_date, b.status, e.price 
       FROM bookings b 
       JOIN events e ON b.event_id = e.event_id 
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching my bookings:", err);
    res.status(500).json({ error: "Error fetching bookings" });
  }
});

// =========================================================
// ✅ 2. GENERIC ROUTES
// =========================================================

// GET ALL BOOKINGS (For the main list if needed)
router.get("/", verifyToken, async (req, res) => {
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

// CREATE BOOKING (Fixed to return bookingId)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { event_id } = req.body;
    const userId = req.user.user_id;

    // 1. Check double booking
    const [existing] = await db.query(
      "SELECT * FROM bookings WHERE user_id = ? AND event_id = ?",
      [userId, event_id]
    );
    if (existing.length > 0) {
      // Return existing ID so user can proceed to payment
      return res.json({ 
        message: "You already booked this event!", 
        bookingId: existing[0].booking_id 
      });
    }

    // 2. Check Capacity
    const [eventData] = await db.query("SELECT capacity FROM events WHERE event_id = ?", [event_id]);
    const [bookingCount] = await db.query("SELECT COUNT(*) as count FROM bookings WHERE event_id = ?", [event_id]);
    
    // Safety fallback if capacity column is missing
    const capacity = eventData[0]?.capacity || 100;
    const currentBookings = bookingCount[0]?.count || 0;

    if (currentBookings >= capacity) {
      return res.status(400).json({ error: "❌ Sold Out! No seats available." });
    }

    // 3. Create Booking (Status: pending)
    const [result] = await db.query(
      "INSERT INTO bookings (user_id, event_id, status) VALUES (?, ?, 'pending')",
      [userId, event_id]
    );

    // ✅ IMPORTANT: Return bookingId for the Frontend
    res.json({ 
      message: "✅ Booking successful!", 
      bookingId: result.insertId 
    });

  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE BOOKING (24-Hour Rule)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.user_id;

    const [booking] = await db.query(
      `SELECT b.booking_id, e.date 
       FROM bookings b 
       JOIN events e ON b.event_id = e.event_id 
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [bookingId, userId]
    );

    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    const eventDate = new Date(booking[0].date);
    const now = new Date();
    const diffHours = (eventDate - now) / (1000 * 60 * 60);

    if (diffHours > 0 && diffHours < 24) {
      return res.status(400).json({ 
        error: "❌ Cannot cancel. Event starts in less than 24 hours." 
      });
    }

    await db.query("DELETE FROM bookings WHERE booking_id = ?", [bookingId]);
    res.json({ message: "✅ Booking cancelled successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;