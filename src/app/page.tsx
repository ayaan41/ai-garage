"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [garages, setGarages] = useState<any[]>([]);
  const [reg, setReg] = useState("");
  const [make, setMake] = useState("");
  const [service, setService] = useState("MOT - £54.99");
  const [selectedGarage, setSelectedGarage] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetchGarages(); }, []);
  const fetchGarages = async () => {
    const { data } = await supabase.from("garages").select("*").order("name");
    if(data && data.length>0){ setGarages(data); setSelectedGarage(data[0]); }
  };

  const bookNow = async () => {
    if(!reg || !name || !phone || !selectedGarage) return alert("Fill all fields and select garage");
    setLoading(true);
    const { error } = await supabase.from("bookings").insert([{
      reg_number: reg.toUpperCase(),
      make,
      service_type: service,
      garage_name: selectedGarage.name,
      garage_email: selectedGarage.email,
      garage_id: selectedGarage.id,
      customer_name: name,
      customer_phone: phone,
      status: "pending"
    }]);
    setLoading(false);
    if(error) alert(error.message);
    else { alert(`✅ Booked at ${selectedGarage.name}! They will call you in 15 mins.`); setReg(""); setName(""); setPhone(""); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#fff", padding:20, fontFamily:"Inter, sans-serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, fontWeight:900 }}> <div style={{ width:10, height:10, background:"#facc15", borderRadius:"50%", boxShadow:"0 0 16px #facc15" }} /> AI GARAGE • CUMBERNAULD</div>
          <a href="/garage/login" style={{ background:"#fff", color:"#000", padding:"8px 14px", borderRadius:20, fontWeight:900, textDecoration:"none", fontSize:12 }}>Garage Login</a>
        </nav>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginTop:32 }}>
          <div>
            <h1 style={{ fontSize:48, fontWeight:900, lineHeight:0.9, letterSpacing:-2, margin:0 }}>Your car<br/>deserves<br/><span style={{color:"#facc15"}}>better.</span></h1>
            <p style={{ color:"rgba(255,255,255,0.6)", marginTop:12 }}>Select garage → AI checks MOT → Book in 30 seconds</p>
            
            <div style={{ marginTop:20, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:16 }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:1, color:"rgba(255,255,255,0.5)", margin:"0 0 10px" }}>SELECT GARAGE (ONLY THEIR BOOKINGS GO TO THEM)</p>
              {garages.map(g=>(
                <div key={g.id} onClick={()=>setSelectedGarage(g)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:12, borderRadius:10, cursor:"pointer", background: selectedGarage?.id===g.id ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.04)", border: selectedGarage?.id===g.id ? "1px solid #facc15" : "1px solid rgba(255,255,255,0.08)", marginBottom:8 }}>
                  <div><b style={{ display:"block", fontSize:13 }}>{g.name}</b><span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{g.address} • {g.phone}</span></div>
                  <span style={{ fontSize:11, background: selectedGarage?.id===g.id ? "#facc15" : "rgba(255,255,255,0.1)", color: selectedGarage?.id===g.id ? "#000" : "#fff", padding:"4px 8px", borderRadius:10, fontWeight:900 }}>{selectedGarage?.id===g.id ? "SELECTED" : "SELECT"}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:24, padding:20 }}>
            <h3 style={{ margin:"0 0 12px", fontWeight:900 }}>Book at {selectedGarage?.name || "Garage"}</h3>
            <label style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)" }}>REG NUMBER</label>
            <input value={reg} onChange={e=>setReg(e.target.value.toUpperCase())} placeholder="SK19 ABU" style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", margin:"6px 0 12px" }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)" }}>MAKE</label><input value={make} onChange={e=>setMake(e.target.value)} placeholder="BMW" style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", marginTop:6 }} /></div>
              <div><label style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)" }}>SERVICE</label><select value={service} onChange={e=>setService(e.target.value)} style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", marginTop:6 }}><option>MOT - £54.99</option><option>Full Service - £149</option><option>Brakes - £89</option><option>Tyres</option></select></div>
            </div>
            <label style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)", marginTop:12, display:"block" }}>YOUR NAME</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", margin:"6px 0 12px" }} />
            <label style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.5)" }}>PHONE</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07xxx xxxxxx" style={{ width:"100%", padding:12, borderRadius:10, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", margin:"6px 0 12px" }} />
            <button onClick={bookNow} disabled={loading} style={{ width:"100%", background:"#facc15", color:"#000", padding:14, borderRadius:12, border:"none", fontWeight:900, cursor:"pointer", marginTop:8 }}>{loading ? "Booking..." : `Book at ${selectedGarage?.name || "Garage"} →`}</button>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:10 }}>✓ Booking will go ONLY to {selectedGarage?.name} - private & secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
