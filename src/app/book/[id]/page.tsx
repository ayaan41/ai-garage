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
    .catch(() => setGarage({ name: "Garage", id }));
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
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Book Garage</h1>
      <p>Garage ID: {id}</p>
      <p style={{ marginTop: "10px", fontWeight: "bold", color: "#facc15" }}>{garage?.name || "Loading..."}</p>

      <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #333", borderRadius: "10px" }}>
        <h3>Service: Full Diagnostics - £50</h3>
        <p style={{ fontSize: "14px", color: "#888", marginTop: "5px" }}>Real Garage Price - Stripe Test</p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{ marginTop: "20px", width: "100%", padding: "15px", background: "#facc15", color: "black", fontWeight: "bold", borderRadius: "8px", cursor: "pointer" }}
        >
          {loading? "Processing..." : "Pay £50 with Card (Stripe)"}
        </button>
      </div>
    </div>
  );
}