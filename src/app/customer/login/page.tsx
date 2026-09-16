"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      // Tumhara profiles wala system ke liye bhi localStorage save
      localStorage.setItem("customer_email", email);
      localStorage.setItem("user_role", "customer");
      router.push("/customer");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0a]">
      {/* Left - Branding */}
      <div className="hidden lg:flex w-[55%] bg-[#111] relative overflow-hidden flex-col justify-between p-12">
        <div>
          <h1 className="text-white text- font-black tracking-tighter">HAJI AUTO CENTER</h1>
          <p className="text-white/40 text- tracking-[0.2em] mt-1">UK • 10K STANDARD • GLASGOW</p>
        </div>
        <div>
          <h2 className="text-white text- font-black leading-[0.9] tracking-tighter">
            Your car,<br />your<br /><span className="text-[#ffcc00]">history.</span>
          </h2>
          <p className="text-white/50 text- mt-6 max-w- leading-relaxed">Track every service, mileage & invoice — UK standard 10k miles service history.</p>
        </div>
        <div className="flex gap-2">
          <div className="h-1 w-8 bg-[#ffcc00] rounded-full"></div>
          <div className="h-1 w-2 bg-white/20 rounded-full"></div>
          <div className="h-1 w-2 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* Right - Login */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f6f6f7]">
        <div className="w-full max-w-">
          <div className="lg:hidden mb-8">
            <h1 className="text-black text- font-black tracking-tighter">HAJI AUTO CENTER</h1>
          </div>

          <div className="bg-white rounded- p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-black/[0.06]">
            <h1 className="text- font-black text-black tracking-[-0.02em] leading-none">Welcome back</h1>
            <p className="text- text-[#6e6e73] mt-3 font-medium">Apni cars ki history dekho</p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="text- font-black tracking-widest text-black/60 mb-2 block uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text- font-black tracking-widest text-black/60 uppercase">Password</label>
                  <a href="#" className="text- font-bold text-[#0a84ff]">Forgot?</a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h- bg-black text-white font-bold rounded- hover:bg-[#222] transition-all text- tracking-wide"
              >
                {loading? "Signing in..." : "Login →"}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-">
              <span className="text-[#6e6e73]">New here?</span>
              <a href="/customer/register" className="font-black text-black underline decoration-2 underline-offset-4">Register new account</a>
            </div>
          </div>

          <p className="text-center text- text-black/30 mt-6 tracking-wide font-medium">Secure • Encrypted • UK GDPR Compliant</p>
        </div>
      </div>
    </div>
  );
}