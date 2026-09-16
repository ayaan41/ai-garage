"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PremiumInvoice(){
  const { ref } = useParams() as any;
  const [b, setB] = useState<any>(null);

  useEffect(()=>{
    supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle().then(({data})=>setB(data));
  },[ref]);

  if(!b) return <div className="min-h-screen bg-zinc-100 flex items-center justify-center">Loading Premium Invoice...</div>;

  const allItems = [...(b.services||[]).map((x:any)=>({...x, type:'Service'})),...(b.parts_used||[]).map((x:any)=>({...x, type:'Part'}))];
  const itemsTotal = allItems.reduce((a:any,c:any)=>a+(Number(c.price)||0),0);
  const labourTotal = Number(b.labour_hours||0)*Number(b.labour_rate||0);
  const taxiTotal = b.taxi_required? Number(b.taxi_cost||0):0;

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-3 md:p-10 font-sans">
      <div className="max-w- mx-auto bg-white shadow-2xl rounded- overflow-hidden border border-zinc-200">
        {/* PREMIUM HEADER */}
        <div className="bg-black text-white p-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-xl">H</div>
              <div><h1 className="text-3xl font-black tracking-tighter">HAJI AUTO</h1><p className="text- tracking-[0.3em] text-zinc-400 -mt-1">GLASGOW • MOT • SERVICE</p></div>
            </div>
            <div className="mt-6 text-xs text-zinc-400 leading-5">Cumbernauld Road, Glasgow G20 6<br/>0141-XXX-XXXX • haji.auto.glasgow@gmail.com<br/>VAT: GB 123 4567 89</div>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-black text-sm tracking-widest">{ref}</p>
            <h2 className="text-4xl font-black mt-1">INVOICE</h2>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-green-500 text-black rounded-full text-xs font-black uppercase">{b.status} • {new Date(b.created_at).toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        {/* BILL TO + VEHICLE */}
        <div className="grid grid-cols-2 p-8 bg-zinc-50 border-b">
          <div><p className="text- font-black tracking-widest text-zinc-400">BILL TO</p><p className="font-black text-lg mt-1 capitalize">{b.customer_name}</p><p className="text-sm text-zinc-600">{b.phone}</p><p className="text-sm text-zinc-600">{b.customer_email||''}</p></div>
          <div className="text-right"><p className="text- font-black tracking-widest text-zinc-400">VEHICLE</p><p className="font-black text-lg mt-1">{b.vehicle_reg || 'No Reg'}</p><p className="text-sm text-zinc-600">{b.vehicle_make} {b.vehicle_model}</p><p className="text-sm text-zinc-600">{b.mileage? `${b.mileage} miles`:''}</p></div>
        </div>

        {/* ITEMS TABLE - FIXED */}
        <div className="p-8">
          <table className="w-full">
            <thead><tr className="text- font-black tracking-widest text-zinc-400 border-b pb-2"><th className="text-left py-3">DESCRIPTION</th><th className="text-center py-3">TYPE</th><th className="text-right py-3">AMOUNT</th></tr></thead>
            <tbody className="text-sm">
              {allItems.map((it:any,i:number)=>(
                <tr key={i} className="border-b border-zinc-100"><td className="py-4 font-medium">{it.name}</td><td className="py-4 text-center"><span className="px-2 py-1 bg-zinc-100 rounded-full text- font-bold">{it.type}</span></td><td className="py-4 text-right font-bold">£{Number(it.price).toFixed(2)}</td></tr>
              ))}
              <tr className="border-b border-zinc-100"><td className="py-4 font-medium">Labour ({b.labour_hours}h × £{b.labour_rate}/hr)</td><td className="py-4 text-center"><span className="px-2 py-1 bg-black text-white rounded-full text- font-bold">LABOUR</span></td><td className="py-4 text-right font-bold">£{labourTotal.toFixed(2)}</td></tr>
              {b.taxi_required && <tr className="border-b border-zinc-100"><td className="py-4 font-medium">Taxi Service</td><td className="py-4 text-center"><span className="px-2 py-1 bg-yellow-400 text-black rounded-full text- font-bold">TAXI</span></td><td className="py-4 text-right font-bold">£{taxiTotal.toFixed(2)}</td></tr>}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end"><div className="w-full md:w-80 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>£{(itemsTotal+labourTotal).toFixed(2)}</span></div>
            {taxiTotal>0 && <div className="flex justify-between text-zinc-500"><span>Taxi</span><span>£{taxiTotal.toFixed(2)}</span></div>}
            <div className="flex justify-between text-xl font-black border-t pt-3"><span>TOTAL DUE</span><span className="text-yellow-500">£{Number(b.total_price).toFixed(2)}</span></div>
          </div></div>

          {b.mechanic_notes && <div className="mt-8 bg-yellow-50 border-2 border-dashed border-yellow-300 p-5 rounded-2xl"><p className="text- font-black tracking-widest text-yellow-700">MECHANIC NOTES</p><p className="mt-2 text-sm font-medium">{b.mechanic_notes}</p></div>}

          <div className="mt-10 grid grid-cols-2 gap-3">
            <button onClick={()=>window.print()} className="py-4 bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2">🖨️ Print / Save PDF</button>
            <a href={`https://wa.me/${b.phone?.replace(/[^0-9]/g,'')}?text=Hi ${b.customer_name}, Your Haji Auto Invoice ${ref} is ready: £${b.total_price} - View: https://ai-garage-mubeena754-2079s-projects.vercel.app/invoice/${ref}`} className="py-4 bg-[#25D366] text-black rounded-2xl font-black flex items-center justify-center gap-2">WhatsApp Customer</a>
          </div>

          <p className="text-center text- tracking-widest text-zinc-400 mt-8">THANK YOU FOR CHOOSING HAJI AUTO • 12 MONTHS WARRANTY ON ALL PARTS & LABOUR • TERMS APPLY</p>
        </div>
      </div>
    </div>
  );
}