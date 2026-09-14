"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function SuperAdminOriginal() {
  const [garages, setGarages] = useState<any[]>([]);
  const [email, setEmail] = useState("admin@ai-garage.com");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  useEffect(()=>{ check(); }, []);
  const check = async () => {
    const { data } = await supabase.auth.getSession();
    if(data.session?.user?.email==="admin@ai-garage.com"){ setIsLogged(true); load(); }
  };
  const load = async () => {
    const { data } = await supabase.from("garages").select("*").order("created_at", {ascending:false});
    if(data) setGarages(data);
  };
  const add = async () => {
    if(!form.name || !form.email) return alert("Name & Email required");
    const pass = "Garage@" + Math.floor(Math.random()*9000+1000);
    const { error } = await supabase.auth.signUp({ email: form.email, password: pass, options:{data:{role:"garage"}}});
    if(error) return alert(error.message);
    await supabase.from("garages").insert([{ name: form.name, email: form.email, phone: form.phone, address: form.address, temp_password: pass }]);
    alert(`Added: ${form.email} / ${pass}`); setForm({name:"",email:"",phone:"",address:""}); load();
  };

  if(!isLogged){
    return (
      <div className="wrap">
        <div className="card">
          <div className="dot" />
          <h1>Super Admin</h1><p>Control your UK garage network</p>
          <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={async()=>{const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) alert(error.message); else {setIsLogged(true); load();}}} className="btn">Login →</button>
        </div>
        <style jsx global>{`
          .wrap { min-height: 100vh; background: #080808; display: grid; place-items: center; padding: 20px; font-family: Inter, sans-serif; }
          .card { width: 100%; max-width: 420px; background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04)); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.12); border-radius: 28px; padding: 32px; }
          .dot { width: 12px; height: 12px; background: #facc15; border-radius: 50%; box-shadow: 0 0 20px #facc15; margin-bottom: 16px; }
          h1 { font-family: Syne, sans-serif; font-size: 28px; color: #fff; margin: 0; } p{ color: rgba(255,255,255,0.5); font-size: 13px; }
          label{ font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 14px 0 6px; display: block; }
          input{ width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 14px; color: #fff; outline: none; }
          .btn{ width: 100%; background: #facc15; color: #000; border: none; padding: 14px; border-radius: 12px; font-weight: 900; margin-top: 16px; cursor: pointer; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dash">
      <header><h1>AI GARAGE • Admin</h1><button onClick={async()=>{await supabase.auth.signOut(); setIsLogged(false);}}>Logout</button></header>
      <div className="box">
        <h3>Add New Garage (UK)</h3>
        <div className="grid">
          <input placeholder="Garage Name - e.g. QuickFit Cumbernauld" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input placeholder="Email (will be login)" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          <input placeholder="Phone - 01236..." value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          <input placeholder="Address - Cumbernauld G67" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
        </div>
        <button onClick={add} className="gold">Add Garage & Create Login →</button>
      </div>
      <div className="box">
        <h3>Total Garages: {garages.length} • UK Network</h3>
        {garages.map(g=>(
          <div key={g.id} className="row"><div><b>{g.name}</b><span>{g.email} | {g.phone} | {g.address} | Temp: {g.temp_password}</span></div><button onClick={async()=>{if(confirm("Delete?")){await supabase.from("garages").delete().eq("id",g.id); load();}}} className="del">Delete</button></div>
        ))}
      </div>
      <style jsx global>{`
        .dash { min-height: 100vh; background: #080808; padding: 24px; font-family: Inter, sans-serif; }
        header { display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto 20px; }
        header h1 { color: #fff; font-family: Syne, sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
        header button { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 8px 14px; border-radius: 10px; cursor: pointer; }
        .box { max-width: 1100px; margin: 0 auto 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 20px; }
        .box h3 { color: #fff; font-family: Syne, sans-serif; margin: 0 0 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        input { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 12px; color: #fff; }
        .gold { margin-top: 12px; background: #facc15; color: #000; border: none; padding: 12px 18px; border-radius: 10px; font-weight: 900; cursor: pointer; }
        .row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; margin-top: 8px; }
        .row b { color: #fff; display: block; font-size: 13px; } .row span { color: rgba(255,255,255,0.5); font-size: 11px; }
        .del { background: #ef4444; color: #fff; border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer; }
      `}</style>
    </div>
  );
}
