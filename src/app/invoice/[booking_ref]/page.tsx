"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicePage(){
  const { ref } = useParams() as any;
  const [b, setB] = useState<any>(null);

  useEffect(()=>{
    supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle().then(({data})=>setB(data));
  },[ref]);

  if(!b) return <div className="min-h-screen bg-white text-black p-10">Loading Invoice {ref}...</div>;

  const serviceTotal = (b.services||[]).reduce((a:any,c:any)=>a+(parseFloat(c.price)||0),0);
  const partsTotal = (b.parts_used||[]).reduce((a:any,c:any)=>a+(parseFloat(c.price)||0),0);
  const labourTotal = (b.labour_hours||0)*(b.labour_rate||0);

  return (
    <div className="min-h-screen bg-zinc-100 text-black p-4 md:p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border">
        {/* Header */}
        <div className="flex justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-black">HAJI AUTO</h1>
            <p className="text-sm text-zinc-500">Cumbernauld, Glasgow - MOT & Service Centre</p>
            <p className="text-sm text-zinc-500">077... | haji.auto@gmail.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-sm">#{ref}</p>
            <p className="text-sm mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full inline-block">{b.status}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
          <div><p className="text-zinc-500">Bill To:</p><p className="font-bold text-base">{b.customer_name}</p><p>{b.phone}</p><p>{b.vehicle_reg} - {b.vehicle_make}</p></div>
          <div className="text-right"><p className="text-zinc-500">Date:</p><p>{new Date(b.created_at).toLocaleDateString('en-GB')}</p><p className="text-zinc-500 mt-2">Payment:</p><p className="font-bold">{b.total_price? `£${b.total_price}` : "TBD"}</p></div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-zinc-50"><th className="text-left p-3">Description</th><th className="text-right p-3">Amount</th></tr></thead>
            <tbody>
              {(b.services||[]).map((s:any,i:number)=><tr key={i} className="border-b"><td className="p-3">{s.name}</td><td className="p-3 text-right">£{parseFloat(s.price).toFixed(2)}</td></tr>)}
              {(b.parts_used||[]).map((s:any,i:number)=><tr key={i} className="border-b"><td className="p-3">{s.name} (Part)</td><td className="p-3 text-right">£{parseFloat(s.price).toFixed(2)}</td></tr>)}
              <tr className="border-b"><td className="p-3">Labour ({b.labour_hours}h × £{b.labour_rate})</td><td className="p-3 text-right">£{labourTotal.toFixed(2)}</td></tr>
              {b.taxi_required && <tr className="border-b"><td className="p-3">Taxi Service</td><td className="p-3 text-right">£{b.taxi_cost}</td></tr>}
            </tbody>
          </table>
          <div className="mt-4 bg-black text-white rounded-xl p-4 flex justify-between text-lg font-black">
            <span>Grand Total</span><span className="text-yellow-400">£{Number(b.total_price||0).toFixed(2)}</span>
          </div>
        </div>

        {b.mechanic_notes && <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm"><p className="font-bold">Mechanic Notes:</p><p>{b.mechanic_notes}</p></div>}

        <div className="mt-8 flex gap-3">
          <button onClick={()=>window.print()} className="flex-1 py-3 bg-black text-white rounded-xl font-bold">Print / Save PDF</button>
          <a href={`https://wa.me/${b.phone}?text=Hi ${b.customer_name}, Your Invoice ${ref} Total £${b.total_price} - https://ai-garage-mubeena754-2079s-projects.vercel.app/invoice/${ref}`} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-center">WhatsApp Customer</a>
        </div>
        <p className="text-center text-xs text-zinc-400 mt-6">Thank you for choosing Haji Auto! 12 Months Warranty on all parts.</p>
      </div>
    </div>
  );
}