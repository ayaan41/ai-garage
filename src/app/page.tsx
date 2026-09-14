"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [reg, setReg] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [service, setService] = useState("MOT");
  const [garage, setGarage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const checkMOT = () => {
    if(!reg) return alert("Enter registration");
    setAiResult(`Analyzing ${reg.toUpperCase()}...`);
    setTimeout(()=> setAiResult(`✅ ${reg.toUpperCase()} - MOT Valid till Dec 2026 | ${make || "BMW"} ${model || "3 Series"} | Last service: 3 months ago | AI Suggestion: Full Service + Brake Check recommended`), 1500);
  };

  const bookNow = async () => {
    if(!reg || !name || !phone) return alert("Fill all fields");
    setLoading(true);
    const { error } = await supabase.from("bookings").insert([{ 
      reg_number: reg.toUpperCase(), make, model, service_type: service, 
      garage_name: garage || "QuickFit Cumbernauld", customer_name: name, 
      customer_phone: phone, status: "pending", price: service==="MOT"?"£54.99":"£149"
    }]);
    setLoading(false);
    if(error) alert(error.message);
    else { alert("Booking Confirmed! Garage will contact you soon."); setReg(""); setName(""); setPhone(""); }
  };

  return (
    <div className="main">
      <div className="bg">
        <div className="gold-flow"></div>
      </div>

      {/* NAV */}
      <nav className="nav">
        <div className="logo">AI GARAGE<span>• CUMBERNAULD</span></div>
        <div className="nav-links"><a>Services</a><a>Garages</a><a href="/garage/login" className="nav-btn">Garage Login</a></div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1 className="hero-h1">Next Gen <span>Garage</span><br/>Booking Platform</h1>
        <p className="hero-p">AI-powered MOT check, instant booking, trusted garages in Glasgow & Cumbernauld</p>
        
        <div className="glass-hero">
          <div className="hero-grid">
            <div>
              <label>Vehicle Registration</label>
              <div className="input-gold"><input value={reg} onChange={e=>setReg(e.target.value)} placeholder="e.g. SK19 ABU" /><button onClick={checkMOT} className="mini-gold">AI CHECK →</button></div>
              {aiResult && <div className="ai-box">{aiResult}</div>}
              <div className="two">
                <div><label>Make</label><input value={make} onChange={e=>setMake(e.target.value)} placeholder="BMW" /></div>
                <div><label>Model</label><input value={model} onChange={e=>setModel(e.target.value)} placeholder="3 Series" /></div>
              </div>
            </div>
            <div>
              <label>Service</label>
              <select value={service} onChange={e=>setService(e.target.value)}><option>MOT - £54.99</option><option>Full Service - £149</option><option>Brakes - £89</option><option>Tyres</option></select>
              <label>Garage</label>
              <select value={garage} onChange={e=>setGarage(e.target.value)}><option>QuickFit Cumbernauld</option><option>KwikFit Glasgow</option><option>haji auto center</option></select>
              <label>Your Details</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" />
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone Number" style={{marginTop:8}}/>
              <button onClick={bookNow} className="big-gold">{loading?"Booking...":"Book Instantly →"}</button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        {[
          {t:"AI MOT Check", d:"Instant DVLA data + AI health analysis"},
          {t:"Trusted Garages", d:"Verified garages in G67, G20, G40"},
          {t:"Instant Booking", d:"Book in 30 seconds, garage confirms"},
        ].map((s,i)=>(
          <div key={i} className="s-card"><h3>{s.t}</h3><p>{s.d}</p></div>
        ))}
      </section>

      <style jsx global>{`
        .main { min-height: 100vh; background: #050505; color: #fff; position: relative; overflow-x: hidden; font-family: Inter, sans-serif; }
        .bg { position: fixed; inset: 0; z-index: 0; }
        .gold-flow { position: absolute; inset: -50%; background: radial-gradient(ellipse at 20% 20%, rgba(250,204,21,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(250,204,21,0.12) 0%, transparent 50%), linear-gradient(180deg, #050505 0%, #0a0a0a 100%); }
        .gold-flow::before { content:""; position: absolute; inset: 0; background: repeating-linear-gradient(100deg, transparent 0 100px, rgba(250,204,21,0.04) 100px 102px), repeating-linear-gradient(-15deg, transparent 0 150px, rgba(250,204,21,0.06) 150px 152px); animation: flow 25s linear infinite; }
        @keyframes flow { from{transform: translateX(-5%)} to{transform: translateX(5%)} }
        .nav { position: relative; z-index: 2; display: flex; justify-content: space-between; padding: 20px 40px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px); }
        .logo { font-weight: 900; letter-spacing: 1px; font-size: 18px; } .logo span{ font-weight: 400; font-size: 10px; color: #facc15; margin-left: 8px; letter-spacing: 2px; }
        .nav-links { display: flex; gap: 24px; align-items: center; font-size: 13px; color: rgba(255,255,255,0.7); }
        .nav-btn { background: #facc15; color: #000; padding: 8px 16px; border-radius: 20px; font-weight: 800; text-decoration: none; }
        .hero { position: relative; z-index: 2; padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
        .hero-h1 { font-size: clamp(36px, 6vw, 64px); font-weight: 900; line-height: 0.95; letter-spacing: -2px; margin: 0; } .hero-h1 span{ color: #facc15; }
        .hero-p { color: rgba(255,255,255,0.6); margin: 16px 0 40px; font-size: 16px; max-width: 500px; }
        .glass-hero { background: rgba(255,255,255,0.05); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; padding: 28px; box-shadow: 0 20px 80px rgba(0,0,0,0.6); }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 700; margin: 12px 0 6px; display: block; }
        input, select { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #fff; outline: none; font-size: 14px; }
        input:focus, select:focus { border-color: #facc15; }
        .input-gold { display: flex; gap: 8px; align-items: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 4px; }
        .input-gold input { border: none; background: transparent; flex: 1; }
        .mini-gold { background: #facc15; color: #000; border: none; padding: 10px 14px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer; white-space: nowrap; }
        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
        .big-gold { width: 100%; margin-top: 16px; background: #facc15; color: #000; border: none; padding: 16px; border-radius: 12px; font-weight: 900; font-size: 15px; cursor: pointer; box-shadow: 0 10px 30px rgba(250,204,21,0.3); }
        .big-gold:hover { transform: translateY(-1px); box-shadow: 0 15px 40px rgba(250,204,21,0.4); }
        .ai-box { margin-top: 12px; background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.3); border-radius: 10px; padding: 12px; font-size: 12px; color: #fde68a; line-height: 1.4; animation: pop 0.4s ease; }
        @keyframes pop { from{opacity:0; transform: translateY(5px)} to{opacity:1; transform: translateY(0)} }
        .services { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; padding: 20px 40px 60px; max-width: 1200px; margin: 0 auto; }
        .s-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px); }
        .s-card h3 { margin: 0 0 6px; font-size: 14px; font-weight: 800; } .s-card p { margin: 0; font-size: 12px; color: rgba(255,255,255,0.5); }
        @media(max-width: 800px){ .hero-grid, .services { grid-template-columns: 1fr; } .nav{ padding: 16px 20px; } .hero{ padding: 30px 20px; } }
      `}</style>
    </div>
  );
}
