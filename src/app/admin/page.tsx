"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SuperAdmin() {
  const [garages, setGarages] = useState<any[]>([]);
  const [email, setEmail] = useState("admin@ai-garage.com");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [newGarage, setNewGarage] = useState({ name: "", email: "", phone: "", address: "" });
  const router = useRouter();

  useEffect(() => { checkSession(); }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.email === "admin@ai-garage.com") {
      setIsLogged(true);
      fetchGarages();
    }
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else { setIsLogged(true); fetchGarages(); }
  };

  const fetchGarages = async () => {
    const { data } = await supabase.from("garages").select("*").order("created_at", { ascending: false });
    if (data) setGarages(data);
  };

  const addGarage = async () => {
    if (!newGarage.name || !newGarage.email) { alert("Name aur Email zaroori hai!"); return; }

    // 1. Auth user banao
    const tempPass = "Garage@" + Math.floor(Math.random()*10000);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newGarage.email,
      password: tempPass,
      options: { data: { role: "garage", garage_name: newGarage.name } }
    });

    if (authError) { alert("Auth Error: " + authError.message); return; }

    // 2. Garages table me insert
    const { error: dbError } = await supabase.from("garages").insert([{
      name: newGarage.name,
      email: newGarage.email,
      phone: newGarage.phone,
      address: newGarage.address,
      temp_password: tempPass
    }]);

    if (dbError) alert("DB Error: " + dbError.message);
    else {
      alert(`Garage Added!\\nEmail: ${newGarage.email}\\nTemp Pass: ${tempPass}\\n\\nGarage wala isse login karke apna password change kar lega!`);
      setNewGarage({ name: "", email: "", phone: "", address: "" });
      fetchGarages();
    }
  };

  const deleteGarage = async (id: string, email: string) => {
    if (!confirm(`Delete ${email}?`)) return;
    await supabase.from("garages").delete().eq("id", id);
    fetchGarages();
  };

  if (!isLogged) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", padding: 30, borderRadius: 20, border: "3px solid #000", width: "100%", maxWidth: 400 }}>
          <h1 style={{ color: "#000", fontWeight: 900, fontSize: 28 }}>👑 Super Admin</h1>
          <p style={{ color: "#666", fontSize: 13 }}>Sirf tumhara login - yahan se saare garages control</p>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin Email" style={{ width: "100%", padding: 14, borderRadius: 10, border: "3px solid #000", marginTop: 20, color: "#000", fontWeight: 700 }} />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{ width: "100%", padding: 14, borderRadius: 10, border: "3px solid #000", marginTop: 12, color: "#000", fontWeight: 700 }} />
          <button onClick={handleLogin} style={{ width: "100%", background: "#000", color: "#fff", padding: 14, borderRadius: 10, border: "none", fontWeight: 900, marginTop: 15, cursor: "pointer" }}>Login →</button>
          <p style={{ fontSize: 11, marginTop: 10, color: "#000" }}>Pehli baar: Supabase me admin@ai-garage.com / admin123 banao</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ color: "#000", fontWeight: 900 }}>👑 Super Admin Panel</h1>
          <button onClick={async()=>{await supabase.auth.signOut(); setIsLogged(false);}} style={{ padding: "8px 16px", borderRadius: 8, border: "3px solid #000", fontWeight: 900 }}>Logout</button>
        </div>

        {/* Add Garage Form */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "3px solid #000", marginTop: 20 }}>
          <h3 style={{ color: "#000", fontWeight: 900, margin: "0 0 15px" }}>+ Naya Garage Add Karo</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input placeholder="Garage Name (e.g. QuickFit Cumbernauld)" value={newGarage.name} onChange={e=>setNewGarage({...newGarage, name: e.target.value})} style={{ padding: 12, borderRadius: 8, border: "2px solid #000", color: "#000", fontWeight: 700 }} />
            <input placeholder="Garage Email (login banega)" value={newGarage.email} onChange={e=>setNewGarage({...newGarage, email: e.target.value})} style={{ padding: 12, borderRadius: 8, border: "2px solid #000", color: "#000", fontWeight: 700 }} />
            <input placeholder="Phone" value={newGarage.phone} onChange={e=>setNewGarage({...newGarage, phone: e.target.value})} style={{ padding: 12, borderRadius: 8, border: "2px solid #000", color: "#000" }} />
            <input placeholder="Address (Cumbernauld G67)" value={newGarage.address} onChange={e=>setNewGarage({...newGarage, address: e.target.value})} style={{ padding: 12, borderRadius: 8, border: "2px solid #000", color: "#000" }} />
          </div>
          <button onClick={addGarage} style={{ marginTop: 15, background: "#facc15", color: "#000", padding: "12px 24px", borderRadius: 10, border: "3px solid #000", fontWeight: 900, cursor: "pointer" }}>Garage Add Karo + Login Banao →</button>
          <p style={{ fontSize: 11, color: "#666", marginTop: 8 }}>Garage wala apne email se login karega aur baad me khud password change kar lega (/garage/profile pe)</p>
        </div>

        {/* Garages List */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "3px solid #000", marginTop: 20 }}>
          <h3 style={{ color: "#000", fontWeight: 900 }}>Total Garages: {garages.length}</h3>
          {garages.map(g=>(
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "2px solid #000", borderRadius: 10, marginTop: 10, background: "#fafafa" }}>
              <div>
                <p style={{ color: "#000", fontWeight: 900, margin: 0 }}>{g.name}</p>
                <p style={{ color: "#666", fontSize: 12, margin: 0 }}>{g.email} | {g.phone} | {g.address}</p>
                {g.temp_password && <p style={{ color: "#d97706", fontSize: 11, margin: 0 }}>Temp Pass: {g.temp_password} (garage ko bhejo)</p>}
              </div>
              <button onClick={()=>deleteGarage(g.id, g.email)} style={{ background: "#ef4444", color: "#fff", border: "2px solid #000", borderRadius: 8, padding: "6px 12px", fontWeight: 900, cursor: "pointer" }}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
