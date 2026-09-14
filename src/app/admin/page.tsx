"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function SuperAdmin() {
  const [garages, setGarages] = useState<any[]>([]);
  const [email, setEmail] = useState("admin@ai-garage.com");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [newGarage, setNewGarage] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(() => { checkSession(); }, []);
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.email === "admin@ai-garage.com") { setIsLogged(true); fetchGarages(); }
  };
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else { setIsLogged(true); fetchGarages(); }
  };
  const fetchGarages = async () => {
    const { data } = await supabase.from("garages").select("*").order("created_at", { ascending: false });
    if (data) setGarages(data);
  };
  const addGarage = async () => {
    if (!newGarage.name || !newGarage.email) { alert("Name and Email required"); return; }
    const tempPass = "Garage@" + Math.floor(Math.random()*10000);
    const { error: authError } = await supabase.auth.signUp({
      email: newGarage.email, password: tempPass,
      options: { data: { role: "garage", garage_name: newGarage.name } }
    });
    if (authError) { alert(authError.message); return; }
    await supabase.from("garages").insert([{ name: newGarage.name, email: newGarage.email, phone: newGarage.phone, address: newGarage.address, temp_password: tempPass }]);
    alert(`Added! Email: ${newGarage.email} | Pass: ${tempPass}`);
    setNewGarage({ name: "", email: "", phone: "", address: "" });
    fetchGarages();
  };

  if (!isLogged) {
    return (
      <div className="login-wrapper">
        <div className="bg-gold-lines"></div>
        <div className="glass-card">
          <h1 className="title">Super Admin</h1>
          <p className="subtitle">Manage all garages - Premium Access</p>
          <div className="form">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin Email" className="glass-input" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="glass-input" />
            <button onClick={handleLogin} className="gold-btn">Login →</button>
          </div>
        </div>
        <style jsx global>{`
          .login-wrapper { min-height: 100vh; background: #0a0a0a; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 20px; }
          .bg-gold-lines { position: absolute; inset: 0; background: radial-gradient(ellipse at top, rgba(250,204,21,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(250,204,21,0.1) 0%, transparent 60%), linear-gradient(120deg, #000 0%, #111 50%, #000 100%); }
          .bg-gold-lines::before { content: ""; position: absolute; inset: -50%; background: repeating-linear-gradient(100deg, transparent 0px, transparent 80px, rgba(250,204,21,0.03) 80px, rgba(250,204,21,0.08) 82px), repeating-linear-gradient(-20deg, transparent 0px, transparent 120px, rgba(250,204,21,0.05) 120px, rgba(250,204,21,0.1) 122px); animation: flow 20s linear infinite; }
          @keyframes flow { from { transform: translateX(-10%) rotate(0deg); } to { transform: translateX(10%) rotate(1deg); } }
          .glass-card { width: 100%; max-width: 440px; background: rgba(255,255,255,0.06); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 32px; z-index: 1; box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); }
          .title { color: #fff; font-size: 28px; font-weight: 800; margin: 0; }
          .subtitle { color: rgba(255,255,255,0.6); font-size: 13px; margin: 8px 0 24px; }
          .form { display: flex; flex-direction: column; gap: 12px; }
          .glass-input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #fff; outline: none; }
          .glass-input:focus { border-color: rgba(250,204,21,0.5); }
          .gold-btn { width: 100%; padding: 14px; background: #facc15; color: #000; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 20px rgba(250,204,21,0.3); }
          .gold-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(250,204,21,0.4); }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: 20, position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 24 }}>Super Admin Panel</h1>
          <button onClick={async()=>{await supabase.auth.signOut(); setIsLogged(false);}} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: 10, cursor: "pointer" }}>Logout</button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 24 }}>
          <h3 style={{ color: "#fff", fontWeight: 800 }}>+ Add New Garage</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <input placeholder="Garage Name" value={newGarage.name} onChange={e=>setNewGarage({...newGarage, name: e.target.value})} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            <input placeholder="Garage Email (login)" value={newGarage.email} onChange={e=>setNewGarage({...newGarage, email: e.target.value})} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            <input placeholder="Phone" value={newGarage.phone} onChange={e=>setNewGarage({...newGarage, phone: e.target.value})} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            <input placeholder="Address" value={newGarage.address} onChange={e=>setNewGarage({...newGarage, address: e.target.value})} style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
          </div>
          <button onClick={addGarage} style={{ marginTop: 16, background: "#facc15", color: "#000", padding: "12px 20px", borderRadius: 10, border: "none", fontWeight: 800, cursor: "pointer" }}>Add Garage & Create Login →</button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 24, marginTop: 20 }}>
          <h3 style={{ color: "#fff" }}>Total Garages: {garages.length}</h3>
          {garages.map(g=>(
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, marginTop: 10, background: "rgba(255,255,255,0.04)" }}>
              <div>
                <p style={{ color: "#fff", fontWeight: 800, margin: 0 }}>{g.name}</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0 }}>{g.email} | {g.phone}</p>
                {g.temp_password && <p style={{ color: "#facc15", fontSize: 11, margin: 0 }}>Temp: {g.temp_password}</p>}
              </div>
              <button onClick={()=>{ if(confirm("Delete?")) { supabase.from("garages").delete().eq("id", g.id).then(()=>fetchGarages()); } }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
