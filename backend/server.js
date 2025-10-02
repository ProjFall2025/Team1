const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./models/db");

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Test MySQL route
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      console.error("DB query failed:", err.message);
      return res.status(500).send("Database connection failed: " + err.message);
    }
    res.send("DB is working! 1 + 1 = " + results[0].result);
  });
});

// API routes placeholders
app.use("/api/users", require("./routes/users"));
app.use("/api/events", require("./routes/events"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));