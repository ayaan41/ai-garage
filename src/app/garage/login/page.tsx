"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function GarageLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/garage");
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="bg-gold-lines"></div>
      <div className="glass-card">
        <h1 className="title">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
        <p className="subtitle">{isSignUp ? "Create your garage account to get started" : "Sign in to your account to continue"}</p>
        
        <div className="form">
          {isSignUp && <input placeholder="Full Name" className="glass-input" />}
          <input placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="glass-input" />
          {isSignUp ? (
            <div className="row">
              <input type="password" placeholder="Password" className="glass-input" />
              <input type="password" placeholder="Confirm Password" className="glass-input" />
            </div>
          ) : (
            <>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="glass-input" />
              <div className="flex-between">
                <label className="check"><input type="checkbox"/> Remember me</label>
                <a className="link">Forgot password?</a>
              </div>
            </>
          )}

          <button onClick={handleLogin} className="gold-btn">
            {loading ? "Loading..." : isSignUp ? "Create Account →" : "Sign In →"}
          </button>

          <div className="divider"><span>Or continue with</span></div>

          <div className="row">
            <button className="social-btn">G Google</button>
            <button className="social-btn"> Apple</button>
          </div>

          <p className="bottom-text">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span onClick={()=>setIsSignUp(!isSignUp)} className="link-yellow">
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .login-wrapper {
          min-height: 100vh;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }
        .bg-gold-lines {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at top, rgba(250,204,21,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at bottom, rgba(250,204,21,0.1) 0%, transparent 60%),
            linear-gradient(120deg, #000 0%, #111 50%, #000 100%);
        }
        .bg-gold-lines::before {
          content: "";
          position: absolute;
          inset: -50%;
          background: 
            repeating-linear-gradient(100deg, transparent 0px, transparent 80px, rgba(250,204,21,0.03) 80px, rgba(250,204,21,0.08) 82px),
            repeating-linear-gradient(-20deg, transparent 0px, transparent 120px, rgba(250,204,21,0.05) 120px, rgba(250,204,21,0.1) 122px);
          animation: flow 20s linear infinite;
        }
        @keyframes flow {
          from { transform: translateX(-10%) rotate(0deg); }
          to { transform: translateX(10%) rotate(1deg); }
        }
        .glass-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 32px;
          position: relative;
          z-index: 1;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: slideUp 0.6s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .title {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .subtitle {
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          margin: 8px 0 24px;
        }
        .form { display: flex; flex-direction: column; gap: 12px; }
        .glass-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
        }
        .glass-input::placeholder { color: rgba(255,255,255,0.4); }
        .glass-input:focus {
          border-color: rgba(250,204,21,0.5);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px rgba(250,204,21,0.1);
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255,255,255,0.6); }
        .check { display: flex; align-items: center; gap: 6px; cursor: pointer; }
        .link { color: rgba(255,255,255,0.6); cursor: pointer; }
        .link:hover { color: #facc15; }
        .gold-btn {
          width: 100%;
          padding: 14px;
          background: #facc15;
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(250,204,21,0.3);
        }
        .gold-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(250,204,21,0.4);
          background: #fde047;
        }
        .gold-btn:active { transform: translateY(0); }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0;
          color: rgba(255,255,255,0.3);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .social-btn {
          padding: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .social-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .bottom-text {
          text-align: center;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          margin: 8px 0 0;
        }
        .link-yellow {
          color: #facc15;
          font-weight: 700;
          cursor: pointer;
        }
        .link-yellow:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
