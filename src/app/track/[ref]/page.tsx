"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const STEPS = [
  { key: "pending_quote", label: "Booking Received", desc: "We received your booking - quote pending" },
  { key: "confirmed", label: "Confirmed", desc: "Garage confirmed your booking" },
  { key: "in_progress", label: "Work in Progress", desc: "Mechanic working on your car" },
  { key: "ready", label: "Ready for Collection", desc: "Work completed, invoice ready" },
  { key: "completed", label: "Collected", desc: "Vehicle collected, thank you!" },
  // backward compatibility for old statuses
  { key: "pending", label: "Booking Received", desc: "We received your vehicle" },
  { key: "collected", label: "Collected", desc: "Vehicle collected" },
];

export default function TrackPage(){
  const params = useParams();
  const refParam = (params.id || params.ref) as string;
  const ref = refParam?.toString().toUpperCase();

  const [b, setB] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Try ref, then booking_ref, then id for compatibility
      let { data } = await supabase.from("bookings").select("*").eq("ref", ref).maybeSingle();
      if(!data) {
        const r2 = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
        if(r2.data) data = r2.data;
      }
      if(!data) {
        const r3 = await supabase.from("bookings").select("*").eq("id", ref).maybeSingle();
        if(r3.data) data = r3.data;
      }

      if(data) setB(data);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(()=>{
    if(ref && ref!== "UNDEFINED") {
      fetchBooking();
      const iv=setInterval(fetchBooking, 5000);
      return ()=>clearInterval(iv);
    } else {
      setLoading(false);
    }
  },[ref]);

  if(loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Tracking {ref}...</div>;
  if(!b) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
    <p className="text-xl font-bold">Booking {ref} not found</p>
    <p className="text-zinc-500 text-sm mt-2">Check your reference or contact garage</p>
    <a href="/" className="mt-4 px-6 py-3 bg-[#FFC600] text-black rounded-xl font-bold">Go Home</a>
  </div>;

  const currentIdx = STEPS.findIndex(s=>s.key===b.status);
  const displayIdx = currentIdx === -1? 0 : currentIdx;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10">
      <div className="max-w- mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-xs"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>LIVE TRACKING</div>
          <h1 className="text-3xl font-black mt-4 tracking-tighter">HAJI AUTO</h1>
          <p className="text-zinc-500 text-sm mt-1">Job #{b.ref} • {b.car_reg || b.vehicle_reg} • {b.customer_name}</p>
          <p className="text-zinc-400 text-xs mt-1">{b.service_type}</p>
          {b.total_price && <p className="text-2xl font-black mt-4 text-yellow-400">£{Number(b.total_price||0).toFixed(2)}</p>}
        </div>

        {/* Timeline */}
        <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
          {STEPS.filter((v,i,a)=>a.findIndex(t=>t.key===v.key)===i).slice(0,5).map((step, idx)=>{
            const done = idx <= displayIdx;
            const active = idx === displayIdx;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${done? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>{done? '✓' : idx+1}</div>
                  {idx < 4 && <div className={`w-0.5 h-16 ${done? 'bg-yellow-400' : 'bg-zinc-800'}`}></div>}
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
          <a href={`/invoice/${b.ref}`} className="py-4 bg-white text-black rounded-2xl font-black text-center">View Invoice</a>
          <a href={`https://wa.me/447...?text=Hi, tracking ${b.ref}`} className="py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-black text-center">Contact Garage</a>
        </div>

        <p className="text-center text- tracking-widest text-zinc-600 mt-8">AUTO REFRESH EVERY 5 SECONDS • HAJI AUTO GLASGOW</p>
      </div>
    </div>
  );
}