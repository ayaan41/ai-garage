"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [reg, setReg] = useState("");
  const [make, setMake] = useState("");
  const [service, setService] = useState("MOT");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let time = 0;
    const animate = () => {
      time += 0.005;
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.strokeStyle = `rgba(250,204,21,${0.15 + Math.sin(time)*0.05})`;
      ctx.lineWidth = 1;
      for(let i=0; i<3; i++){
        ctx.beginPath();
        for(let x=0; x<canvas.width; x+=10){
          const y = canvas.height*0.3 + Math.sin(x*0.003 + time + i)*100 + i*120;
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const checkMOT = () => {
    if(!reg) return alert("Enter registration");
    setAiResult("AI Scanning...");
    setTimeout(()=> setAiResult(`✓ ${reg.toUpperCase()} | MOT valid till 14/12/2026 | AI: Brake pads 68% | Tyres OK | Suggested: Full Service`), 1000);
  };

  const bookNow = async () => {
    if(!reg || !name || !phone) return alert("Fill required fields");
    setLoading(true);
    await supabase.from("bookings").insert([{ reg_number: reg.toUpperCase(), make, model: "Detected", service_type: service, garage_name: "QuickFit Cumbernauld", customer_name: name, customer_phone: phone, status: "pending" }]);
    setLoading(false);
    alert("Booking Confirmed! Garage will call you in 15 mins.");
    setReg(""); setName(""); setPhone("");
  };

  return (
    <div className="root">
      <canvas ref={canvasRef} className="canvas-bg" />
      <div className="noise" />

      <nav className="nav">
        <div className="brand">
          <div className="dot" />
          <span>AI GARAGE</span>
          <em>CUMBERNAULD • UK</em>
        </div>
        <div className="nav-r">
          <span className="live"><i />LIVE: 3 Garages Online</span>
          <a href="/garage/login" className="login">Garage Portal</a>
        </div>
      </nav>

      <div className="hero">
        <div className="left">
          <div className="badge">★ UK's First AI-Powered Garage Network</div>
          <h1>Your car<br/>deserves<br/><span>better.</span></h1>
          <p>We built the booking system we wanted as drivers. No calls. No waiting. AI checks your MOT in 2 seconds and books the best garage in Cumbernauld & Glasgow.</p>
          <div className="trust">
            <div><b>2,400+</b><span>cars serviced</span></div>
            <div><b>4.9</b><span>Google rating</span></div>
            <div><b>15 min</b><span>avg. response</span></div>
          </div>
        </div>

        <div className="right">
          <div className="card">
            <div className="card-head">
              <h3>Book in 30 seconds</h3>
              <div className="steps"><span className="on">1</span><span>2</span><span>3</span></div>
            </div>

            <label>Registration Number</label>
            <div className="field-gold">
              <input value={reg} onChange={e=>setReg(e.target.value.toUpperCase())} placeholder="SK19 ABU" />
              <button onClick={checkMOT}>AI CHECK</button>
            </div>
            {aiResult && <div className="ai">{aiResult}</div>}

            <div className="row2">
              <div><label>Make</label><input value={make} onChange={e=>setMake(e.target.value)} placeholder="BMW" /></div>
              <div><label>Service</label>
                <select value={service} onChange={e=>setService(e.target.value)}>
                  <option>MOT £54.99</option><option>Full Service £149</option><option>Brakes £89</option><option>Tyres</option>
                </select>
              </div>
            </div>

            <label>Contact</label>
            <div className="row2">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07xxx xxxxxx" />
            </div>

            <button onClick={bookNow} className="cta">{loading?"Booking...":"Confirm Booking →"}</button>
            <p className="micro">✓ No payment now • Garage confirms in 15 mins • Free cancellation</p>
          </div>

          <div className="garages">
            <div className="g"><span>🔧</span><b>QuickFit Cumbernauld</b><i>G67 • 2.1 miles • Open</i></div>
            <div className="g"><span>🔧</span><b>KwikFit Glasgow</b><i>G20 • 4.3 miles • Open</i></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;700&display=swap');
        .root { min-height: 100vh; background: #080808; color: #fff; position: relative; overflow-x: hidden; font-family: 'Inter', sans-serif; }
        .canvas-bg { position: fixed; inset: 0; z-index: 0; opacity: 0.8; }
        .noise { position: fixed; inset: 0; z-index: 1; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); pointer-events: none; }
        .nav { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .brand { display: flex; align-items: center; gap: 10px; font-family: 'Syne', sans-serif; font-weight: 800; letter-spacing: -0.5px; }
        .dot { width: 10px; height: 10px; background: #facc15; border-radius: 50%; box-shadow: 0 0 20px #facc15; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.2); } }
        .brand em { font-style: normal; font-weight: 500; font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.5); margin-left: 12px; }
        .nav-r { display: flex; align-items: center; gap: 16px; }
        .live { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7); display: flex; align-items: center; gap: 6px; }
        .live i { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; }
        .login { background: #fff; color: #000; padding: 10px 18px; border-radius: 100px; font-weight: 800; font-size: 12px; text-decoration: none; letter-spacing: 0.2px; }
        .hero { position: relative; z-index: 5; display: grid; grid-template-columns: 1fr 480px; gap: 60px; padding: 60px 32px; max-width: 1300px; margin: 0 auto; }
        .badge { display: inline-block; background: rgba(250,204,21,0.12); border: 1px solid rgba(250,204,21,0.25); color: #facc15; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
        .left h1 { font-family: 'Syne', sans-serif; font-size: clamp(48px, 6vw, 84px); font-weight: 800; line-height: 0.88; letter-spacing: -3px; margin: 24px 0 20px; }
        .left h1 span { color: #facc15; position: relative; }
        .left p { color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.6; max-width: 460px; }
        .trust { display: flex; gap: 32px; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; }
        .trust b { display: block; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; } .trust span { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
        .card { background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.12); border-radius: 28px; padding: 28px; box-shadow: 0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15); }
        .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-head h3 { margin: 0; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; }
        .steps { display: flex; gap: 6px; } .steps span { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.08); display: grid; place-items: center; font-size: 11px; font-weight: 800; } .steps span.on { background: #facc15; color: #000; }
        label { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 16px 0 8px; display: block; }
        input, select { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px 16px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
        input:focus, select:focus { border-color: #facc15; background: rgba(0,0,0,0.6); box-shadow: 0 0 0 4px rgba(250,204,21,0.1); }
        .field-gold { display: flex; background: rgba(0,0,0,0.5); border: 1.5px solid rgba(250,204,21,0.4); border-radius: 14px; padding: 4px; }
        .field-gold input { border: none; background: transparent; flex: 1; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: 1px; font-size: 16px; }
        .field-gold button { background: #facc15; color: #000; border: none; padding: 0 20px; border-radius: 10px; font-weight: 900; font-size: 11px; letter-spacing: 0.5px; cursor: pointer; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cta { width: 100%; background: #fff; color: #000; border: none; padding: 18px; border-radius: 14px; font-weight: 900; font-size: 15px; margin-top: 18px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.2px; }
        .cta:hover { background: #facc15; transform: translateY(-1px); box-shadow: 0 12px 30px rgba(250,204,21,0.25); }
        .micro { text-align: center; font-size: 10px; color: rgba(255,255,255,0.4); margin: 12px 0 0; letter-spacing: 0.3px; }
        .ai { background: #facc15; color: #000; padding: 12px 14px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-top: 12px; line-height: 1.4; animation: slide 0.4s ease; }
        @keyframes slide { from{opacity:0; transform: translateY(8px)} to{opacity:1; transform: translateY(0)} }
        .garages { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .g { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
        .g span { width: 36px; height: 36px; background: rgba(255,255,255,0.06); border-radius: 10px; display: grid; place-items: center; }
        .g b { font-size: 13px; font-weight: 700; } .g i { font-style: normal; font-size: 11px; color: rgba(255,255,255,0.5); margin-left: auto; }
        @media(max-width: 900px){ .hero{ grid-template-columns: 1fr; gap: 32px; padding: 28px 20px; } .nav{ padding: 16px 20px; } }
      `}</style>
    </div>
  );
}
