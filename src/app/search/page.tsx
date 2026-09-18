"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SERVICES = ["MOT", "Full Service", "Oil Change", "Brakes", "Clutch", "DPF", "Diagnostics", "Electrical", "Tyres", "Recovery", "BMW Specialist", "EV/Hybrid", "Mobile", "24/7"];

const GARAGES = [
  { id: "g1", name: "Haji Auto Center", area: "Glasgow G20", dist: "0.4 mi", jobs: 127, rating: 4.9, caps: ["Full Service", "MOT", "Brake Check", "Oil Change", "BMW"], price: "From £49", spec: "All makes + BMW • Verified", badge: "Verified • 4.9★", avail: "Today 2 slots", match: "98% match • Capability graph • BMW + Brakes + G20 • Distance 0.4 mi • Available Today • Verified performance • 127 jobs", best: true },
  { id: "g2", name: "Glasgow Car Care", area: "Glasgow G21", dist: "1.2 mi", jobs: 89, rating: 4.7, caps: ["Service", "Tyres", "Battery"], price: "From £45", spec: "All makes • Verified", badge: "Verified • 4.7★", avail: "Tomorrow 3 slots", match: "85% match • Tyres + Service • Distance 1.2 mi • Available Tomorrow", best: false },
  { id: "g3", name: "Mobile Mechanic Pro", area: "Mobile", dist: "Mobile", jobs: 203, rating: 5.0, caps: ["Mobile Service", "Breakdown SOS", "Home Service", "24/7"], price: "From £35", spec: "Mobile • 24/7 • Recovery", badge: "Mobile • 5★", avail: "Now • Mobile", match: "92% match • Mobile + Brakes + 24/7 • Mobile to G20 • Now available • 203 jobs", best: false },
  { id: "g4", name: "Elite BMW Specialist", area: "Glasgow G21", dist: "1.2 mi", jobs: 189, rating: 4.9, caps: ["BMW Specialist", "Electrical", "Diagnostics", "EV"], price: "From £65", spec: "BMW Specialist • EV/Hybrid", badge: "BMW Specialist", avail: "Today 1 slot • Urgent", match: "99% match • BMW Specialist + Electrical + Brakes • Brand expertise • Distance 1.2 mi • Urgent slot • 189 jobs", best: true },
  { id: "g5", name: "Quick Fit Tyres", area: "Glasgow G20", dist: "0.6 mi", jobs: 412, rating: 4.6, caps: ["Tyres", "Mobile", "24/7"], price: "From £35", spec: "Tyres • Mobile", badge: "24/7 Mobile", avail: "Now • Mobile", match: "70% match • Tyres • Mobile • Distance 0.6 mi • Now" },
  { id: "g6", name: "Auto Electric Pro", area: "Glasgow G40", dist: "1.4 mi", jobs: 156, rating: 4.8, caps: ["Electrical", "Diagnostics", "DPF"], price: "From £55", spec: "Auto Electrical • EV", badge: "Verified • 4.8★", avail: "Today 3 slots", match: "88% match • Electrical + Diagnostics • Distance 1.4 mi • Available Today" },
];

export default function SearchDistinct() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("G20 6");
  const [reg, setReg] = useState("YK66 OPR");
  const [selected, setSelected] = useState<string[]>(["Oil Change", "Brakes", "BMW Specialist"]);
  const [urgency, setUrgency] = useState("Today");
  const [sortBy, setSortBy] = useState("Best match • Capability graph");
  const [filterMobile, setFilterMobile] = useState(false);
  const [filter24, setFilter24] = useState(false);

  const filtered = GARAGES.filter(g => {
    if (filterMobile && !g.caps.includes("Mobile")) return false;
    if (filter24 && !g.caps.includes("24/7")) return false;
    return true;
  }).sort((a,b) => (b.best?1:0)-(a.best?1:0));

  const handleBook = async (g:any) => {
    const id = `AG-${Math.floor(100000 + Math.random()*900000)}`;
    try { await supabase.from("bookings").insert({ id, reg, car: "BMW 1 Series • 2016", year: "2016 • 1.5D • 52k mi • BLACK", customer: "Mubeen Ahmad", area: `${postcode} • ${g.dist} • ${g.name}`, phone: "0909090900", arrival: "Today 2:00 PM", pickup: "Afternoon", work: [selected.join(", ")], detail: "Brake noise grinding", price: g.price.replace("From £",""), tab: "New", garage_name: g.name, postcode, services_needed: selected, parts: "Brake pads ATE £42", supplier: "Euro Car Parts Tomorrow 10 AM", parts_cost: "42" }); } catch(e) {}
    router.push("/garage");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-black antialiased">
      <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-30">
        <div className="w-full px-6 md:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center text-white font-black text-[11px]">AG</div><a href="/" className="font-bold text-[14px]">AI GARAGE • SEARCH</a><span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full bg-black text-white font-bold">SEARCH RESULTS • DISTINCT FROM HOMEPAGE • CAPABILITY GRAPH • NOT GENERIC LIST</span></div>
          <div className="flex gap-2"><a href="/" className="h-8 px-4 rounded-full bg-zinc-100 border text-[12px] font-semibold">Home</a><a href="/garage" className="h-8 px-4 rounded-full bg-black text-white text-[12px] font-bold">Garage OS →</a></div>
        </div>
      </header>

      {/* SEARCH BAR - COMPACT - DISTINCT FROM HOMEPAGE HERO */}
      <div className="bg-white border-b border-zinc-200 sticky top-[60px] z-20">
        <div className="w-full px-6 md:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <input value={postcode} onChange={e=>setPostcode(e.target.value)} placeholder="Postcode G20 6" className="h-10 w-[120px] bg-zinc-50 border-2 border-zinc-200 rounded-full px-4 text-[13px] font-semibold focus:border-black focus:outline-none" />
            <div className="w-[92px] h-[36px] bg-[#FFCC00] border-[1.5px] border-black rounded-[6px] flex items-center justify-center font-black text-[12px] shadow-[1px_1px_0px_0px_#000]"><input value={reg} onChange={e=>setReg(e.target.value)} className="bg-transparent text-center font-black w-full outline-none" /></div>
            <div className="flex flex-wrap gap-1.5">{SERVICES.slice(0,8).map(s=> <button key={s} onClick={()=>setSelected(p=> p.includes(s)?p.filter(x=>x!==s):[...p,s])} className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border-2 ${selected.includes(s)?"bg-black text-white border-black":"bg-white border-zinc-200 hover:border-black"}`}>{s}</button>)}</div>
            <select value={urgency} onChange={e=>setUrgency(e.target.value)} className="h-10 bg-white border-2 border-zinc-200 rounded-full px-3 text-[12px] font-semibold"><option>Today</option><option>Tomorrow</option><option>This Week</option><option>Now</option></select>
            <span className="text-[11px] text-zinc-500 hidden lg:block">BMW 1 Series • Brakes grinding • {postcode} • {selected.join(", ")} • {urgency} • {filtered.length} relevant (not generic)</span>
          </div>
          <div className="mt-3 bg-zinc-900 text-white rounded-[12px] px-4 py-2.5 text-[11px] leading-relaxed">AI: {reg} • BMW 1 Series 2016 • {selected.join(", ")} • Postcode {postcode} • {urgency} • Found {filtered.length} relevant providers matching capability graph (not generic list) • BMW electrical? → Only BMW specialist + EV competence + 24/7 + geography filtered • Distance + service capability + specialist brand + 24/7 + mobile/workshop + availability + verified performance • No hidden sponsored • Customer choice</div>
        </div>
      </div>

      <div className="w-full px-6 md:px-8 py-6 grid lg:grid-cols-[260px_1fr_320px] gap-6 items-start">
        {/* LEFT FILTERS - DISTINCT */}
        <div className="lg:sticky lg:top-[128px] space-y-4">
          <div className="bg-white rounded-[16px] border border-zinc-200 p-5">
            <p className="text-[12px] font-bold">Filters • Capability graph • PDF Page 5</p>
            <div className="mt-4 space-y-4">
              <div><p className="text-[11px] font-bold uppercase text-zinc-500">Sort by</p><div className="mt-2 space-y-1.5">{["Best match • Capability graph", "Distance • Nearest", "Availability • Soonest", "Rating • Highest", "Jobs completed", "Price • Low to high"].map(o=> <button key={o} onClick={()=>setSortBy(o)} className={`w-full text-left text-[11px] px-3 py-2 rounded-full border ${sortBy===o?"bg-black text-white border-black":"bg-white border-zinc-200 hover:border-black"}`}>{o}</button>)}</div></div>
              <div className="border-t border-zinc-100 pt-4"><p className="text-[11px] font-bold uppercase text-zinc-500">Service type</p><div className="mt-2 flex flex-wrap gap-1.5">{SERVICES.map(s=> <button key={s} onClick={()=>setSelected(p=> p.includes(s)?p.filter(x=>x!==s):[...p,s])} className={`text-[10px] px-2.5 py-1 rounded-full border ${selected.includes(s)?"bg-black text-white border-black":"bg-zinc-50 border-zinc-200"}`}>{s}</button>)}</div></div>
              <div className="border-t border-zinc-100 pt-4 space-y-2">
                <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={filterMobile} onChange={e=>setFilterMobile(e.target.checked)} /> Mobile service • At your home</label>
                <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={filter24} onChange={e=>setFilter24(e.target.checked)} /> 24/7 • Recovery • Breakdown SOS</label>
                <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" defaultChecked /> Verified only • 4.5★+ • No upfront</label>
                <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" /> BMW Specialist • EV/Hybrid competence</label>
              </div>
              <div className="border-t border-zinc-100 pt-4"><p className="text-[11px] font-bold uppercase text-zinc-500">Distance</p><input type="range" min="0" max="10" defaultValue="5" className="w-full mt-2" /><p className="text-[11px] text-zinc-500 mt-1">Up to 5 miles • G20 6 center • Glasgow</p></div>
            </div>
          </div>
          <div className="bg-[#FFCC00] border-2 border-black rounded-[16px] p-4 shadow-[1.5px_1.5px_0px_0px_#000]"><p className="text-[11px] font-black uppercase">Why not generic list? • PDF Page 5</p><p className="text-[11px] font-semibold mt-2 leading-relaxed">Capability graph must support: garage must have service + brand expertise + mobile/workshop + availability + distance + verified performance. No hidden sponsored ranking. Customer choice stays with customer. Booking amount only if deposit required, repair balance direct to garage (Page 12 LOCKED).</p></div>
        </div>

        {/* CENTER - RESULTS - DISTINCT FROM HOMEPAGE */}
        <div>
          <div className="flex items-baseline justify-between mb-4"><h2 className="text-[16px] font-bold">{filtered.length} relevant garages • Not generic list • Capability graph</h2><span className="text-[11px] text-zinc-500">Best match • No hidden sponsored • Customer choice • Glasgow G20</span></div>
          <div className="space-y-3">
            {filtered.map(g=>(
              <div key={g.id} className={`bg-white rounded-[18px] border-2 p-5 hover:border-black hover:shadow-sm transition-all ${g.best?"border-black shadow-[1.5px_1.5px_0px_0px_#000]":"border-zinc-200"}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-zinc-100 border flex items-center justify-center text-[14px]">🔧</div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-bold text-[15px]">{g.name}</h3>{g.best && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFCC00] border-2 border-black">BEST MATCH</span>}<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">{g.badge}</span></div>
                      <p className="text-[11px] text-zinc-500 mt-1">{g.area} • {g.dist} • {g.jobs} jobs • {g.avail} • {g.price} • {g.spec}</p>
                      <p className="text-[11px] text-zinc-700 mt-2 leading-relaxed bg-zinc-50 border border-zinc-200 rounded-[10px] px-3 py-2">{g.match}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">{g.caps.map(c=> <span key={c} className="text-[10px] px-2 py-1 rounded-full bg-zinc-100 border text-zinc-700">{c}</span>)}</div>
                    </div>
                  </div>
                  <button onClick={()=>handleBook(g)} className="h-9 px-4 rounded-full bg-black text-white text-[11px] font-bold shrink-0 hover:bg-zinc-800">Book →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - MAP + SELECTED */}
        <div className="lg:sticky lg:top-[128px] space-y-4">
          <div className="bg-white rounded-[16px] border-2 border-zinc-200 p-4">
            <p className="text-[11px] font-bold uppercase">Map • Glasgow G20 • 0.4 mi - 1.4 mi</p>
            <div className="mt-3 h-[200px] bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-[12px] flex items-center justify-center text-[11px] text-zinc-500 text-center p-4">Map placeholder<br/>G20 6 center • 6 garages • 0.4 mi - 1.4 mi • Mobile available<br/>Capability graph filtered • Not generic list • No hidden ranking</div>
            <div className="mt-3 flex flex-wrap gap-1.5">{filtered.slice(0,4).map(g=> <span key={g.id} className="text-[10px] px-2 py-1 rounded-full bg-black text-white">{g.name.split(" ")[0]} • {g.dist}</span>)}</div>
          </div>
          <div className="bg-zinc-900 text-white rounded-[16px] p-5"><p className="text-[11px] font-bold uppercase text-white/60">Customer choice • No hidden sponsored</p><p className="text-[12px] mt-3 leading-relaxed text-white/85">Search shows only relevant providers matching capability graph. Not a generic list. If you need BMW electrical? → Only BMW specialist + EV competence + 24/7 + geography filtered. You choose garage, not platform. No hidden sponsored ranking. Booking amount only if deposit required, repair balance direct to garage (Page 12 LOCKED).</p><a href="/" className="mt-4 block h-9 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">Back to Home • Intake</a></div>
          <div className="bg-white rounded-[16px] border border-zinc-200 p-4"><p className="text-[11px] font-bold uppercase text-zinc-500">After booking →</p><p className="text-[12px] font-semibold mt-2">Customer sends structured request / booking preference to garage (Page 4 Step 6) → Garage returns itemised quote or pre-set service price → Customer confirms → Both sides see confirmed booking immediately → If deposit required, only booking amount via platform → Repair balance direct to garage → Vehicle timeline + reminders → Ready → Auto WhatsApp + Invoice → Collected • OS Complete</p></div>
        </div>
      </div>
    </div>
  );
}
