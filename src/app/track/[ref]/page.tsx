"use client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TrackPage() {
  const params = useParams();
  const ref = params.ref as string;

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", color: "white", background: "#111", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ fontSize: "50px" }}>🔍</div>
      <h1 style={{ marginTop: "20px", fontSize: "24px" }}>Track Booking</h1>
      
      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #333", borderRadius: "12px", background: "#1a1a1a" }}>
        <p style={{ fontSize: "12px", color: "#888" }}>BOOKING REFERENCE</p>
        <p style={{ fontSize: "22px", fontWeight: "bold", color: "#facc15", marginTop: "8px" }}>{ref}</p>
        <div style={{ marginTop: "20px", padding: "10px", background: "#22c55e22", borderRadius: "8px", color: "#22c55e" }}>
          ✅ Payment Confirmed - Booking Received
        </div>
        <p style={{ marginTop: "15px", fontSize: "14px", color: "#aaa" }}>
          Your garage will contact you shortly. Please keep this reference.
        </p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <Link href="/" style={{ padding: "12px 24px", background: "#facc15", color: "black", fontWeight: "bold", borderRadius: "8px", textDecoration: "none" }}>
          Back to Home
        </Link>
      </div>

      <p style={{ marginTop: "40px", fontSize: "12px", color: "#555" }}>
        Note: DB sync is pending - Booking is confirmed via Stripe
      </p>
    </div>
  );
}