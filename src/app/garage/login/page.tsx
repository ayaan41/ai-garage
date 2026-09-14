"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function GarageLoginOriginal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const c = canvasRef.current; if(!c) return; const ctx=c.getContext('2d'); if(!ctx) return;
    c.width=800; c.height=600;
    let t=0;
    const anim=()=>{
      t+=0.01;
      ctx.clearRect(0,0,c.width,c.height);
      ctx.strokeStyle='rgba(250,204,21,0.2)'; ctx.lineWidth=1.2;
      for(let k=0;k<2;k++){
        ctx.beginPath();
        for(let x=0;x<c.width;x+=5){
          const y=150+Math.sin(x*0.01+t+k)*60 + k*80;
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      requestAnimationFrame(anim);
    }; anim();
  },[]);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) alert(error.message); else router.push("/garage");
    setLoading(false);
  };

  return (
    <div className="wrap">
      <canvas ref={canvasRef} className="can" />
      <div className="card">
        <div className="top">
          <div className="dot" />
          <h1>Garage Portal</h1>
          <p>UK's trusted garages login here. Your own dashboard.</p>
        </div>

        <label>Email Address</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="yourgarage@example.com" />

        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />

        <button onClick={login} className="btn">{loading?"Signing in...":"Sign in →"}</button>

        <div className="foot">
          <span>Don't have login? Contact Super Admin</span>
          <a href="/">← Back to booking site</a>
        </div>
      </div>

      <style jsx global>{`
        .wrap { min-height: 100vh; background: #080808; display: grid; place-items: center; position: relative; padding: 20px; overflow: hidden; font-family: Inter, sans-serif; }
        .can { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.6; }
        .card { width: 100%; max-width: 420px; background: linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.12); border-radius: 28px; padding: 32px; position: relative; z-index: 1; box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15); }
        .top { margin-bottom: 28px; }
        .dot { width: 12px; height: 12px; background: #facc15; border-radius: 50%; box-shadow: 0 0 20px #facc15; margin-bottom: 16px; }
        .top h1 { font-family: Syne, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 0; color: #fff; }
        .top p { color: rgba(255,255,255,0.55); font-size: 13px; margin: 8px 0 0; line-height: 1.4; }
        label { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 16px 0 8px; display: block; }
        input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 14px 16px; color: #fff; outline: none; font-size: 14px; }
        input:focus { border-color: #facc15; box-shadow: 0 0 0 4px rgba(250,204,21,0.12); }
        .btn { width: 100%; background: #fff; color: #000; border: none; padding: 16px; border-radius: 14px; font-weight: 900; font-size: 14px; margin-top: 20px; cursor: pointer; transition: all 0.2s; }
        .btn:hover { background: #facc15; transform: translateY(-1px); }
        .foot { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; text-align: center; }
        .foot span { font-size: 11px; color: rgba(255,255,255,0.4); }
        .foot a { font-size: 11px; color: rgba(255,255,255,0.6); text-decoration: none; }
        .foot a:hover { color: #facc15; }
      `}</style>
    </div>
  );
}
