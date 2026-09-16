"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STEPS = [
  { key: "pending", label: "Booking Received", desc: "We received your vehicle" },
  { key: "in_progress", label: "Work in Progress", desc: "Mechanic working on your car" },
  { key: "ready", label: "Ready for Collection", desc: "Work completed, invoice ready" },
  { key: "collected", label: "Collected", desc: "Vehicle collected, thank you!" },
];

export default function TrackPage(){
  const { ref } = useParams() as any;
  const [b, setB] = useState<any>(null);

  const fetchBooking = async () => {
    const { data } = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
    if(data) setB(data);
  };

  useEffect(()=>{ fetchBooking(); const iv=setInterval(fetchBooking, 5000); return ()=>clearInterval(iv); },[ref]);

  if(!b) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Tracking {ref}...</div>;

  const currentIdx = STEPS.findIndex(s=>s.key===b.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10">
      <div className="max-w- mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-xs"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>LIVE TRACKING</div>
          <h1 className="text-3xl font-black mt-4 tracking-tighter">HAJI AUTO</h1>
          <p className="text-zinc-500 text-sm mt-1">Job #{ref} • {b.vehicle_reg} • {b.customer_name}</p>
          <p className="text-2xl font-black mt-4 text-yellow-400">£{Number(b.total_price||0).toFixed(2)}</p>
        </div>

        {/* Timeline */}
        <div className="bg-zinc-900 rounded- p-6 md:p-8 border border-zinc-800">
          {STEPS.map((step, idx)=>{
            const done = idx <= currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${done? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>{done? '✓' : idx+1}</div>
                  {idx < STEPS.length-1 && <div className={`w- h-16 ${done? 'bg-yellow-400' : 'bg-zinc-800'}`}></div>}
                </div>
                <div className={`flex-1 pb-12 ${active? '': 'opacity-60'}`}>
                  <p className={`font-black ${active? 'text-white' : 'text-zinc-300'}`}>{step.label} {active && <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black text- rounded-full">CURRENT</span>}</p>
                  <p className="text-sm text-zinc-500 mt-1">{step.desc}</p>
                  {active && b.mechanic_notes && <div className="mt-3 bg-black p-3 rounded-xl text-xs text-zinc-300 border border-zinc-800">🔧 {b.mechanic_notes}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a href={`/invoice/${ref}`} className="py-4 bg-white text-black rounded-2xl font-black text-center">View Invoice</a>
          <a href={`https://wa.me/447...?text=Hi, tracking ${ref}`} className="py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-black text-center">Contact Garage</a>
        </div>

        <p className="text-center text- tracking-widest text-zinc-600 mt-8">AUTO REFRESH EVERY 5 SECONDS • HAJI AUTO GLASGOW</p>
      </div>
    </div>
  );
}