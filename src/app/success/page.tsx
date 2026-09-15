"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get("booking_ref") || "GLA-UNKNOWN";
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", color: "white", background: "#111", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ fontSize: "60px" }}>✅</div>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#22c55e", marginTop: "20px" }}>Payment Successful!</h1>
      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #333", borderRadius: "12px", background: "#1a1a1a" }}>
        <p style={{ fontSize: "12px", color: "#666" }}>BOOKING REFERENCE</p>
        <p style={{ fontSize: "26px", fontWeight: "bold", color: "#facc15", marginTop: "8px", letterSpacing: "2px" }}>{bookingRef}</p>
        <p style={{ marginTop: "10px", fontSize: "13px", color: "#aaa" }}>Save this ref - Customer + Admin same Ref!</p>
      </div>
      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <Link href={`/track/${bookingRef}`} style={{ flex: 1, padding: "14px", background: "#facc15", color: "black", fontWeight: "bold", borderRadius: "8px", textDecoration: "none" }}>Track Booking</Link>
        <Link href="/" style={{ flex: 1, padding: "14px", background: "#222", color: "white", borderRadius: "8px", border: "1px solid #333", textDecoration: "none" }}>Home</Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", color: "white", background: "#111", minHeight: "100vh", textAlign: "center" }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}