"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATS = [
  { key: "ALL", label: "Total", color: "bg-white text-black" },
  { key: "paid", label: "New Paid", color: "bg-green-500 text-white" },
  { key: "confirmed", label: "Confirmed", color: "bg-blue-500 text-white" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-400 text-black" },
  { key: "ready", label: "Ready", color: "bg-purple-500 text-white" },
  { key: "completed", label: "Done", color: "bg-zinc-700 text-white" },
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
          const ok = confirm(`⚠️ CLOCKING! Last ${last.mileage} tha, ab ${mileageValue} kam - Continue?`);
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
    const msg = next === "completed"
     ? `Thank you! ${b.booking_ref} Completed @ ${mileageValue} miles. Total: £${b.total_price || 0}. Verified history updated - Next due ${mileageValue ? mileageValue + 10000 : ''} miles - Haji Auto Center`
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
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">haji auto center</h1>
            <p className="text-zinc-500 mt-1">Garage Dashboard • <span className="text-white font-bold">{bookings.length} bookings</span> • <span className="text-green-400">{count('paid')} new paid</span> • <span className="text-yellow-400">Mileage ON - UK 10k</span></p>
          </div>
          <div className="flex gap-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <p className="text-xs text-zinc-500">Revenue Today</p>
              <p className="font-bold text-lg text-green-400">£{(bookings.filter(b=>b.status==='paid').length * 50).toFixed(0)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <p className="text-xs text-zinc-500">Active Jobs</p>
              <p className="font-bold text-lg text-yellow-400">{count('in_progress') + count('confirmed')}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {STATS.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap ${filter===s.key? s.color + ' scale-105' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
              {s.label} ({count(s.key)})
            </button>
          ))}
        </div>
        {loading && <div className="text-zinc-500 animate-pulse">Loading jobs...</div>}
        <div className="grid gap-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-[#151515] border border-zinc-800 rounded-xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-yellow-400 font-black text-lg">{b.booking_ref}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${b.status==='paid'?'bg-green-500 text-white animate-pulse': b.status==='confirmed'?'bg-blue-500/20 text-blue-400 border border-blue-500/30': b.status==='in_progress'?'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30': b.status==='ready'?'bg-purple-500/20 text-purple-300 border border-purple-500/30':'bg-zinc-800 text-zinc-400'}`}>{b.status}</span>
                    <span className="text-zinc-600 text-xs">{new Date(b.created_at).toLocaleDateString()}</span>
                    {b.mileage_completed && <span className="text-green-400 text-xs">@ {b.mileage_completed} miles ✓</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-zinc-600">Name:</span> <span className="text-white">{b.customer_name || "N/A"}</span></div>
                    <div><span className="text-zinc-600">Phone:</span> <span className="text-white">{b.phone || "N/A"}</span></div>
                    <div><span className="text-zinc-600">Amount:</span> <span className="text-green-400 font-bold">£{b.amount? (b.amount/100).toFixed(0) : b.total_price || 0}</span></div>
                    <div><span className="text-zinc-600">Car:</span> <span className="text-white">{b.vehicle_reg || "N/A"}</span></div>
                  </div>
                </div>
                <div className="flex lg:flex-col gap-2">
                  {NEXT_MAP[b.status?.toLowerCase()] && (
                    <button onClick={() => updateStatus(b, NEXT_MAP[b.status.toLowerCase()])} className="flex-1 lg:w-32 py-3 bg-yellow-400 text-black rounded-xl font-black text-sm">
                      {b.status==='paid'? '✓ ACCEPT' : b.status==='confirmed'? '▶ START' : b.status==='in_progress'? '✓ READY' : '✓ COMPLETE + Mileage'}
                    </button>
                  )}
                  <div className="flex gap-2">
                    <a href={`/garage/job/${b.booking_ref}`} className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold">Job Card</a>
                    <a href={`/track/${b.booking_ref}`} target="_blank" className="px-4 py-2.5 bg-black border border-zinc-700 rounded-xl text-xs">Track</a>
                    <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}`} target="_blank" className="px-4 py-2.5 bg-[#25D366] text-black rounded-xl text-xs font-bold">WA</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}