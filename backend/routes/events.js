const express = require("express");
const router = express.Router();
const db = require("../models/db");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // 👈 Import Multer
const path = require("path");     // 👈 Import Path

const fs = require("fs"); // 👈 Import File System

// Check if 'uploads' folder exists, if not, create it
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// =========================================================
// 📸 IMAGE UPLOAD CONFIGURATION
// =========================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in the 'uploads' folder in your backend
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    // Rename file to unique name: event-TIMESTAMP.jpg
    cb(null, "event-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// =========================================================
// 🛡️ MIDDLEWARE: Verify Token
// =========================================================
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

// =========================================================
// 🌎 PUBLIC ROUTES
// =========================================================

// 1. GET ALL EVENTS (Public - For Guests & Attendees)
// 1. GET ALL EVENTS (Public - With Seat Calculation)
router.get("/", async (req, res) => {
  try {
    const { location, date } = req.query;
    
    // 🧠 SQL MAGIC:
    // 1. Select all event data
    // 2. Count bookings for that event
    // 3. Calculate "available_seats"
    let query = `
      SELECT e.*, 
      (e.capacity - COUNT(b.booking_id)) AS available_seats
      FROM events e
      LEFT JOIN bookings b ON e.event_id = b.event_id
      WHERE 1=1
    `;
    
    const params = [];

    if (location) {
      query += " AND e.location LIKE ?";
      params.push(`%${location}%`);
    }

    if (date) {
      query += " AND e.date = ?";
      params.push(date);
    }
    
    // We must Group By to make the COUNT() function work correctly
    query += " GROUP BY e.event_id ORDER BY e.date ASC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// 🔒 ORGANIZER ROUTES
// =========================================================

// 2. GET "MY EVENTS" (For Organizer Dashboard)
router.get("/my-events", authenticateToken, async (req, res) => {
  try {
    // Only fetch events created by the logged-in user
    const [rows] = await db.query(
      "SELECT * FROM events WHERE organizer_id = ? ORDER BY date DESC", 
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET ATTENDEES (Manage Registrations & Revenue)
router.get("/:id/attendees", authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const organizerId = req.user.user_id;

    // Security Check: Ensure this event belongs to this organizer
    const [event] = await db.query(
      "SELECT * FROM events WHERE event_id = ? AND organizer_id = ?",
      [eventId, organizerId]
    );

    if (event.length === 0) {
      return res.status(403).json({ error: "Unauthorized or Event not found" });
    }

    // Fetch list of users who booked this event
    const [attendees] = await db.query(
      `SELECT u.name, u.email, b.booking_date, b.status 
       FROM bookings b 
       JOIN users u ON b.user_id = u.user_id 
       WHERE b.event_id = ?`,
      [eventId]
    );

    res.json({ 
      event: event[0],
      attendees: attendees,
      total_revenue: attendees.length * event[0].price // Calculate Revenue
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching attendees" });
  }
});

// 4. CREATE EVENT (With File Upload Support)
// 🛑 Note: We added 'upload.single("image")' here
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only organizers can create events" });
    }

    // Deconstruct fields (From FormData, numbers come as strings so we might need parsing)
    const { 
      title, description, date, location, 
      price, mode, meeting_link, capacity 
    } = req.body;

    // Validation
    if (!title || !date) {
      return res.status(400).json({ error: "Title and Date are required" });
    }

    // 📸 IMAGE LOGIC: Check if a file was uploaded
    let imageUrl = "https://via.placeholder.com/300"; // Default
    if (req.file) {
      // Create a URL pointing to your backend uploads folder
      imageUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    }

    const finalCapacity = capacity || 100;
    const finalMode = mode || 'physical';
    const finalPrice = price || 0;

    await db.query(
      `INSERT INTO events 
      (title, description, date, location, price, image_url, mode, meeting_link, capacity, organizer_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, date, location, finalPrice, imageUrl, 
        finalMode, meeting_link, finalCapacity, req.user.user_id
      ]
    );

    res.json({ message: "✅ Event created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating event" });
  }
});

// 5. DELETE EVENT (Organizer Owns It OR Admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.user_id;

    let query = "DELETE FROM events WHERE event_id = ? AND organizer_id = ?";
    let params = [eventId, userId];

    // Admin can delete ANY event
    if (req.user.role === 'admin') {
       query = "DELETE FROM events WHERE event_id = ?";
       params = [eventId];
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found or unauthorized" });
    }

    res.json({ message: "🗑️ Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;