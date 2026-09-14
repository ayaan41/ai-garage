"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function GarageLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login failed: " + error.message);
    } else {
      router.push("/garage");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", padding: "30px", borderRadius: "20px", border: "3px solid #000", width: "100%", maxWidth: "400px" }}>
        <h1 style={{ color: "#000", fontSize: "28px", fontWeight: "900", margin: "0 0 10px" }}>🔧 Garage Login</h1>
        <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px" }}>Apne garage ka login dalo</p>
        
        <input placeholder="Garage Email (e.g. quickfit@gmail.com)" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "3px solid #000", marginBottom: "15px", color: "#000", fontWeight: "700" }} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "3px solid #000", marginBottom: "20px", color: "#000", fontWeight: "700" }} />
        
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "#000", color: "#fff", padding: "14px", borderRadius: "10px", border: "none", fontWeight: "900", cursor: "pointer" }}>
          {loading ? "Logging in..." : "Login →"}
        </button>

        <div style={{ marginTop: "20px", background: "#facc15", padding: "12px", borderRadius: "10px", border: "2px solid #000" }}>
          <p style={{ color: "#000", fontSize: "12px", fontWeight: "900", margin: 0 }}>DEMO LOGINS:</p>
          <p style={{ color: "#000", fontSize: "11px", margin: "5px 0 0" }}>quickfit@test.com / 123456</p>
          <p style={{ color: "#000", fontSize: "11px", margin: "2px 0 0" }}>kwikfit@test.com / 123456</p>
        </div>
      </div>
    </div>
  );
}
