"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPremium() {
  const router = useRouter();
  const [email, setEmail] = useState("mubeen@example.com");
  const [phone, setPhone] = useState("0909090900");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock login for demo - in production use supabase.auth.signIn
      localStorage.setItem("ag_customer", JSON.stringify({ email, phone, name: "Mubeen Ahmad", area: "G20 6 Glasgow" }));
      await new Promise(r=>setTimeout(r, 800));
      router.push("/my-cars");
    } finally { setLoading(false); }
  };

  const handleGuest = () => {
    localStorage.setItem("ag_customer", JSON.stringify({ email: "guest", name: "Guest", area: "G20 6" }));
    router.push("/search");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-black antialiased flex flex-col">
      <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-200">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center text-white font-black text-[11px]">AG</div><a href="/" className="font-bold text-[14px]">AI GARAGE • LOGIN</a><span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full bg-black text-white font-bold">CUSTOMER LOGIN • MY CARS • BOOKING HISTORY • REMINDERS</span></div>
          <a href="/" className="h-8 px-4 rounded-full bg-zinc-100 border text-[12px] font-semibold">Home →</a>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-8 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="hidden lg:block">
          <div className="bg-white rounded-[24px] border border-zinc-200 p-8 shadow-sm">
            <div className="flex items-center gap-3"><div className="w-[92px] h-[44px] bg-[#FFCC00] border-[1.5px] border-black rounded-[6px] flex items-center justify-center font-black text-[12px] shadow-[1px_1px_0px_0px_#000]">YK66 OPR</div><span className="text-[13px] font-semibold">BMW 1 Series • Mubeen Ahmad • Glasgow G20</span></div>
            <h1 className="text-[36px] font-black tracking-tight leading-[0.95] mt-8">Your garage,<br/>in your pocket.<br/>MOT due? We<br/>remind you.</h1>
            <p className="text-[13px] text-zinc-600 mt-5 leading-relaxed">Login to see My Cars • MOT Due 12 Dec 2026 • 84 days left • Service Due Mar 2027 • Booking history 6 bookings • Vehicle timeline • Workshop visibility PDF Page 10 • Reminders PDF Page 11 • Pay direct to garage Page 12 LOCKED • No hidden sponsored • Customer choice • Capability graph not generic list.</p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-[11px]">
              <div className="bg-zinc-50 border border-zinc-200 rounded-[14px] p-3.5"><p className="font-bold">My Cars • 2 vehicles</p><p className="text-zinc-600 mt-1">YK66 OPR BMW • AB12 CDE Audi • MOT Service reminders</p></div>
              <div className="bg-black text-white rounded-[14px] p-3.5"><p className="font-bold">Track • Live</p><p className="text-white/70 mt-1">Workshop visibility • No GPS surveillance • Workflow only</p></div>
              <div className="bg-[#FFCC00] border-2 border-black rounded-[14px] p-3.5 shadow-[1px_1px_0px_0px_#000]"><p className="font-black">Pay direct • Page 12</p><p className="font-bold mt-1">Repair balance direct to garage • No upfront hidden</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border-2 border-black p-8 shadow-[3px_3px_0px_0px_#000] max-w-[440px] w-full mx-auto lg:mx-0">
          <h2 className="text-[22px] font-black tracking-tight">Login • My Cars Dashboard</h2>
          <p className="text-[12px] text-zinc-500 mt-2">Mubeen Ahmad • Glasgow G20 6 • 2 vehicles • MOT reminders • Booking history • Vehicle timeline • PDF Page 11 • Pay direct to garage</p>
          
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div><label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Email • For invoices & reminders</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 w-full h-12 bg-zinc-50 border-2 border-zinc-200 rounded-full px-5 text-[13px] font-semibold focus:border-black focus:outline-none" placeholder="mubeen@example.com" /></div>
            <div><label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Phone • For WhatsApp Ready alerts</label><input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" className="mt-2 w-full h-12 bg-zinc-50 border-2 border-zinc-200 rounded-full px-5 text-[13px] font-semibold focus:border-black focus:outline-none" placeholder="0909090900" /></div>
            
            <button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-black text-white text-[13px] font-bold hover:bg-zinc-900 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? "Logging in..." : "Login → My Cars Dashboard • Full Screen Premium"}
            </button>
            
            <div className="flex items-center gap-3 py-2"><div className="flex-1 h-[1px] bg-zinc-200"></div><span className="text-[11px] text-zinc-500">OR</span><div className="flex-1 h-[1px] bg-zinc-200"></div></div>

            <button type="button" onClick={handleGuest} className="w-full h-12 rounded-full bg-white border-2 border-zinc-200 text-[13px] font-bold hover:border-black">Continue as Guest → Search garages • Capability graph</button>
            <button type="button" className="w-full h-12 rounded-full bg-zinc-50 border border-zinc-200 text-[12px] font-semibold flex items-center justify-center gap-2"><span className="w-5 h-5 bg-white border rounded-full flex items-center justify-center text-[12px]">G</span> Continue with Google</button>
            <button type="button" className="w-full h-12 rounded-full bg-zinc-50 border border-zinc-200 text-[12px] font-semibold">Continue with Phone OTP • 0909090900 → WhatsApp Ready alerts</button>
          </form>

          <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-[14px] p-4 text-[11px] leading-relaxed">
            <p className="font-bold">Why login? • PDF Page 11 • Reminders • Pay direct • Page 12 LOCKED</p>
            <p className="text-zinc-600 mt-2">My Cars shows your vehicles, MOT due 12 Dec 2026 84 days left, Service due Mar 2027, Booking history 6 bookings, Vehicle timeline PDF Page 10 No GPS surveillance, Auto WhatsApp on Ready, Reminders automatic, Pay direct to garage no upfront hidden, Booking amount only if deposit required, Customer choice no hidden sponsored, Capability graph not generic list.</p>
          </div>

          <div className="mt-5 flex gap-2 text-[11px]"><a href="/search" className="flex-1 h-10 rounded-full bg-[#FFCC00] border-2 border-black font-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">Skip → Search • 6 relevant</a><a href="/my-cars" className="flex-1 h-10 rounded-full bg-white border-2 border-zinc-200 font-semibold flex items-center justify-center">My Cars Demo • YK66 OPR</a></div>
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 pb-8 text-center text-[11px] text-zinc-400">AI Garage • Login • Full Screen Premium • Classy White + Black + Only plates yellow • My Cars • MOT Due • Service Due • Booking History • Vehicle Timeline • No eye pain • PDF Page 11 LOCKED • Pay direct Page 12 LOCKED • OS Complete</div>
    </div>
  );
}
