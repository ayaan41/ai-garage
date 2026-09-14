"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const GARAGES = [
  { id: 1, name: "QuickFit Cumbernauld", distance: "0.3 miles", time: "Today 3:00 PM", motPrice: 45, servicePrice: 120, phone: "447123456789" },
  { id: 2, name: "Glasgow MOT Centre", distance: "0.8 miles", time: "Tomorrow 9:00 AM", motPrice: 49, servicePrice: 135, phone: "447123456789" },
  { id: 3, name: "AutoCare G20", distance: "1.2 miles", time: "Today 4:30 PM", motPrice: 42, servicePrice: 110, phone: "447123456789" },
];

export default function Home() {
  const [selectedGarage, setSelectedGarage] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", carReg: "", serviceType: "MOT" });

  const openBook = (garage: any) => {
    setSelectedGarage(garage);
    setShowModal(true);
  };

  const handleWhatsApp = () => {
    if (!form.name || !form.phone) { alert("Name aur Phone likho!"); return; }
    const msg = `Hi ${selectedGarage.name}! Booking: Name: ${form.name} Phone: ${form.phone} Car: ${form.carReg} Service: ${form.serviceType} Time: ${selectedGarage.time}`;
    window.open(`https://wa.me/${selectedGarage.phone}?text=${encodeURIComponent(msg)}`, "_blank");
    setShowModal(false);
  };

  const handleSystemBook = async () => {
    if (!form.name || !form.phone) { alert("Name aur Phone likho!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert([{ customer_name: form.name, phone: form.phone, car_reg: form.carReg, service_type: form.serviceType, garage_name: selectedGarage.name, status: "pending" }]);
      if (error) throw error;
      alert("✅ Booking saved! Garage dashboard pe chali gayi");
      setShowModal(false);
      setForm({ name: "", phone: "", carReg: "", serviceType: "MOT" });
    } catch (e: any) { alert("Error: " + e.message); }
    setLoading(false);
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: "bold" }}>AI Garage - Customer LIVE</h1>
        <p style={{ color: "#888", marginBottom: "30px" }}>Postcode: G20 6 | Price Compare 🔴 LIVE</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {GARAGES.map((g) => (
            <div key={g.id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "3px solid #000" }}>
              <h3 style={{ color: "#000", fontWeight: "900", margin: 0, fontSize: "18px" }}>{g.name}</h3>
              <p style={{ color: "#000", fontSize: "14px", margin: "5px 0", fontWeight: "700" }}>{g.distance} - {g.time}</p>
              <p style={{ color: "#000", fontSize: "14px", fontWeight: "900" }}>MOT £{g.motPrice} | Service £{g.servicePrice}</p>
              <button onClick={() => openBook(g)} style={{ width: "100%", background: "#000", color: "#fff", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "15px", fontWeight: "bold" }}>Book Now</button>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedGarage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "25px", width: "100%", maxWidth: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h2 style={{ color: "#000", fontWeight: "900", margin: 0, fontSize: "20px" }}>{selectedGarage.name}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "#000", color: "#fff", border: "none", fontSize: "18px", cursor: "pointer", borderRadius: "50%", width: "32px", height: "32px" }}>✕</button>
            </div>
            <p style={{ color: "#000", fontSize: "14px", margin: "0 0 20px", fontWeight: "700" }}>MOT £{selectedGarage.motPrice} | Service £{selectedGarage.servicePrice} • {selectedGarage.distance}</p>

            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="YOUR NAME" 
              style={{ width: "100%", height: "48px", padding: "0 12px", borderRadius: "10px", border: "3px solid #000", marginBottom: "12px", color: "#000", background: "#fff", fontSize: "16px", fontWeight: "900" }} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="PHONE 07..." 
                style={{ height: "48px", padding: "0 12px", borderRadius: "10px", border: "3px solid #000", color: "#000", background: "#fff", fontSize: "15px", fontWeight: "900" }} />
              <input value={form.carReg} onChange={(e) => setForm({ ...form, carReg: e.target.value })} placeholder="CAR REG" 
                style={{ height: "48px", padding: "0 12px", borderRadius: "10px", border: "3px solid #000", color: "#000", background: "#fff", fontSize: "15px", fontWeight: "900" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} 
                style={{ height: "48px", padding: "0 12px", borderRadius: "10px", border: "3px solid #000", color: "#000", background: "#fff", fontSize: "14px", fontWeight: "900" }}>
                <option>MOT</option><option>Service</option><option>MOT + Service</option>
              </select>
              <input value={selectedGarage.time} readOnly style={{ height: "48px", padding: "0 12px", borderRadius: "10px", border: "3px solid #000", color: "#000", background: "#e5e5e5", fontSize: "13px", fontWeight: "900" }} />
            </div>

            <div style={{ background: "#f0fdf4", border: "3px solid #16a34a", borderRadius: "12px", padding: "12px", marginBottom: "15px" }}>
              <p style={{ color: "#15803d", fontSize: "11px", fontWeight: "900", margin: "0 0 8px" }}>⚡ FAST • 30 SEC • RECOMMENDED ON MOBILE</p>
              <button onClick={handleWhatsApp} style={{ width: "100%", background: "#16a34a", color: "#fff", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "15px" }}>Book via WhatsApp Fast ⚡</button>
            </div>

            <div style={{ background: "#f5f5f5", border: "3px solid #000", borderRadius: "12px", padding: "12px" }}>
              <p style={{ color: "#000", fontSize: "11px", fontWeight: "900", margin: "0 0 8px" }}>🔒 PRO • SAVE TO SYSTEM</p>
              <button onClick={handleSystemBook} disabled={loading} style={{ width: "100%", background: "#000", color: "#fff", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "15px" }}>{loading ? "Saving..." : "Confirm Booking - Save to System"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
