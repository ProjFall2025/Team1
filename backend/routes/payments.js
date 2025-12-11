const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const { verifyToken } = require("../controllers/middleware/auth");
require("dotenv").config(); // Load environment variables first!

// ✅ Initialize Stripe once using secret key from .env
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ------------------- ROUTES -------------------

// ✅ Create Stripe Payment Intent (used by frontend)
router.post("/create-intent", verifyToken, async (req, res) => {
  try {
    const { amount, currency = "usd", booking_id } = req.body;
    const user_id = req.user?.user_id;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount (in cents) required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.floor(amount), // amount in cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { user_id, booking_id },
    });

    console.log("✅ Stripe PaymentIntent created:", paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ Stripe create-intent error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// ✅ Confirm payment and record it in database
router.post("/confirm", verifyToken, async (req, res) => {
  try {
    let { booking_id, amount, payment_method = "stripe" } = req.body;

// 🔒 Normalize payment_method to a valid ENUM value
const validMethods = ["credit_card", "debit_card", "upi", "cash", "stripe"];
if (!validMethods.includes(payment_method)) {
  payment_method = "stripe"; // fallback to stripe if frontend sent something invalid like 'card'
}

    const user_id = req.user?.user_id;

    if (!booking_id || !user_id || !amount) {
      return res.status(400).json({ message: "Booking ID, user ID and amount required" });
    }

    const [result] = await pool.query(
      `INSERT INTO payments (booking_id, user_id, amount, payment_method, status)
       VALUES (?, ?, ?, ?, 'success')`,
      [booking_id, user_id, amount, payment_method]
    );

    res.json({
      message: "✅ Payment recorded successfully",
      payment: {
        payment_id: result.insertId,
        booking_id,
        user_id,
        amount,
        payment_method,
        status: "success",
      },
    });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({ message: "Server error while recording payment" });
  }
});

// ✅ Get all payments (Admin only)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.payment_id, p.booking_id, p.user_id, u.name AS user_name,
        p.amount, p.payment_method, p.status, p.created_at
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC
    `);
    res.json({ payments: rows });
  } catch (err) {
    console.error("❌ Error fetching all payments:", err);
    res.status(500).json({ message: "Server error while fetching payments" });
  }
});

// ✅ Get logged-in user's payments
router.get("/my", verifyToken, async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(400).json({ message: "User ID required" });

    const [rows] = await pool.query(
      `SELECT 
        p.payment_id, p.booking_id, p.amount, p.payment_method, 
        p.status, p.created_at
       FROM payments p
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [user_id]
    );

    res.json({ payments: rows });
  } catch (err) {
    console.error("❌ Error fetching user payments:", err);
    res.status(500).json({ message: "Server error while fetching payments" });
  }
});

module.exports = router;
