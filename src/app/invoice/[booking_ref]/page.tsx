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
  const [err, setErr] = useState("");

  useEffect(()=>{
    const load = async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
      if(error){ setErr(error.message); return; }
      if(!data){ setErr("Booking not found: " + ref); return; }
      setB(data);
    };
    if(ref) load();
  },[ref]);

  if(err) return (
    <div className="min-h-screen bg-white p-10 text-center">
      <p className="text-red-600 font-bold">Invoice Error: {err}</p>
      <code className="block bg-black text-white p-3 rounded mt-4 text-xs">alter table bookings disable row level security;</code>
      <a href="/garage" className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-xl">Back to Garage</a>
    </div>
  );

  if(!b) return <div className="min-h-screen bg-zinc-100 flex items-center justify-center font-bold">Loading Premium Invoice {ref}...</div>;

  const allItems = [...(b.services||[]).map((x:any)=>({...x, type:'Service'})),...(b.parts_used||[]).map((x:any)=>({...x, type:'Part'}))];
  const labourTotal = Number(b.labour_hours||0)*Number(b.labour_rate||0);
  const taxiTotal = b.taxi_required? Number(b.taxi_cost||0):0;
  const grandTotal = Number(b.total_price||0);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-3 md:p-10">
      <div className="max-w- mx-auto bg-white shadow-2xl rounded- overflow-hidden border border-zinc-200">
        {/* HEADER PREMIUM */}
        <div className="bg-black text-white p-8 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-xl">H</div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">HAJI AUTO</h1>
              <p className="text- tracking-[0.3em] text-zinc-400 -mt-1">GLASGOW • MOT • SERVICE</p>
              <p className="text- text-zinc-500 mt-3">Cumbernauld Road, Glasgow<br/>0141-XXX-XXXX • VAT: GB 123 4567 89</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-black text-xs tracking-widest">{ref}</p>
            <h2 className="text-4xl font-black mt-1">INVOICE</h2>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-green-500 text-black rounded-full text- font-black uppercase">{b.status}</div>
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="grid grid-cols-2 p-8 bg-zinc-50 border-b gap-4 text-sm">
          <div>
            <p className="text- font-black tracking-widest text-zinc-400">BILL TO</p>
            <p className="font-black text-lg mt-1 capitalize">{b.customer_name}</p>
            <p className="text-zinc-600">{b.phone}</p>
            <p className="text-zinc-600">{b.vehicle_reg} • {b.vehicle_make}</p>
          </div>
          <div className="text-right">
            <p className="text- font-black tracking-widest text-zinc-400">DATE & TOTAL</p>
            <p className="mt-1">{new Date(b.created_at).toLocaleDateString('en-GB')}</p>
            <p className="font-black text-xl mt-2">£{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* ITEMS */}
        <div className="p-8">
          <table className="w-full text-sm">
            <thead><tr className="text- font-black tracking-widest text-zinc-400 border-b"><th className="text-left py-3">DESCRIPTION</th><th className="text-center py-3">TYPE</th><th className="text-right py-3">AMOUNT</th></tr></thead>
            <tbody>
              {allItems.map((it:any,i:number)=>(
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-4 font-medium">{it.name}</td>
                  <td className="py-4 text-center"><span className="px-2.5 py-1 bg-zinc-100 rounded-full text- font-bold">{it.type}</span></td>
                  <td className="py-4 text-right font-bold">£{Number(it.price).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-b border-zinc-100">
                <td className="py-4 font-medium">Labour ({b.labour_hours}h × £{b.labour_rate}/hr)</td>
                <td className="py-4 text-center"><span className="px-2.5 py-1 bg-black text-white rounded-full text- font-bold">LABOUR</span></td>
                <td className="py-4 text-right font-bold">£{labourTotal.toFixed(2)}</td>
              </tr>
              {taxiTotal>0 && <tr className="border-b border-zinc-100"><td className="py-4 font-medium">Taxi Service</td><td className="py-4 text-center"><span className="px-2.5 py-1 bg-yellow-400 text-black rounded-full text- font-bold">TAXI</span></td><td className="py-4 text-right font-bold">£{taxiTotal.toFixed(2)}</td></tr>}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-80 bg-zinc-900 text-white rounded-2xl p-5">
              <div className="flex justify-between text-sm text-zinc-400"><span>Subtotal + Labour</span><span className="text-white">£{(allItems.reduce((a:any,c:any)=>a+Number(c.price||0),0)+labourTotal).toFixed(2)}</span></div>
              {taxiTotal>0 && <div className="flex justify-between text-sm text-zinc-400 mt-2"><span>Taxi</span><span className="text-white">£{taxiTotal.toFixed(2)}</span></div>}
              <div className="flex justify-between text-xl font-black border-t border-zinc-800 pt-3 mt-3"><span>TOTAL DUE</span><span className="text-yellow-400">£{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          {b.mechanic_notes && <div className="mt-8 bg-yellow-50 border-2 border-dashed border-yellow-300 p-5 rounded-2xl"><p className="text- font-black tracking-widest text-yellow-700">MECHANIC NOTES</p><p className="mt-2 text-sm font-medium">{b.mechanic_notes}</p></div>}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={()=>window.print()} className="py-4 bg-black text-white rounded-2xl font-black">🖨️ Print / Save PDF</button>
            <a href={`/track/${ref}`} className="py-4 bg-yellow-400 text-black rounded-2xl font-black text-center">📍 Track Job</a>
          </div>
          <p className="text-center text- tracking-[0.2em] text-zinc-400 mt-8">THANK YOU FOR CHOOSING HAJI AUTO • 12 MONTHS WARRANTY</p>
        </div>
      </div>
    </div>
  );
}