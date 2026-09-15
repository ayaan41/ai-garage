"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BookPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [garage, setGarage] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/garage/${id}`)
   .then(r => r.json())
   .then(data => setGarage(data))
   .catch(() => setGarage({ name: "Glasgow Garage", location: "Glasgow, UK" }));
  }, [id]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageId: id,
          amount: 50,
          service: "Full Diagnostics - £50",
          garageName: garage?.name || "Glasgow Garage"
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error: " + JSON.stringify(data));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", color: "white", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px", fontWeight: "bold" }}>Book Garage</h1>

      <p style={{ fontSize: "12px", color: "#666", letterSpacing: "1px" }}>
        BOOKING REF: {id.slice(0,8).toUpperCase()}
      </p>

      <p style={{ marginTop: "15px", fontWeight: "bold", color: "#facc15", fontSize: "22px" }}>
        {garage?.name || "Glasgow Garage"}
      </p>
      <p style={{ fontSize: "13px", color: "#999", marginTop: "4px" }}>
        📍 Glasgow, UK • ⭐ Verified Garage • 🛠️ MOT & Service
      </p>

      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #333", borderRadius: "12px", background: "#1a1a1a" }}>
        <h3 style={{ fontSize: "16px" }}>Service: Full Diagnostics - £50</h3>
        <p style={{ fontSize: "13px", color: "#888", marginTop: "6px" }}>
          Includes full vehicle health check + report. Pay securely with Stripe.
        </p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{ marginTop: "20px", width: "100%", padding: "15px", background: "#facc15", color: "black", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", border: "none", fontSize: "15px" }}
        >
          {loading? "Processing..." : "Pay £50 with Card (Stripe)"}
        </button>
        <p style={{ fontSize: "11px", color: "#555", marginTop: "10px", textAlign: "center" }}>
          Secure payment powered by Stripe • Test Mode
        </p>
      </div>
    </div>
  );
}