// /src/pages/Payments.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added for redirect
import axios from "../api/axiosConfig";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ✅ Load publishable key from .env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

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

  // 💳 Handle Stripe payment flow
  const handlePay = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!stripe || !elements) {
      setMsg("Stripe is not ready yet.");
      return;
    }
    if (!selectedBookingId) {
      setMsg("Please select a booking first.");
      return;
    }
    if (!amountCents) {
      setMsg("Enter a valid amount (e.g., 19.99).");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // 1️⃣ Create PaymentIntent on backend
      const { data } = await axios.post(
        "/payments/create-intent",
        {
          amount: amountCents,
          currency: "usd",
          booking_id: selectedBookingId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientSecret = data?.clientSecret;
      if (!clientSecret) {
        setMsg("No client secret returned from server.");
        setSubmitting(false);
        return;
      }

      // 2️⃣ Confirm payment on client
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        setMsg(`Payment failed: ${result.error.message}`);
        setSubmitting(false);
        onResult?.({ ok: false, error: result.error.message });
        return;
      }

      // 3️⃣ If payment succeeded, save to DB
      if (result.paymentIntent?.status === "succeeded") {
        try {
          await axios.post(
            "/payments/confirm", // ✅ Correct backend route
            {
              booking_id: selectedBookingId,
              amount: (amountCents / 100).toFixed(2),
              payment_method: "card",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) {
          console.warn("Payment saved to DB failed:", e);
        }

        setMsg("✅ Payment succeeded!");
        onResult?.({ ok: true }); // Notify parent component
        card?.clear();
      } else {
        setMsg("Payment did not complete.");
        onResult?.({ ok: false, error: "not_succeeded" });
      }
    } catch (err) {
      console.error("Payment error:", err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Unexpected error while paying";
      setMsg(`Payment failed: ${apiMsg}`);
      onResult?.({ ok: false, error: apiMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay} style={{ maxWidth: 420, marginTop: 16 }}>
      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          background: "#fff",
        }}
      >
        <CardElement options={{ hidePostalCode: false }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn btn-primary w-100" // Use Bootstrap class if available
        style={{
            padding: "10px 16px",
            background: "#635bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
        }}
      >
        {submitting ? "Processing..." : `Pay $${Number(amountInput || 0).toFixed(2)}`}
      </button>

      {msg && (
        <p style={{ marginTop: 10, color: msg.startsWith("✅") ? "green" : "crimson" }}>
          {msg}
        </p>
      )}
    </form>
  );
}

export default function Payments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [amount, setAmount] = useState("19.99");
  const [statusMsg, setStatusMsg] = useState("");
  
  const navigate = useNavigate(); // ✅ Hook for redirection

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.bookings || [];
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setStatusMsg("Could not load your bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="container mt-4">
      <h2>💳 Make a Payment</h2>

      {/* Helpful debug line if publishable key isn’t loading */}
      <pre className="text-muted small">
        Stripe Status: {process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ? "Active" : "Missing Key"}
      </pre>

      {loading ? (
        <p>Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <>
          <label style={{ display: "block", marginTop: 12 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Choose a booking:</span>
            <select
              className="form-select" // Bootstrap styling
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              style={{ maxWidth: "400px" }}
            >
              <option value="">-- Select booking --</option>
              {bookings.map((b) => (
                <option key={b.booking_id} value={b.booking_id}>
                  #{b.booking_id} — {b.event_name || `Event ${b.event_id}`} —{" "}
                  {new Date(b.booking_date).toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Amount (USD):</span>
            <input
              type="number"
              className="form-control" // Bootstrap styling
              min="0.50"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ maxWidth: "150px" }}
            />
          </label>

          <div style={{ marginTop: 18 }}>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                selectedBookingId={selectedBookingId}
                amountInput={amount}
                onResult={(r) => {
                  if (r?.ok) {
                    setStatusMsg("✅ Payment successful! Redirecting to tickets...");
                    // ✅ REDIRECT LOGIC
                    setTimeout(() => {
                        navigate("/bookings"); 
                    }, 2000); // Wait 2 seconds so they see the success message
                  } else if (r?.error) {
                    setStatusMsg(`Payment failed: ${r.error}`);
                  }
                }}
              />
            </Elements>
          </div>

          {statusMsg && (
            <div 
                className={`alert mt-3 ${statusMsg.includes("success") ? "alert-success" : "alert-danger"}`}
                role="alert"
            >
              {statusMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}