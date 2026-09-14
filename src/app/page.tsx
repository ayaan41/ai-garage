"use client";
import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

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
    if (!form.name || !form.phone) { alert("Name aur Phone likho pehle!"); return; }
    const msg = `Hi ${selectedGarage.name}! Booking:\nName: ${form.name}\nPhone: ${form.phone}\nCar: ${form.carReg}\nService: ${form.serviceType}\nTime: ${selectedGarage.time}\nFrom: AI Garage`;
    const url = `https://wa.me/${selectedGarage.phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setShowModal(false);
  };

  const handleSystemBook = async () => {
    if (!form.name || !form.phone) { alert("Name aur Phone likho pehle!"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          customer_name: form.name,
          phone: form.phone,
          car_reg: form.carReg,
          service_type: form.serviceType,
          garage_name: selectedGarage.name,
          status: "pending",
        },
      ]);
      if (error) throw error;
      alert("✅ Booking saved! Garage dashboard pe jayegi");
      setShowModal(false);
      setForm({ name: "", phone: "", carReg: "", serviceType: "MOT" });
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #000",
    marginBottom: "12px",
    color: "#000000",
    background: "#FFFFFF",
    fontWeight: "600" as const,
    fontSize: "16px",
    WebkitTextFillColor: "#000000",
  };

  const smallInputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #000",
    color: "#000000",
    background: "#FFFFFF",
    fontWeight: "600" as const,
    fontSize: "15px",
    WebkitTextFillColor: "#000000",
  };

  return (
    <div style={{ background: "black", minHeight: "100vh", padding: "40px 20px" }}>
      <style>{`
        input::placeholder { color: #000 !important; opacity: 0.6 !important; }
        input { color: #000 !important; -webkit-text-fill-color: #000 !important; }
      `}</style>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ color: "white", fontSize: "28px", fontWeight: "bold" }}>AI Garage - Customer LIVE</h1>
        <p style={{ color: "#888", marginBottom: "30px" }}>Postcode: G20 6 | Price Compare | Call / WhatsApp Book 🔴 LIVE</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          {GARAGES.map((g) => (
            <div key={g.id} style={{ background: "white", borderRadius: "12px", padding: "20px", border: "2px solid #000" }}>
              <h3 style={{ color: "black", fontWeight: "bold", margin: 0, fontSize: "18px" }}>{g.name}</h3>
              <p style={{ color: "#000", fontSize: "14px", margin: "5px 0", fontWeight: "600" }}>{g.distance} - {g.time}</p>
              <p style={{ color: "#000", fontSize: "14px", fontWeight: "700" }}>MOT £{g.motPrice} | Service £{g.servicePrice}</p>
              <button onClick={() => openBook(g)} style={{ width: "100%", background: "black", color: "white", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "15px", fontWeight: "bold" }}>
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedGarage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "25px", width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto", border: "3px solid #000" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "black", fontWeight: "900", margin: 0, fontSize: "20px" }}>{selectedGarage.name}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "black", color: "white", border: "none", fontSize: "20px", cursor: "pointer", borderRadius: "50%", width: "30px", height: "30px" }}>✕</button>
            </div>
            <p style={{ color: "black", fontSize: "14px", margin: "5px 0 20px", fontWeight: "700" }}>MOT £{selectedGarage.motPrice} | Service £{selectedGarage.servicePrice} • {selectedGarage.distance}</p>

            <input placeholder="YOUR NAME - Dark Black" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <input placeholder="PHONE 07..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={smallInputStyle} />
              <input placeholder="CAR REG SK19..." value={form.carReg} onChange={(e) => setForm({ ...form, carReg: e.target.value })} style={smallInputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} style={smallInputStyle}>
                <option>MOT</option>
                <option>Service</option>
                <option>MOT + Service</option>
              </select>
              <input value={selectedGarage.time} readOnly style={{ ...smallInputStyle, background: "#e5e5e5" }} />
            </div>

            <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", borderRadius: "12px", padding: "12px", marginBottom: "15px" }}>
              <p style={{ color: "#15803d", fontSize: "12px", fontWeight: "900", margin: "0 0 10px" }}>⚡ FAST • 30 SEC • RECOMMENDED ON MOBILE</p>
              <button onClick={handleWhatsApp} style={{ width: "100%", background: "#16a34a", color: "white", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "16px" }}>
                Book via WhatsApp Fast ⚡
              </button>
              <p style={{ color: "#15803d", fontSize: "11px", textAlign: "center", margin: "8px 0 0", fontWeight: "700" }}>Direct message to garage - instant reply</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
              <div style={{ flex: 1, height: "2px", background: "#000" }}></div>
              <span style={{ background: "black", color: "white", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "900" }}>OR</span>
              <div style={{ flex: 1, height: "2px", background: "#000" }}></div>
            </div>

            <div style={{ background: "#f9f9f9", border: "2px solid #000", borderRadius: "12px", padding: "12px" }}>
              <p style={{ color: "#000", fontSize: "12px", fontWeight: "900", margin: "0 0 10px" }}>🔒 PRO • SAVE TO SYSTEM • TRACKING</p>
              <button onClick={handleSystemBook} disabled={loading} style={{ width: "100%", background: "black", color: "white", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "16px" }}>
                {loading ? "Saving..." : "Confirm Booking - Save to System"}
              </button>
              <p style={{ color: "#000", fontSize: "11px", textAlign: "center", margin: "8px 0 0", fontWeight: "700" }}>Saved in Supabase → Garage dashboard pe jayega</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
