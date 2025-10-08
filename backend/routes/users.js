const express = require("express");
const router = express.Router();
const db = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) return res.status(400).json({ error: "Email already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role || "attendee"],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
});

module.exports = router;