"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("booking_ref") || "GLA-UNKNOWN";
  const garage = searchParams.get("garage") || "";

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", color: "white", background: "#111", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ fontSize: "60px", marginBottom: "20px" }}>✅</div>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#22c55e" }}>Payment Successful!</h1>
      <p style={{ marginTop: "15px", color: "#aaa" }}>Your booking is confirmed</p>

      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #333", borderRadius: "12px", background: "#1a1a1a" }}>
        <p style={{ fontSize: "12px", color: "#666", letterSpacing: "1px" }}>BOOKING REFERENCE</p>
        <p style={{ fontSize: "26px", fontWeight: "bold", color: "#facc15", marginTop: "8px", letterSpacing: "2px" }}>{bookingRef}</p>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>Garage ID: {garage.slice(0,8).toUpperCase()}</p>
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <Link href={`/track/${bookingRef}`} style={{ flex: 1, padding: "14px", background: "#facc15", color: "black", fontWeight: "bold", borderRadius: "8px", textDecoration: "none" }}>
          Track Booking
        </Link>
        <Link href="/" style={{ flex: 1, padding: "14px", background: "#222", color: "white", fontWeight: "bold", borderRadius: "8px", border: "1px solid #333", textDecoration: "none" }}>
          Home
        </Link>
      </div>

      <p style={{ fontSize: "12px", color: "#555", marginTop: "20px" }}>
        SMS confirmation sent! Save your Booking Ref: {bookingRef}
      </p>
    </div>
  );
}