"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings").then(r => r.json()).then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto", color: "white", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>🔧 Admin - All Bookings</h1>
      <p style={{ color: "#666", fontSize: "12px", marginTop: "5px" }}>Unique Ref: GLA-XXXX - Customer + Tumhara same</p>
      {loading? <p style={{ marginTop: "20px" }}>Loading...</p> : (
        <div style={{ marginTop: "25px", border: "1px solid #333", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.7fr 0.7fr", background: "#1a1a1a", padding: "12px", fontSize: "12px", color: "#888", fontWeight: "bold" }}>
            <div>BOOKING REF</div><div>GARAGE</div><div>SERVICE</div><div>AMOUNT</div><div>STATUS</div>
          </div>
          {bookings.length === 0? <p style={{ padding: "20px", color: "#555" }}>No bookings yet</p> :
            bookings.map((b: any) => (
              <div key={b.booking_ref || b.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.7fr 0.7fr", padding: "12px", borderTop: "1px solid #222", fontSize: "13px" }}>
                <div style={{ color: "#facc15", fontWeight: "bold" }}>{b.booking_ref}</div>
                <div style={{ color: "#aaa" }}>{(b.garage_name || b.garage?.name || "").slice(0, 20)}</div>
                <div style={{ color: "#aaa" }}>{b.service || b.service_type}</div>
                <div>£{b.amount || 50}</div>
                <div style={{ color: b.status === 'paid'? '#22c55e' : '#f59e0b' }}>{b.status}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}