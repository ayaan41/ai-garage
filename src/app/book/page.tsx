"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SERVICES = [
  { id: "mot", name: "MOT", desc: "Annual test • 45 mins", time: "45m", icon: "📋", shapeBg: "bg-[#2563EB]", shapeStyle: "rounded-[10px]" },
  { id: "full_service", name: "Full Service", desc: "Oil, filters, full check", time: "2h", icon: "🔧", shapeBg: "bg-[#059669]", shapeStyle: "rounded-[10px]" },
  { id: "oil", name: "Oil Service", desc: "Oil + filter change", time: "30m", icon: "🛢️", shapeBg: "bg-[#D97706]", shapeStyle: "rounded-full" },
  { id: "brakes", name: "Brakes", desc: "Pads / discs check", time: "1h", icon: "🛞", shapeBg: "bg-[#DC2626]", shapeStyle: "rounded-full" },
  { id: "diagnostics", name: "Diagnostics", desc: "Fault code scan", time: "30m", icon: "💻", shapeBg: "bg-[#7C3AED]", shapeStyle: "rounded-[6px] rotate-45" },
  { id: "tyres", name: "Tyres", desc: "Replacement & fitting", time: "30m", icon: "⚫", shapeBg: "bg-[#111827]", shapeStyle: "rounded-full" },
  { id: "aircon", name: "Air Con", desc: "Regas & service", time: "45m", icon: "❄️", shapeBg: "bg-[#0891B2]", shapeStyle: "rounded-[4px]" },
  { id: "battery", name: "Battery", desc: "Check / replace", time: "20m", icon: "🔋", shapeBg: "bg-[#CA8A04]", shapeStyle: "rounded-[8px]" },
];

const TIME_SLOTS = [
  { id: "today_9", label: "Today", time: "9:00 AM", available: "3 garages • G20 0.8 mi" },
  { id: "today_130", label: "Today", time: "1:30 PM", available: "2 garages • G20 0.8 mi" },
  { id: "tomorrow_9", label: "Tomorrow", time: "9:00 AM", available: "5 garages • G20, G21" },
  { id: "tomorrow_2", label: "Tomorrow", time: "2:00 PM", available: "4 garages • G20" },
  { id: "sat_9", label: "Saturday", time: "9:00 AM", available: "6 garages • All nearby" },
  { id: "mon_9", label: "Monday", time: "9:00 AM", available: "5 garages • All nearby" },
];

export default function BookShapeColorOnly() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("today_130");
  const [form, setForm] = useState({
    reg: "",
    car: "",
    customer: "",
    phone: "",
    area: "G20 6 • Glasgow",
    detail: "",
  });

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s=>s!==id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length===0) { alert("Please select service"); return; }
    if (!form.reg || !form.customer || !form.phone) { alert("Reg, Name, Phone required"); return; }

    setLoading(true);
    const bookingId = `AG-${Date.now().toString().slice(-6)}`;
    const slot = TIME_SLOTS.find(s=>s.id===selectedSlot);
    const servicesNames = selectedServices.map(id=> SERVICES.find(s=>s.id===id)?.name).join(", ");
    
    const newBooking = {
      id: bookingId,
      reg: form.reg.toUpperCase(),
      car: form.car || "Car - TBC",
      year: form.car || "TBC",
      customer: form.customer,
      area: form.area,
      phone: form.phone,
      arrival: `${slot?.label} ${slot?.time} • ${slot?.available}`,
      pickup: "TBD - Garage will quote",
      duration: servicesNames,
      tab: "New",
      time_ago: "Just now",
      work: [servicesNames + (form.detail ? ` • ${form.detail}` : "")],
      detail: `Services: ${servicesNames}. Detail: ${form.detail}. Slot: ${slot?.label} ${slot?.time}`,
      ai: "Customer added detail",
      match: "New",
      price: "TBD - Garage will quote",
      parts: selectedServices.join(", "),
      supplier: "To be checked",
    };

    const { error } = await supabase.from("bookings").insert([newBooking]);
    if (error) { alert(error.message); setLoading(false); return; }
    
    const servicesQuery = encodeURIComponent(servicesNames);
    const slotQuery = encodeURIComponent(`${slot?.label} ${slot?.time}`);
    router.push(`/garages?id=${bookingId}&services=${servicesQuery}&slot=${slotQuery}&area=${encodeURIComponent(form.area)}&detail=${encodeURIComponent(form.detail)}`);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-[#0a0a0a] antialiased">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-[960px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-black rounded-[8px] flex items-center justify-center text-white font-bold text-[10px]">AG</div><span className="font-semibold text-[13px]">AI GARAGE</span><span className="text-[11px] text-zinc-400 ml-3 hidden md:block">Book → Garage • Shape Color Only</span></div>
          <span className="text-[11px] bg-zinc-900 text-white rounded-full px-3 py-1 font-medium">Live • No Price</span>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-6 py-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Book your car in</h1>
        <p className="text-[13px] text-zinc-500 mt-2">Card white hi rahega (pehle jaisa) - sirf shape colorful exact! Detail box bhi hai.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="bg-white rounded-[16px] border border-zinc-200 p-5">
            <h3 className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wide">Your vehicle • Step 1</h3>
            <div className="mt-4 grid grid-cols-[160px_1fr] gap-3">
              <div><label className="text-[11px] font-medium text-zinc-700">Registration *</label><input value={form.reg} onChange={e=>setForm({...form, reg: e.target.value.toUpperCase()})} placeholder="AB12 CDE" className="mt-1.5 w-full h-[44px] bg-[#FFCC00] border-2 border-black rounded-[10px] px-3.5 font-bold uppercase text-[14px] focus:outline-none" /></div>
              <div><label className="text-[11px] font-medium text-zinc-700">Car (optional)</label><input value={form.car} onChange={e=>setForm({...form, car: e.target.value})} placeholder="e.g. VW Golf 2019" className="mt-1.5 w-full h-[44px] border border-zinc-200 rounded-[10px] px-3.5 text-[13px] focus:outline-none focus:border-zinc-400" /></div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-zinc-200 p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wide">What do you need? * • Step 2 • Card White • Shape Colorful Exact</h3><span className="text-[11px] font-medium">{selectedServices.length} selected</span></div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map(s=>(
                <button key={s.id} type="button" onClick={()=>toggleService(s.id)} className={`group text-left rounded-[14px] border p-4 flex items-center justify-between transition-all bg-white ${selectedServices.includes(s.id) ? "border-black shadow-[0_0_0_2px_#000]" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}>
                  <div className="flex items-center gap-3.5">
                    {/* SHAPE ONLY COLORED - CARD WHITE */}
                    <div className={`w-10 h-10 ${s.shapeBg} ${s.shapeStyle} flex items-center justify-center text-[16px] text-white shadow-sm shrink-0`}>
                      <span className={s.id==="diagnostics" ? "-rotate-45" : ""}>{s.icon}</span>
                    </div>
                    <div><p className="text-[13.5px] font-medium text-zinc-900 leading-none">{s.name}</p><p className="text-[11px] mt-1 text-zinc-500">{s.desc}</p></div>
                  </div>
                  <div className="flex items-center gap-2"><span className="text-[11px] text-zinc-400">{s.time}</span><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedServices.includes(s.id) ? "bg-black border-black text-white" : "border-zinc-300 bg-white"}`}>{selectedServices.includes(s.id) && <span className="text-[10px] font-bold">✓</span>}</div></div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-3">Card white (pehle jaisa) - sirf shape colorful exact - MOT blue, Service green, Oil amber, Brakes red, Diagnostics purple, Tyres black, AirCon cyan, Battery yellow!</p>
          </div>

          <div className="bg-white rounded-[16px] border-2 border-black p-5 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-3"><h3 className="text-[11px] font-semibold uppercase tracking-wide">Tell us about your car issue • Step 3 • Detail Box</h3><span className="text-[10px] bg-[#FFCC00] border border-black rounded-full px-2.5 py-1 font-bold">Important</span></div>
            <textarea value={form.detail} onChange={e=>setForm({...form, detail: e.target.value})} placeholder="Yahan likho - e.g. Meri gadi me front se awaaz aa rahi hai jab brake lagata hu, MOT fail hai emission pe, oil leak ho raha hai, etc. Jo bhi masla hai detail me likho..." rows={4} className="w-full border-2 border-zinc-200 rounded-[12px] px-4 py-3 text-[13px] leading-relaxed focus:outline-none focus:border-black resize-none" />
            <p className="text-[10px] text-zinc-400 mt-2">{form.detail.length} chars • Garage will read this before quoting</p>
          </div>

          <div className="bg-white rounded-[16px] border border-zinc-200 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-4">When? Choose slot + nearby • Step 4</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {TIME_SLOTS.map(slot=>(
                <button key={slot.id} type="button" onClick={()=>setSelectedSlot(slot.id)} className={`text-left rounded-[12px] border-2 p-4 flex items-center justify-between bg-white ${selectedSlot===slot.id ? "border-black shadow-[0_0_0_2px_#000]" : "border-zinc-200 hover:border-zinc-300"}`}>
                  <div><p className="text-[13.5px] font-medium text-zinc-900">{slot.label} • {slot.time}</p><p className="text-[11px] mt-1 text-zinc-500">📍 {slot.available}</p></div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedSlot===slot.id ? "bg-black border-black text-white" : "border-zinc-300 bg-white"}`}>{selectedSlot===slot.id && <span className="text-[10px]">✓</span>}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-zinc-200 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-4">Your details • Step 5</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-medium text-zinc-700">Name *</label><input value={form.customer} onChange={e=>setForm({...form, customer: e.target.value})} placeholder="Full name" className="mt-1.5 w-full h-[44px] border border-zinc-200 rounded-[10px] px-3.5 text-[13px] focus:outline-none focus:border-zinc-400" /></div>
              <div><label className="text-[11px] font-medium text-zinc-700">Phone *</label><input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="07xxx xxxxxx" className="mt-1.5 w-full h-[44px] border border-zinc-200 rounded-[10px] px-3.5 text-[13px] focus:outline-none focus:border-zinc-400" /></div>
            </div>
            <div className="mt-3"><label className="text-[11px] font-medium text-zinc-700">Area</label><input value={form.area} onChange={e=>setForm({...form, area: e.target.value})} placeholder="G20 6 • Glasgow" className="mt-1.5 w-full h-[44px] border border-zinc-200 rounded-[10px] px-3.5 text-[13px] focus:outline-none focus:border-zinc-400" /></div>
          </div>

          <div className="bg-black rounded-[16px] p-5 text-white border-2 border-black">
            <p className="text-[13px] font-medium">Ready? {selectedServices.length} services + Detail: {form.detail ? `"${form.detail.slice(0,30)}..."` : "Add detail"} • {TIME_SLOTS.find(s=>s.id===selectedSlot)?.label} {TIME_SLOTS.find(s=>s.id===selectedSlot)?.time}</p>
            <button type="submit" disabled={loading || selectedServices.length===0 || !form.reg || !form.customer || !form.phone} className="mt-4 w-full h-12 rounded-full bg-white text-black font-semibold text-[14px] disabled:opacity-40">Continue → Choose garage nearby</button>
          </div>
        </form>
      </div>
    </div>
  );
}
