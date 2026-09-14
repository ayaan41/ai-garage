"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    fetchBookings();
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: "900", margin: 0 }}>🔧 Garage Dashboard</h1>
            <p style={{ color: "#888", margin: "5px 0 0" }}>QuickFit Cumbernauld - LIVE Bookings</p>
          </div>
          <button onClick={fetchBookings} style={{ background: "#fff", color: "#000", padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "900", cursor: "pointer" }}>↻ Refresh</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: "3px solid #000" }}>
            <p style={{ color: "#000", fontWeight: "900", fontSize: "12px", margin: 0 }}>TOTAL BOOKINGS</p>
            <p style={{ color: "#000", fontSize: "32px", fontWeight: "900", margin: "5px 0 0" }}>{bookings.length}</p>
          </div>
          <div style={{ background: "#facc15", padding: "20px", borderRadius: "15px", border: "3px solid #000" }}>
            <p style={{ color: "#000", fontWeight: "900", fontSize: "12px", margin: 0 }}>PENDING / APPROVED</p>
            <p style={{ color: "#000", fontSize: "32px", fontWeight: "900", margin: "5px 0 0" }}>{bookings.filter(b=> b.status !== "completed").length}</p>
          </div>
          <div style={{ background: "#22c55e", padding: "20px", borderRadius: "15px", border: "3px solid #000" }}>
            <p style={{ color: "#000", fontWeight: "900", fontSize: "12px", margin: 0 }}>COMPLETED</p>
            <p style={{ color: "#000", fontSize: "32px", fontWeight: "900", margin: "5px 0 0" }}>{bookings.filter(b=> b.status === "completed").length}</p>
          </div>
        </div>

        {loading ? <p style={{ color: "#fff" }}>Loading bookings...</p> : (
          <div style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", border: "3px solid #000" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#000" }}>
                  <tr>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>CUSTOMER</th>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>PHONE</th>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>CAR REG</th>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>SERVICE</th>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>TIME</th>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>STATUS</th>
                    <th style={{ color: "#fff", padding: "15px", textAlign: "left", fontSize: "12px" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "2px solid #eee" }}>
                      <td style={{ padding: "15px", color: "#000", fontWeight: "900", fontSize: "14px" }}>{b.customer_name}</td>
                      <td style={{ padding: "15px", color: "#000", fontWeight: "700", fontSize: "14px" }}>{b.phone}</td>
                      <td style={{ padding: "15px", color: "#000", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>{b.car_reg}</td>
                      <td style={{ padding: "15px", color: "#000", fontWeight: "700", fontSize: "13px" }}>{b.service_type}</td>
                      <td style={{ padding: "15px", color: "#666", fontWeight: "700", fontSize: "12px" }}>{new Date(b.created_at).toLocaleString()}</td>
                      <td style={{ padding: "15px" }}>
                        <span style={{ background: b.status==="completed"?"#22c55e":b.status==="pending"?"#facc15":"#000", color: b.status==="pending"?"#000":"#fff", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "900", textTransform: "uppercase" }}>{b.status}</span>
                      </td>
                      <td style={{ padding: "15px", display: "flex", gap: "5px" }}>
                        <a href={`https://wa.me/44${b.phone.substring(1)}?text=Hi ${b.customer_name}, your booking for ${b.car_reg} confirmed!`} target="_blank" style={{ background: "#16a34a", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", textDecoration: "none" }}>WhatsApp</a>
                        <button onClick={() => updateStatus(b.id, b.status)} style={{ background: "#000", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", border: "none", cursor: "pointer" }}>{b.status==="completed"?"Undo" :"Done"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length===0 && <p style={{ padding: "30px", textAlign: "center", color: "#000", fontWeight: "900" }}>No bookings yet - customer site se booking karo!</p>}
            </div>
          </div>
        )}

        <p style={{ color: "#666", textAlign: "center", marginTop: "30px", fontSize: "12px" }}>Customer site: ai-garage-tan.vercel.app | Garage dashboard: ai-garage-tan.vercel.app/garage</p>
      </div>
    </div>
  );
}
