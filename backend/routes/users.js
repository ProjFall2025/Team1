const express = require("express");
const router = express.Router();
const db = require("../models/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Built-in Node module for generating tokens

// ✅ MIDDLEWARE: Verifies Token & Extracts User Info
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // { user_id: 1, role: 'admin' }
    next();
  });
}

// --------------------- REGISTER ---------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Fields required" });

    // Check if email exists
    const [exists] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ error: "Email already exists" });

    // Hash Password
    const hashed = await bcrypt.hash(password, 10);

    // Validate Role (Block 'admin' registration via public API)
    const allowed = ["attendee", "organizer"];
    const finalRole = allowed.includes(role) ? role : "attendee";

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, finalRole]
    );

    res.json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------- LOGIN ---------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find User
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(400).json({ error: "User not found" });

    const user = rows[0];

    // Verify Password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    // Generate Token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login success", token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------- PROFILE ---------------------
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id; 
    const [rows] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });

    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================================================
// 👑 ADMIN ROUTES (NEW)
// =========================================================

// 1. GET ALL USERS (Admin Dashboard)
router.get("/admin/users", authenticateToken, async (req, res) => {
  try {
    // strict check for admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const [rows] = await db.query("SELECT user_id, name, email, role, created_at FROM users");
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 2. DELETE USER (Ban/Remove User)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    await db.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================================================
// 📧 FORGOT PASSWORD SYSTEM
// =========================================================

// 1. REQUEST RESET LINK (Sends Email)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // 1. Check if user exists
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: "User with this email does not exist." });
    }

    // 2. Generate Token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. Save Token to DB
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [token, expiry, email]
    );

    // 4. Configure Email Transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ✅ Safe: loads from .env
        pass: process.env.EMAIL_PASS  // ✅ Safe: loads from .env
      }
    });

    // 5. Send Email
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    
    await transporter.sendMail({
      from: '"Eventuraa Support" <no-reply@eventuraa.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>You requested a password reset. Click the link below to verify:</p>
        <a href="${resetLink}">Click Here to Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    res.json({ message: "✅ Reset link sent to your email!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// 2. RESET PASSWORD (Verifies Token & Updates DB)
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Find user with valid token
    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // 2. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update Password & Clear Token
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE user_id = ?",
      [hashedPassword, users[0].user_id]
    );

    res.json({ message: "✅ Password reset successfully! You can now login." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;