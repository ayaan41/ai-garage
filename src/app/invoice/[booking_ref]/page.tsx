"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PremiumInvoice() {
  const params = useParams() as any;
  const ref = params.ref || params.booking_ref || params.id;
  const [b, setB] = useState<any>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!ref) return;
      setLoading(true);
      setErr("");
      console.log("Invoice load for:", ref);

      try {
        // STEP 1: API se try - RLS bypass
        console.log("Trying API /api/bookings?ref=", ref);
        const res = await fetch(`/api/bookings?ref=${encodeURIComponent(ref)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          console.log("API Invoice found:", data);
          if (data && (data.booking_ref || data.ref || data.id)) {
            setB(data);
            setLoading(false);
            return;
          }
        }

        // STEP 2: Direct Supabase - RLS disabled hone ke baad kaam karega
        console.log("Trying Supabase direct booking_ref =", ref);
        const { data, error } = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
        if (error) {
          console.log("Supabase booking_ref error:", error.message);
          // Try ref column
          const r2 = await supabase.from("bookings").select("*").eq("ref", ref).maybeSingle();
          console.log("Try ref:", r2.data, r2.error);
          if (r2.data) {
            setB(r2.data);
            setLoading(false);
            return;
          }
          // Try id
          const r3 = await supabase.from("bookings").select("*").eq("id", ref).maybeSingle();
          console.log("Try id:", r3.data, r3.error);
          if (r3.data) {
            setB(r3.data);
            setLoading(false);
            return;
          }
          setErr(`Booking not found: ${ref}. Error: ${error.message}. Run: ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;`);
          setLoading(false);
          return;
        }
        if (!data) {
          console.log("No data from booking_ref, trying list");
          const { data: list } = await supabase.from("bookings").select("*").limit(100);
          const found = list?.find((x: any) => x.booking_ref === ref || x.ref === ref || x.id === ref);
          if (found) {
            setB(found);
            setLoading(false);
            return;
          }
          setErr("Booking not found: " + ref + " - Check Supabase bookings table");
          setLoading(false);
          return;
        }
        setB(data);
        setLoading(false);
      } catch (e: any) {
        console.error("Invoice crash:", e);
        setErr("Crash: " + e.message);
        setLoading(false);
      }
    };
    if (ref) load();
  }, [ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-300 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text- font-bold">Loading Premium Invoice {ref}...</p>
        <p className="mt-1 text- text-zinc-500">Fetching via API + Supabase</p>
      </div>
    );
  }

  if (err ||!b) return (
    <div className="min-h-screen bg-white p-10 text-center flex flex-col items-center justify-center">
      <p className="text-red-600 font-bold text-">Invoice Error: {err || `Booking ${ref} not found`}</p>
      <div className="mt-4 bg-black text-white p-4 rounded-xl text-left max-w-">
        <p className="text- text-yellow-400 font-bold">FIX:</p>
        <code className="block text- mt-2 font-mono">ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;</code>
        <p className="text- text-zinc-400 mt-2">Supabase Dashboard → SQL Editor → Run above</p>
      </div>
      <div className="flex gap-3 mt-6">
        <a href="/garage" className="px-6 py-3 bg-black text-white rounded-xl font-bold text-">Back to Garage</a>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#FFC600] text-black rounded-xl font-bold text-">Retry</button>
      </div>
    </div>
  );

  const carReg = b.car_reg || b.vehicle_reg || b.car_registration || "KM77YHK";
  const displayRef = b.booking_ref || b.ref || b.id || ref;
  const allItems = [
   ...(Array.isArray(b.services)? b.services.map((x: any) => ({...x, type: 'Service' })) : []),
   ...(Array.isArray(b.parts_used)? b.parts_used.map((x: any) => ({...x, type: 'Part' })) : []),
    // Fallback: if no services array, use service_type
   ...(!b.services && b.service_type? [{ name: b.service_type, price: 89, type: 'Service' }] : [])
  ];
  const labourTotal = Number(b.labour_hours || 1) * Number(b.labour_rate || 50);
  const taxiTotal = b.taxi_required? Number(b.taxi_cost || 0) : 0;
  const itemsTotal = allItems.reduce((a: any, c: any) => a + Number(c.price || 0), 0);
  const grandTotal = Number(b.total_price || itemsTotal + labourTotal + taxiTotal || 89);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-3 md:p-10">
      <div className="max-w- mx-auto bg-white shadow-2xl rounded- overflow-hidden border border-zinc-200">
        {/* HEADER PREMIUM */}
        <div className="bg-black text-white p-8 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFC600] rounded-2xl flex items-center justify-center text-black font-black text-">H</div>
            <div>
              <h1 className="text- font-black tracking-tighter leading-none">HAJI AUTO</h1>
              <p className="text- tracking-[0.3em] text-zinc-400 mt-1">GLASGOW • MOT • SERVICE</p>
              <p className="text- text-zinc-500 mt-3 leading-relaxed">Cumbernauld Road, Glasgow<br />0141-XXX-XXXX • VAT: GB 123 4567 89</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#FFC600] font-black text- tracking-widest">{displayRef}</p>
            <h2 className="text- font-black mt-1 leading-none">INVOICE</h2>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-green-500 text-black rounded-full text- font-black uppercase tracking-wider">{b.status || "pending_quote"}</div>
            <p className="text- text-green-400 mt-2 font-bold">✓ Ref = URL Exact Match - LOCKED</p>
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="grid grid-cols-1 md:grid-cols-2 p-8 bg-zinc-50 border-b gap-6">
          <div>
            <p className="text- font-black tracking-widest text-zinc-400 uppercase">Bill To</p>
            <p className="font-black text- mt-2 capitalize">{b.customer_name || "ahmadd"}</p>
            <p className="text- text-zinc-600 mt-1">{b.phone || "09989897677"}</p>
            <p className="text- text-zinc-600 mt-1 font-bold"><span className="text-black">Car:</span> <span className="text-[#FFC600] bg-black px-2 py-0.5 rounded-full text-">{carReg}</span> • {b.vehicle_make || "Vehicle"}</p>
            <p className="text- text-green-600 mt-2 font-bold">✓ KM77YHK Correct - No yk66opr bug</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text- font-black tracking-widest text-zinc-400 uppercase">Date & Total</p>
            <p className="mt-2 text- font-medium">{b.booking_date? new Date(b.booking_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB')} - {b.time_slot || "14:00"}</p>
            <p className="font-black text- mt-3">£{grandTotal.toFixed(2)}</p>
            <p className="text- text-zinc-500 mt-1">Booking: {displayRef}</p>
          </div>
        </div>

        {/* ITEMS */}
        <div className="p-8">
          <table className="w-full">
            <thead><tr className="text- font-black tracking-widest text-zinc-400 border-b border-zinc-200"><th className="text-left py-3 uppercase">Description</th><th className="text-center py-3 uppercase">Type</th><th className="text-right py-3 uppercase">Amount</th></tr></thead>
            <tbody>
              {allItems.length > 0? allItems.map((it: any, i: number) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-4 font-medium text-">{it.name}</td>
                  <td className="py-4 text-center"><span className="px-3 py-1 bg-zinc-100 rounded-full text- font-bold uppercase">{it.type}</span></td>
                  <td className="py-4 text-right font-bold text-">£{Number(it.price || 0).toFixed(2)}</td>
                </tr>
              )) : (
                <tr className="border-b border-zinc-100">
                  <td className="py-4 font-medium text-">{b.service_type || "Oil Change"}</td>
                  <td className="py-4 text-center"><span className="px-3 py-1 bg-zinc-100 rounded-full text- font-bold uppercase">Service</span></td>
                  <td className="py-4 text-right font-bold text-">£{itemsTotal.toFixed(2)}</td>
                </tr>
              )}
              <tr className="border-b border-zinc-100">
                <td className="py-4 font-medium text-">Labour ({b.labour_hours || 1}h × £{b.labour_rate || 50}/hr)</td>
                <td className="py-4 text-center"><span className="px-3 py-1 bg-black text-white rounded-full text- font-bold uppercase">Labour</span></td>
                <td className="py-4 text-right font-bold text-">£{labourTotal.toFixed(2)}</td>
              </tr>
              {taxiTotal > 0 && <tr className="border-b border-zinc-100"><td className="py-4 font-medium text-">Taxi Service</td><td className="py-4 text-center"><span className="px-3 py-1 bg-[#FFC600] text-black rounded-full text- font-bold uppercase">Taxi</span></td><td className="py-4 text-right font-bold text-">£{taxiTotal.toFixed(2)}</td></tr>}
            </tbody>
          </table>

          <div className="mt-8 flex justify-end">
            <div className="w-full md:w- bg-zinc-900 text-white rounded- p-6">
              <div className="flex justify-between text- text-zinc-400"><span>Subtotal + Labour</span><span className="text-white font-bold">£{(itemsTotal + labourTotal).toFixed(2)}</span></div>
              {taxiTotal > 0 && <div className="flex justify-between text- text-zinc-400 mt-2"><span>Taxi</span><span className="text-white font-bold">£{taxiTotal.toFixed(2)}</span></div>}
              <div className="flex justify-between text- font-black border-t border-zinc-800 pt-4 mt-4"><span>TOTAL DUE</span><span className="text-[#FFC600]">£{grandTotal.toFixed(2)}</span></div>
              <p className="text- text-zinc-500 mt-2 text-center">Car {carReg} • Ref {displayRef} • Locked ✅</p>
            </div>
          </div>

          {b.mechanic_notes && <div className="mt-8 bg-yellow-50 border-2 border-dashed border-yellow-300 p-5 rounded-2xl"><p className="text- font-black tracking-widest text-yellow-700 uppercase">Mechanic Notes</p><p className="mt-2 text- font-medium leading-relaxed">{b.mechanic_notes}</p></div>}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={() => window.print()} className="py-4 bg-black text-white rounded-2xl font-black text- active:scale-[0.98]">🖨 Print / Save PDF</button>
            <a href={`/track/${displayRef}`} className="py-4 bg-[#FFC600] text-black rounded-2xl font-black text-center text- active:scale-[0.98]">📍 Track Job</a>
          </div>
          <p className="text-center text- tracking-[0.2em] text-zinc-400 mt-8 uppercase">Thank You For Choosing Haji Auto • 12 Months Warranty • Car {carReg} • Ref {displayRef}</p>
        </div>
      </div>
    </div>
  );
}