"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const STATS = [
  { key: "ALL", label: "Total", color: "bg-white text-black" },
  { key: "paid", label: "New Paid", color: "bg-[#00d084] text-black shadow-[0_8px_20px_rgba(0,208,132,0.4)]" },
  { key: "confirmed", label: "Confirmed", color: "bg-[#3b82f6] text-white shadow-[0_8px_20px_rgba(59,130,246,0.4)]" },
  { key: "in_progress", label: "In Progress", color: "bg-[#ffcc00] text-black shadow-[0_8px_20px_rgba(255,204,0,0.4)]" },
  { key: "ready", label: "Ready", color: "bg-[#a855f7] text-white shadow-[0_8px_20px_rgba(168,85,247,0.4)]" },
  { key: "completed", label: "Done", color: "bg-white text-black" },
];

const NEXT_MAP: any = {
  paid: "confirmed",
  confirmed: "in_progress",
  in_progress: "ready",
  ready: "completed",
};

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (b: any, next: string) => {
    let mileageValue = null;
    if (next === "completed") {
      const mileageInput = prompt(`🔧 ${b.booking_ref} - COMPLETE ke liye MILEAGE LAZMI!\nMeter se dekho:\n\nExample: 84500`);
      if (!mileageInput || parseInt(mileageInput) <= 0) {
        alert("❌ Mileage ke bina complete nahi ho sakta - Ye 100% history ka rule hai!");
        return;
      }
      mileageValue = parseInt(mileageInput);
      const cleanReg = (b.vehicle_reg || b.car_reg || "").toUpperCase().replace(/\s/g,"");
      if (cleanReg) {
        const { data: last } = await supabase.from("car_service_logs").select("mileage").eq("car_reg", cleanReg).order("mileage", { ascending: false }).limit(1).single();
        if (last && mileageValue < last.mileage) {
          const ok = confirm(`⚠ CLOCKING! Last ${last.mileage} tha, ab ${mileageValue} kam - Continue?`);
          if (!ok) return;
        }
        await supabase.from("car_service_logs").insert([{
          car_reg: cleanReg,
          mileage: mileageValue,
          service_type: b.service_type || "Full Service",
          date: new Date().toISOString().split('T')[0],
          source: "garage",
          garage_name: "Haji Auto Center",
          verified: true,
          added_by: "garage",
          notes: `Booking ${b.booking_ref} completed @ ${mileageValue} miles`
        }]);
        const { data: carExists } = await supabase.from("cars").select("car_reg").eq("car_reg", cleanReg).single();
        if (!carExists && b.customer_email) {
          await supabase.from("cars").insert([{ car_reg: cleanReg, original_owner_email: b.customer_email, is_public: false }]);
        }
      }
    }
    // Custom interval check for SMS
    let nextDueText = "";
    if(mileageValue){
      const cleanReg = (b.vehicle_reg || "").toUpperCase().replace(/\s/g,"");
      let interval = 10000
      if(cleanReg && b.customer_email){
        const { data: intData } = await supabase.from("car_custom_intervals").select("oil_miles").eq("car_reg", cleanReg).eq("owner_email", b.customer_email).single()
        if(intData) interval = intData.oil_miles
      }
      nextDueText = ` - Next due ${mileageValue + interval} miles`
    }

    const msg = next === "completed"
    ? `Thank you! ${b.booking_ref} Completed @ ${mileageValue} miles. Total: £${b.total_price || 0}. Verified history updated${nextDueText} - Haji Auto Center`
      : `Hi ${b.customer_name}, your car ${b.booking_ref} is now ${next.toUpperCase()}. Track: https://ai-garage-mubeena754-2079s-projects.vercel.app/track/${b.booking_ref}`;
    await fetch("/api/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: b.phone, message: msg, booking_ref: b.booking_ref }) });
    const updateData: any = { status: next };
    if (mileageValue) { updateData.mileage_completed = mileageValue; updateData.completed_at = new Date().toISOString(); }
    await supabase.from("bookings").update(updateData).eq("id", b.id);
    load();
  };

  const filtered = filter === "ALL"? bookings : bookings.filter(b => (b.status || "").toLowerCase() === filter.toLowerCase());
  const count = (k: string) => k === "ALL"? bookings.length : bookings.filter(b => (b.status || "").toLowerCase() === k.toLowerCase()).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w- mx-auto p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 bg-[#ffcc00] rounded-full"></div>
              <div>
                <h1 className="text- md:text- font-black tracking-tighter leading-none uppercase">haji auto center</h1>
                <p className="text- tracking-widest font-black text-white/40 uppercase mt-1">Garage Dashboard • UK 10k Standard</p>
              </div>
            </div>
            <p className="text- text-white/50 mt-3 font-medium"><span className="text-white font-black">{bookings.length} bookings</span> • <span className="text-[#00d084] font-black">{count('paid')} new paid</span> • <span className="text-[#ffcc00] font-black">Mileage ON - UK 10k</span></p>
          </div>
          <div className="flex gap-3">
            <div className="bg-[#151515] border border-white/5 rounded- px-5 py-3 min-w-">
              <p className="text- tracking-widest font-black text-white/30 uppercase">Revenue Today</p>
              <p className="font-black text- text-[#00d084] mt-1">£{(bookings.filter(b=>b.status==='paid').length * 50).toFixed(0)}</p>
            </div>
            <div className="bg-[#151515] border border-white/5 rounded- px-5 py-3 min-w-">
              <p className="text- tracking-widest font-black text-white/30 uppercase">Active Jobs</p>
              <p className="font-black text- text-[#ffcc00] mt-1">{count('in_progress') + count('confirmed')}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {STATS.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} className={`px-5 py-2.5 rounded-full text- font-black tracking-widest uppercase whitespace-nowrap transition-all border ${filter===s.key? s.color + ' border-transparent scale-[1.05]' : 'bg-[#151515] text-white/40 border-white/5 hover:border-white/20 hover:text-white'}`}>
              {s.label} ({count(s.key)})
            </button>
          ))}
        </div>

        {loading && <div className="text-white/30 animate-pulse font-bold text- tracking-widest">Loading jobs...</div>}

        <div className="grid gap-3">
          {filtered.map(b => (
            <div key={b.id} className="group bg-[#151515] border border-white/5 rounded- p-5 hover:border-white/10 hover:bg-[#1a1a1a] transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="bg-[#ffcc00] text-black font-black text- px-3 py-1 rounded- tracking-wider">{b.booking_ref}</span>
                    <span className={`px-3 py-1 rounded-full text- font-black uppercase tracking-widest border ${b.status==='paid'?'bg-[#00d084] text-black border-transparent animate-pulse': b.status==='confirmed'?'bg-blue-500/20 text-blue-400 border-blue-500/30': b.status==='in_progress'?'bg-[#ffcc00]/20 text-[#ffcc00] border-[#ffcc00]/30': b.status==='ready'?'bg-purple-500/20 text-purple-300 border-purple-500/30':'bg-white/5 text-white/40 border-white/10'}`}>{b.status}</span>
                    <span className="text-white/30 text- font-medium">{new Date(b.created_at).toLocaleDateString('en-GB')}</span>
                    {b.mileage_completed && <span className="text-[#00d084] text- font-black bg-[#00d084]/10 px-2.5 py-1 rounded-full border border-[#00d084]/20">@ {b.mileage_completed.toLocaleString()} miles ✓ Verified</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-">
                    <div className="bg-black/50 rounded- px-3 py-2 border border-white/5"><span className="text-white/30 text- font-black uppercase tracking-widest block">Name</span><span className="text-white font-bold mt-1 block">{b.customer_name || "N/A"}</span></div>
                    <div className="bg-black/50 rounded- px-3 py-2 border border-white/5"><span className="text-white/30 text- font-black uppercase tracking-widest block">Phone</span><span className="text-white font-bold mt-1 block">{b.phone || "N/A"}</span></div>
                    <div className="bg-black/50 rounded- px-3 py-2 border border-white/5"><span className="text-white/30 text- font-black uppercase tracking-widest block">Amount</span><span className="text-[#00d084] font-black mt-1 block">£{b.amount? (b.amount/100).toFixed(0) : b.total_price || 0}</span></div>
                    <div className="bg-[#ffcc00] rounded- px-3 py-2 border-2 border-black"><span className="text-black/50 text- font-black uppercase tracking-widest block">Car Reg</span><span className="text-black font-black mt-1 block tracking-wider">{b.vehicle_reg || b.car_reg || "N/A"}</span></div>
                  </div>
                </div>
                <div className="flex lg:flex-col gap-2">
                  {NEXT_MAP[b.status?.toLowerCase()] && (
                    <button onClick={() => updateStatus(b, NEXT_MAP[b.status.toLowerCase()])} className="flex-1 lg:w- h- bg-[#ffcc00] hover:bg-[#ffd500] text-black rounded- font-black text- tracking-wide transition-all active:scale-[0.98] shadow-lg">
                      {b.status==='paid'? '✓ ACCEPT' : b.status==='confirmed'? '▶ START JOB' : b.status==='in_progress'? '✓ MARK READY' : '✓ COMPLETE + Mileage'}
                    </button>
                  )}
                  <div className="flex gap-2">
                    <a href={`/garage/job/${b.booking_ref}`} className="flex-1 lg:w-auto px-4 h- bg-white/5 hover:bg-white/10 border border-white/10 rounded- text- font-black tracking-widest uppercase flex items-center justify-center transition-all">Job Card</a>
                    <a href={`/track/${b.booking_ref}`} target="_blank" className="flex-1 lg:w-auto px-4 h- bg-white text-black rounded- text- font-black tracking-widest uppercase flex items-center justify-center hover:bg-white/90 transition-all">Track</a>
                    <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}`} target="_blank" className="w- h- bg-[#25D366] rounded- flex items-center justify-center font-black text- hover:scale-105 transition-all">WA</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 &&!loading && <div className="bg-[#151515] border border-white/5 rounded- p-12 text-center"><p className="font-black text-white/20 text- tracking-widest uppercase">No bookings in {filter}</p></div>}
        </div>
      </div>
    </div>
  );
}