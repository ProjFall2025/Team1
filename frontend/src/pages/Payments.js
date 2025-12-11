import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 👈 Added useLocation
import axios from "../api/axiosConfig";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ✅ Load Stripe Key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function CheckoutForm({ selectedBookingId, amountInput, onResult }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // Convert dollars to cents safely
  const amountCents = useMemo(() => {
    const n = Number(amountInput);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
  }, [amountInput]);

  const handlePay = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!stripe || !elements) return;
    if (!selectedBookingId) {
      setMsg("Please select a booking first.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // 1️⃣ Create PaymentIntent
      const { data } = await axios.post(
        "/payments/create-intent",
        { amount: amountCents, currency: "usd", booking_id: selectedBookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientSecret = data?.clientSecret;
      if (!clientSecret) throw new Error("Server did not return a payment secret.");

      // 2️⃣ Confirm Card Payment
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // 3️⃣ Confirm in Database
      if (result.paymentIntent?.status === "succeeded") {
        await axios.post(
          "/payments/confirm",
          { booking_id: selectedBookingId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMsg("✅ Payment succeeded!");
        onResult?.({ ok: true });
        card?.clear();
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMsg(`Payment failed: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="card p-3 shadow-sm border-0 bg-light">
      <div className="mb-3 bg-white p-3 rounded border">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn btn-primary w-100 fw-bold"
      >
        {submitting ? "Processing..." : `Pay $${Number(amountInput || 0).toFixed(2)}`}
      </button>
      {msg && <div className={`alert mt-2 ${msg.includes("✅") ? "alert-success" : "alert-danger"}`}>{msg}</div>}
    </form>
  );
}

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Access data sent from Events.js
  
  // 1. Try to get data from navigation state (The "Auto-Fill" Magic)
  const incomingBookingId = location.state?.bookingId || "";
  const incomingPrice = location.state?.price || "19.99";

  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(incomingBookingId);
  const [amount, setAmount] = useState(incomingPrice);
  const [statusMsg, setStatusMsg] = useState("");

  // 2. If no incoming booking, fetch list so user can select manually
  useEffect(() => {
    if (!incomingBookingId) {
      const fetchBookings = async () => {
        try {
          const res = await axios.get("/bookings/my-bookings"); // Ensure this matches your route
          const data = Array.isArray(res.data) ? res.data : [];
          // Only show 'pending' bookings
          const pending = data.filter(b => b.status === 'pending');
          setBookings(pending);
        } catch (err) {
          console.error("Failed to load bookings", err);
        }
      };
      fetchBookings();
    }
  }, [incomingBookingId]);

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 fw-bold text-center">💳 Secure Checkout</h2>

      {/* ✅ AUTO-SELECTED VIEW */}
      {incomingBookingId ? (
         <div className="alert alert-info text-center">
            <h5>Paying for Booking #{selectedBookingId}</h5>
            <p className="mb-0">Total: <strong>${amount}</strong></p>
         </div>
      ) : (
        /* ⚠️ MANUAL SELECTION VIEW (Fallback) */
        <div className="mb-4">
          <label className="form-label">Select a Pending Booking:</label>
          <select
            className="form-select"
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
          >
            <option value="">-- Choose Booking --</option>
            {bookings.map((b) => (
              <option key={b.booking_id} value={b.booking_id}>
                 #{b.booking_id} - {b.event_name || b.title}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <label className="form-label">Amount ($)</label>
            <input 
              type="number" 
              className="form-control" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
        </div>
      )}

      {/* STRIPE FORM */}
      <div className="mt-4">
        <Elements stripe={stripePromise}>
          <CheckoutForm
            selectedBookingId={selectedBookingId}
            amountInput={amount}
            onResult={(r) => {
              if (r?.ok) {
                setStatusMsg("✅ Payment successful! Redirecting...");
                setTimeout(() => navigate("/bookings"), 2000);
              }
            }}
          />
        </Elements>
      </div>

      {statusMsg && <div className="alert alert-success mt-3">{statusMsg}</div>}
    </div>
  );
}