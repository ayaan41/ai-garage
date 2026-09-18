"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const SERVICES = ["MOT", "Full Service", "Oil Change", "Brakes", "Clutch", "DPF", "Diagnostics", "Electrical", "Tyres", "Recovery", "Valeting", "BMW Specialist", "Mercedes Specialist", "EV/Hybrid"];

const GARAGES = [
  { id: "g1", name: "Haji Auto Center", area: "Glasgow G20", distance: "0.8 miles", jobs: 127, rating: 4.9, caps: ["Full Service", "MOT", "Brake Check", "Oil Change"], price: "From £49", spec: "All makes + BMW", badge: "Verified • 4.9★", avail: "Today 2 slots • 0.4 mi" },
  { id: "g2", name: "Glasgow Car Care", area: "Glasgow G21", distance: "1.2 miles", jobs: 89, rating: 4.7, caps: ["Service", "Tyres", "Battery"], price: "From £45", spec: "All makes", badge: "Verified • 4.7★", avail: "Tomorrow 3 slots" },
  { id: "g3", name: "Mobile Mechanic Pro", area: "Mobile", distance: "Mobile", jobs: 203, rating: 5.0, caps: ["Mobile Service", "Breakdown SOS", "Home Service"], price: "From £35", spec: "Mobile • 24/7 • Recovery", badge: "Verified • 5★", avail: "Now available • Mobile" },
  { id: "g4", name: "Elite BMW Specialist", area: "Glasgow G21", distance: "1.2 mi", jobs: 189, rating: 4.9, caps: ["BMW Specialist", "Electrical", "Diagnostics"], price: "From £65", spec: "BMW Specialist • EV/Hybrid", badge: "BMW Specialist", avail: "Today 1 slot • Urgent" },
  { id: "g5", name: "Quick Fit Tyres", area: "Glasgow G20", distance: "0.6 mi", jobs: 412, rating: 4.6, caps: ["Tyres", "Mobile", "24/7"], price: "From £35", spec: "Tyres • Mobile", badge: "24/7 Mobile", avail: "Now • Mobile" },
  { id: "g6", name: "Auto Electric Pro", area: "Glasgow G40", distance: "1.4 mi", jobs: 156, rating: 4.8, caps: ["Electrical", "Diagnostics", "DPF"], price: "From £55", spec: "Auto Electrical • EV", badge: "Verified • 4.8★", avail: "Today 3 slots" },
];

export default function HomeFullScreen() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("G20 6");
  const [reg, setReg] = useState("YK66 OPR");
  const [issue, setIssue] = useState("Brake noise - grinding at low speed, started 2 days ago. Worse when cold.");
  const [selected, setSelected] = useState<string[]>(["Oil Change", "Brakes", "BMW Specialist"]);
  const [urgency, setUrgency] = useState("Today");
  const [time, setTime] = useState("Afternoon");

  const handleBook = async (g: any) => {
    const id = `AG-${Math.floor(100000 + Math.random()*900000)}`;
    try { await supabase.from("bookings").insert({ id, reg, car: `BMW 1 Series • 2016`, year: `2016 • 1.5D • 52k mi • BLACK`, customer: "Mubeen Ahmad", area: `${postcode} • ${g.distance}`, phone: "0909090900", arrival: "Today 2:00 PM", pickup: time, work: [`${selected.join(", ")}`], detail: issue, price: g.price.replace("From £",""), tab: "New", garage_name: g.name, postcode, services_needed: selected, parts: "Brake pads ATE £42", supplier: "Euro Car Parts Tomorrow 10 AM", parts_cost: "42" }); } catch(e) {}
    router.push("/garage");
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-black antialiased">
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-30">
        <div className="w-full px-6 md:px-10 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-4"><div className="w-9 h-9 bg-black rounded-[10px] flex items-center justify-center text-white font-black text-[12px]">AG</div><span className="font-black text-[16px] tracking-tight">AI GARAGE</span><span className="hidden lg:block text-[11px] px-3.5 py-1.5 rounded-full bg-zinc-100 border font-medium">Trusted • Verified • No upfront • Pay after approval</span></div>
          <div className="flex items-center gap-4"><span className="hidden md:block text-[12px] text-zinc-500">Glasgow • G20 • Live tracking • Pay after approval • No hidden ranking</span><a href="/garage" className="h-10 px-5 rounded-full bg-black text-white text-[13px] font-bold flex items-center hover:bg-zinc-900">Garage OS →</a></div>
        </div>
      </header>

      {/* FULL SCREEN HERO - NO CARD, EDGE TO EDGE */}
      <div className="w-full px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-full bg-[#FFCC00] border-2 border-black shadow-[2px_2px_0px_0px_#000]">VERIFIED • NO UPFRONT • PAY AFTER APPROVAL</span>
          <span className="text-[11px] px-3 py-2 rounded-full bg-black text-white font-bold">FULL SCREEN • CLASSY • EDGE TO EDGE • ONLY PLATES YELLOW</span>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-14 items-start">
          {/* LEFT - TITLE + FORM FULL WIDTH */}
          <div>
            <h1 className="text-[38px] md:text-[56px] lg:text-[64px] font-black tracking-[-0.03em] leading-[0.9]">Find trusted<br/>garages<br/><span className="text-zinc-400">in Glasgow</span></h1>
            <p className="text-[15px] md:text-[16px] text-zinc-600 mt-6 leading-relaxed max-w-[640px]">Enter your postcode and vehicle registration. Explain the issue in your own words. AI structures your request and shows only relevant providers — capability, brand expertise, distance, availability — not a generic list. No hidden sponsored ranking. Customer choice stays with customer.</p>

            <div className="mt-10 space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div><label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Postcode / Location • Where are you?</label><input value={postcode} onChange={e=>setPostcode(e.target.value)} className="mt-3 w-full h-14 bg-white border-2 border-zinc-200 rounded-[14px] px-5 text-[15px] font-semibold focus:border-black focus:outline-none shadow-sm" placeholder="G20 6" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Vehicle Reg • Only plates yellow • DVLA lookup</label><div className="mt-3 flex gap-3"><div className="flex-1 h-14 bg-[#FFCC00] border-[2.5px] border-black rounded-[12px] flex items-center justify-center font-black text-[16px] shadow-[2.5px_2.5px_0px_0px_#000]"><input value={reg} onChange={e=>setReg(e.target.value)} className="bg-transparent text-center font-black w-full outline-none" /></div><button className="h-14 px-7 rounded-[14px] bg-black text-white text-[13px] font-bold">Lookup</button></div></div>
              </div>

              <div className="bg-white border-2 border-zinc-200 rounded-[16px] p-4 flex items-center gap-4 shadow-sm">
                <div className="w-[88px] h-[42px] bg-[#FFCC00] border-2 border-black rounded-[8px] flex items-center justify-center font-black text-[12px] shadow-[1px_1px_0px_0px_#000]">YK66 OPR</div>
                <div><p className="font-bold text-[14px]">BMW 1 Series • 2016 • 1.5D • 52k mi • BLACK</p><p className="text-[12px] text-zinc-500 mt-0.5">MOT Due 12 Dec 2026 • Last Service Mar 2026 • 48k mi • Internal ID: VEH-YK66OPR • Evidence source: DVLA</p></div>
              </div>

              <div><label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Explain need • Text / Voice • English / Urdu / Punjabi • AI structures: vehicle, service, symptoms, urgency, time, location</label><textarea value={issue} onChange={e=>setIssue(e.target.value)} className="mt-3 w-full h-[100px] bg-white border-2 border-zinc-200 rounded-[14px] px-5 py-4 text-[14px] focus:border-black focus:outline-none resize-none shadow-sm" /></div>

              <div><label className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Service needed • Multi-select • Capability graph must support • PDF Page 5</label><div className="mt-3 flex flex-wrap gap-2.5">{SERVICES.map(s=> <button key={s} onClick={()=> setSelected(p=> p.includes(s) ? p.filter(x=>x!==s) : [...p, s])} className={`text-[13px] font-semibold px-4 py-2.5 rounded-full border-2 transition-all ${selected.includes(s)?"bg-black text-white border-black shadow-[1px_1px_0px_0px_#000]":"bg-white border-zinc-200 hover:border-black hover:shadow-sm"}`}>{s}</button>)}</div></div>

              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-[11px] font-bold uppercase text-zinc-500">Urgency • When do you need it?</label><div className="mt-3 flex flex-wrap gap-2">{["Now","Today","Tomorrow","This Week"].map(u=> <button key={u} onClick={()=>setUrgency(u)} className={`h-11 px-5 rounded-full border-2 text-[13px] font-semibold ${urgency===u?"bg-black text-white border-black":"bg-white border-zinc-200 hover:border-black"}`}>{u}</button>)}</div></div>
                <div><label className="text-[11px] font-bold uppercase text-zinc-500">Preferred time • Morning / Afternoon / Evening</label><div className="mt-3 flex flex-wrap gap-2">{["Morning","Afternoon","Evening"].map(t=> <button key={t} onClick={()=>setTime(t)} className={`h-11 px-5 rounded-full border-2 text-[13px] font-semibold ${time===t?"bg-black text-white border-black":"bg-white border-zinc-200 hover:border-black"}`}>{t}</button>)}</div></div>
              </div>
            </div>
          </div>

          {/* RIGHT - STATS + AI + SERVICES FULL SCREEN */}
          <div className="space-y-4 lg:sticky lg:top-[88px]">
            <div className="bg-white border-2 border-zinc-200 rounded-[20px] p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">On-time completion • Verified • No upfront</p>
              <div className="mt-4 flex items-center gap-5"><div className="w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center font-black text-[20px]">95%</div><div><p className="font-bold text-[15px]">Above target • Crystal</p><p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">24 of 25 jobs on time<br/>Glasgow G20 • Animated<br/>Verified performance</p><span className="mt-3 inline-block text-[11px] font-black px-3 py-1.5 rounded-full bg-[#FFCC00] border-2 border-black">Best week • Fast response</span></div></div>
            </div>

            <div className="bg-[#0a0a0a] text-white rounded-[20px] p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">🤖 AI structured request • System structures: vehicle, service, symptoms, urgency, preferred time, location • Capability graph (not generic)</p>
              <p className="text-[13px] leading-relaxed mt-3 text-white/85">AI: {reg} • BMW 1 Series 2016 • {selected.join(", ")} • Issue: {issue.slice(0,90)}... • Postcode {postcode} • Found {GARAGES.length} relevant providers matching capability graph (not generic list) • BMW electrical? → Only BMW specialist + EV competence + 24/7 + geography filtered • Distance + service capability + specialist brand + 24/7 + mobile/workshop + availability + verified performance • No hidden sponsored • Customer choice stays with customer.</p>
              <button className="mt-5 w-full h-12 rounded-full bg-white text-black font-bold text-[13px]">Discover relevant providers → {GARAGES.length} relevant (not generic)</button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="bg-[#FFCC00] border-[2.5px] border-black rounded-[18px] p-5 shadow-[3px_3px_0px_0px_#000]"><p className="text-[11px] font-black uppercase">Mobile service • Crystal</p><p className="text-[16px] font-black mt-1">Mobile Mechanics - Service At Your Home</p><p className="text-[13px] mt-2 text-black/70">Mobile, 24/7, Recovery • Capability graph relevant • No hidden ranking</p></div>
              <div className="bg-white border-2 border-zinc-200 rounded-[18px] p-5 flex justify-between items-center"><div><p className="text-[11px] font-bold uppercase text-zinc-500">Taxi service • Glass</p><p className="text-[14px] font-bold mt-1">After car drop - Taxi auto booking</p></div><span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-black text-white">Auto Taxi • £20/day</span></div>
              <div className="bg-white border-2 border-zinc-200 rounded-[18px] p-5"><p className="text-[11px] font-bold uppercase text-zinc-500">Live tracking • Clear</p><p className="text-[14px] font-bold mt-1">Live tracking from garage to home</p><p className="text-[12px] text-zinc-500 mt-2">Workshop visibility: Received → In Progress → Ready • Real-time • No surveillance</p></div>
              <div className="bg-white border-2 border-zinc-200 rounded-[18px] p-5 border-dashed"><p className="text-[11px] font-bold uppercase text-zinc-500">Breakdown SOS • Glass • 24/7</p><p className="text-[14px] font-bold mt-1">Nearest mechanic auto assigned • Recovery</p></div>
            </div>
          </div>
        </div>

        {/* GARAGES FULL SCREEN GRID - EDGE TO EDGE */}
        <div className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6"><h2 className="text-[22px] md:text-[28px] font-black tracking-tight">Trusted garages near you • {GARAGES.length} found • Relevant only • Not generic list</h2><span className="text-[12px] text-zinc-500">Capability + brand + distance + availability + verified performance • No hidden sponsored • Customer choice • PDF Page 5</span></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {GARAGES.map(g=>(
              <div key={g.id} className="bg-white rounded-[20px] border-2 border-zinc-200 p-6 hover:border-black hover:shadow-[3px_3px_0px_0px_#000] transition-all group">
                <div className="flex justify-between items-start"><div className="w-10 h-10 rounded-[12px] bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">🔧</div><span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-black text-white">{g.badge}</span></div>
                <h3 className="font-black text-[18px] mt-5">{g.name}</h3>
                <p className="text-[12px] text-zinc-500 mt-1.5">{g.area} • {g.distance} • {g.jobs} jobs • {g.avail}</p>
                <div className="mt-4 flex flex-wrap gap-2">{g.caps.map(c=> <span key={c} className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200">{c}</span>)}</div>
                <p className="text-[12px] text-zinc-500 mt-4 leading-relaxed">{g.price} • {g.spec} • Pay after approval • Capability graph relevant • Customer choice • No hidden sponsored</p>
                <button onClick={()=>handleBook(g)} className="mt-5 w-full h-12 rounded-full bg-black text-white text-[13px] font-bold group-hover:bg-zinc-900">Book Now → {g.name} • {selected[0]}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t-2 border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-zinc-500 max-w-[700px] leading-relaxed"><span className="font-black text-black">Next →</span> Customer sends structured request / booking preference to garage (Page 4 Step 6) → Garage returns itemised quote or pre-set service price → Customer confirms → Both sides see confirmed booking immediately → If deposit required, only booking amount via platform → Repair balance direct to garage (Page 12 LOCKED) → Vehicle timeline + reminders (Page 11) → OS Complete! • Full screen • Classy • Only plates yellow • White + Black • Spacious • No eye pain</p>
          <a href="/garage" className="h-11 px-6 rounded-full bg-black text-white text-[13px] font-bold flex items-center shrink-0">Go to Garage OS → Ultimate Professional</a>
        </div>
      </div>
    </div>
  );
}
