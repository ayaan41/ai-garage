"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GarageLoginPremium() {
  const router = useRouter();
  const [email, setEmail] = useState("haji@autocenter.co.uk");
  const [garageId, setGarageId] = useState("HAC-G20-001");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem("ag_garage", JSON.stringify({ email, garageId, name: "Haji Auto Center", area: "Glasgow G20 • 127 jobs • 4.9★" }));
      await new Promise(r=>setTimeout(r, 800));
      router.push("/garage");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-black antialiased flex flex-col">
      <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-200">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center text-white font-black text-[11px]">AG</div><span className="font-bold text-[14px]">AI GARAGE • GARAGE LOGIN</span><span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full bg-black text-white font-bold">GARAGE OS • BOOKINGS • WORKSHOP • READY • COLLECTED • £710</span></div>
          <div className="flex gap-2"><a href="/" className="h-8 px-4 rounded-full bg-zinc-100 border text-[12px] font-semibold">Home</a><a href="/garage" className="h-8 px-4 rounded-full bg-white border-2 border-zinc-200 text-[12px] font-semibold">Garage OS Demo →</a></div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-8 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="hidden lg:block space-y-6">
          <div className="bg-black text-white rounded-[24px] p-8">
            <h1 className="text-[34px] font-black tracking-tight leading-[0.95]">Garage OS.<br/>Bookings to<br/>Collected.<br/>One screen.</h1>
            <p className="text-[13px] text-white/70 mt-5 leading-relaxed">Garage dashboard shows New today, Pending, Workshop black, Ready, Collected £710. Tabs All Active/New/Pending/Approved/Workshop/Ready/Collected. Booking cards Yellow plate only yellow + Service Needed + Parts Supplier Who Orders Cost + One click Approve/Start Work/Mark Ready/Collect & Paid Auto WhatsApp + Invoice /invoice/id. Full screen classy white + black + only plates yellow.</p>
            <div className="mt-8 grid grid-cols-4 gap-3 text-[11px]">
              <div className="bg-white/10 border border-white/15 rounded-[12px] p-3"><p className="font-bold">New today</p><p className="text-[18px] font-black mt-1">6</p></div>
              <div className="bg-white/10 border border-white/15 rounded-[12px] p-3"><p className="font-bold">Workshop</p><p className="text-[18px] font-black mt-1">3</p></div>
              <div className="bg-[#FFCC00] text-black border-2 border-black rounded-[12px] p-3 shadow-[1px_1px_0px_0px_#000]"><p className="font-black">Ready</p><p className="text-[18px] font-black mt-1">2</p></div>
              <div className="bg-white text-black rounded-[12px] p-3"><p className="font-bold">Collected</p><p className="text-[18px] font-black mt-1">£710</p></div>
            </div>
          </div>
          <div className="bg-white rounded-[18px] border border-zinc-200 p-5 flex gap-4 items-center"><div className="w-[92px] h-[44px] bg-[#FFCC00] border-[1.5px] border-black rounded-[6px] flex items-center justify-center font-black text-[12px] shadow-[1px_1px_0px_0px_#000]">YK66 OPR</div><div><p className="font-bold text-[13px]">AG-842901 • BMW 1 Series • Brake noise grinding</p><p className="text-[11px] text-zinc-500">G20 6 • Today 2 PM • Workshop • £49 • Parts ATE £42 Euro Car Parts Tomorrow 10 AM • Pay direct Page 12 LOCKED</p></div></div>
        </div>

        <div className="bg-white rounded-[24px] border-2 border-black p-8 shadow-[3px_3px_0px_0px_#000] max-w-[440px] w-full mx-auto lg:mx-0">
          <h2 className="text-[22px] font-black tracking-tight">Garage Login • OS Dashboard</h2>
          <p className="text-[12px] text-zinc-500 mt-2">Haji Auto Center • Glasgow G20 • 127 jobs • 4.9★ • Verified • No upfront • Pay after approval • Price control garage • Page 12 LOCKED</p>
          
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div><label className="text-[11px] font-bold uppercase text-zinc-500">Garage Email • For quotes & bookings</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 w-full h-12 bg-zinc-50 border-2 border-zinc-200 rounded-full px-5 text-[13px] font-semibold focus:border-black outline-none" /></div>
            <div><label className="text-[11px] font-bold uppercase text-zinc-500">Garage ID • HAC-G20-001 • Verified</label><input value={garageId} onChange={e=>setGarageId(e.target.value)} className="mt-2 w-full h-12 bg-zinc-50 border-2 border-zinc-200 rounded-full px-5 text-[13px] font-semibold focus:border-black outline-none" /></div>
            <div><label className="text-[11px] font-bold uppercase text-zinc-500">Password • Secure • Price control garage</label><input type="password" defaultValue="password123" className="mt-2 w-full h-12 bg-zinc-50 border-2 border-zinc-200 rounded-full px-5 text-[13px] font-semibold focus:border-black outline-none" /></div>
            
            <button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-black text-white text-[13px] font-bold hover:bg-zinc-900 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? "Logging in..." : "Login → Garage OS • Full Screen Premium"}
            </button>
            
            <div className="flex items-center gap-3 py-2"><div className="flex-1 h-[1px] bg-zinc-200"></div><span className="text-[11px] text-zinc-500">Garage features</span><div className="flex-1 h-[1px] bg-zinc-200"></div></div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-zinc-50 border border-zinc-200 rounded-[12px] p-3"><p className="font-bold">One click workflow</p><p className="text-zinc-600 mt-1">Approve → Start Work → Mark Ready → Collect & Paid → Auto WhatsApp + Invoice</p></div>
              <div className="bg-[#FFCC00] border-2 border-black rounded-[12px] p-3 shadow-[1px_1px_0px_0px_#000]"><p className="font-black">Pay direct • Page 12</p><p className="font-bold mt-1">Repair balance direct to garage • Only booking amount via platform if deposit</p></div>
            </div>
          </form>

          <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-[14px] p-4 text-[11px] leading-relaxed">
            <p className="font-bold">Garage OS • Full Screen Classy • What you get</p>
            <p className="text-zinc-600 mt-2">Top stats New today/Pending/Workshop black/Ready/Collected £710 • Tabs All Active/New/Pending/Approved/Workshop/Ready/Collected • Booking cards Yellow plate only yellow + Service Needed + Parts Supplier Who Orders Cost + Who Orders garage • One click Approve & Send Quote/Start Work/Mark Ready/Collect & Paid Auto WhatsApp + Invoice /invoice/id • Full screen px-10 edge to edge • White + black + only plates yellow • No eye pain • Price control garage • Quote itemised or pre-set service price • No hidden charges • Customer approval required.</p>
          </div>

          <div className="mt-5 flex gap-2 text-[11px]"><a href="/garage" className="flex-1 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center">Skip → Garage OS Demo</a><a href="/" className="flex-1 h-10 rounded-full bg-white border-2 border-zinc-200 font-semibold flex items-center justify-center">Home • Intake</a></div>
        </div>
      </div>
    </div>
  );
}
