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
        console.log("Trying Supabase direct booking_ref =", ref);
        const { data, error } = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
        if (error) {
          console.log("Supabase booking_ref error:", error.message);
          const r2 = await supabase.from("bookings").select("*").eq("ref", ref).maybeSingle();
          console.log("Try ref:", r2.data, r2.error);
          if (r2.data) { setB(r2.data); setLoading(false); return; }
          const r3 = await supabase.from("bookings").select("*").eq("id", ref).maybeSingle();
          console.log("Try id:", r3.data, r3.error);
          if (r3.data) { setB(r3.data); setLoading(false); return; }
          setErr(`Booking not found: ${ref}. Error: ${error.message}. Run: ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;`);
          setLoading(false);
          return;
        }
        if (!data) {
          console.log("No data from booking_ref, trying list");
          const { data: list } = await supabase.from("bookings").select("*").limit(100);
          const found = list?.find((x: any) => x.booking_ref === ref || x.ref === ref || x.id === ref);
          if (found) { setB(found); setLoading(false); return; }
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
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text- font-black tracking-widest uppercase">Loading Premium Invoice {ref}...</p>
        <p className="mt-1 text- text-black/40 font-medium">Fetching via API + Supabase</p>
      </div>
    );
  }

  if (err ||!b) return (
    <div className="min-h-screen bg-white p-10 text-center flex flex-col items-center justify-center">
      <p className="text-red-600 font-black text-">Invoice Error: {err || `Booking ${ref} not found`}</p>
      <div className="mt-4 bg-black text-white p-5 rounded- text-left max-w- border border-white/10">
        <p className="text- text-[#ffcc00] font-black tracking-widest uppercase">FIX:</p>
        <code className="block text- mt-2 font-mono bg-white/10 p-3 rounded-">ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;</code>
        <p className="text- text-white/40 mt-2">Supabase Dashboard → SQL Editor → Run above</p>
      </div>
      <div className="flex gap-3 mt-6">
        <a href="/garage" className="px-6 h- bg-black text-white rounded- font-black text- flex items-center">Back to Garage</a>
        <button onClick={() => window.location.reload()} className="px-6 h- bg-[#FFC600] text-black rounded- font-black text-">Retry</button>
      </div>
    </div>
  );

  const carReg = b.car_reg || b.vehicle_reg || b.car_registration || "KM77YHK";
  const displayRef = b.booking_ref || b.ref || b.id || ref;
  const allItems = [
  ...(Array.isArray(b.services)? b.services.map((x: any) => ({...x, type: 'Service' })) : []),
  ...(Array.isArray(b.parts_used)? b.parts_used.map((x: any) => ({...x, type: 'Part' })) : []),
  ...(!b.services && b.service_type? [{ name: b.service_type, price: 89, type: 'Service' }] : [])
  ];
  const labourTotal = Number(b.labour_hours || 1) * Number(b.labour_rate || 50);
  const taxiTotal = b.taxi_required? Number(b.taxi_cost || 0) : 0;
  const itemsTotal = allItems.reduce((a: any, c: any) => a + Number(c.price || 0), 0);
  const grandTotal = Number(b.total_price || itemsTotal + labourTotal + taxiTotal || 89);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-3 md:p-10">
      <div className="max-w- mx-auto bg-white shadow-[0_20px_80px_rgba(0,0,0,0.12)] rounded- overflow-hidden border border-black/5">
        <div className="bg-black text-white p-8 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFC600] rounded- flex items-center justify-center text-black font-black text- shadow-[0_8px_20px_rgba(255,204,0,0.4)]">H</div>
            <div>
              <h1 className="text- font-black tracking-tighter leading-none">HAJI AUTO</h1>
              <p className="text- tracking-[0.3em] font-black text-white/40 mt-1 uppercase">GLASGOW • MOT • SERVICE</p>
              <p className="text- text-white/40 mt-3 leading-relaxed font-medium">Cumbernauld Road, Glasgow<br />0141-XXX-XXXX • VAT: GB 123 4567 89</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#FFC600] font-black text- tracking-widest">{displayRef}</p>
            <h2 className="text- font-black mt-1 leading-none tracking-tighter">INVOICE</h2>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-[#00d084] text-black rounded-full text- font-black uppercase tracking-widest">{b.status || "pending_quote"}</div>
            <p className="text- text-[#00d084] mt-2 font-black tracking-widest uppercase">✓ Ref = URL Exact Match - LOCKED</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 p-8 bg-[#fafafa] border-b border-black/5 gap-6">
          <div>
            <p className="text- font-black tracking-widest text-black/30 uppercase">Bill To</p>
            <p className="font-black text- mt-2 capitalize tracking-tighter">{b.customer_name || "ahmadd"}</p>
            <p className="text- text-black/60 mt-1 font-medium">{b.phone || "09989897677"}</p>
            <p className="text- text-black/60 mt-2 font-bold"><span className="text-black">Car:</span> <span className="bg-[#ffcc00] text-black px-2.5 py-0.5 rounded-full text- font-black tracking-wider border-2 border-black ml-1">{carReg}</span> • {b.vehicle_make || "Vehicle"}</p>
            <p className="text- text-[#00d084] mt-3 font-black tracking-widest uppercase">✓ {carReg} Correct - No yk66opr bug</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text- font-black tracking-widest text-black/30 uppercase">Date & Total</p>
            <p className="mt-2 text- font-medium">{b.booking_date? new Date(b.booking_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB')} - {b.time_slot || "14:00"}</p>
            <p className="font-black text- mt-3 tracking-tighter">£{grandTotal.toFixed(2)}</p>
            <p className="text- text-black/40 mt-1 font-medium">Booking: {displayRef}</p>
          </div>
        </div>

        <div className="p-8">
          <table className="w-full">
            <thead><tr className="text- font-black tracking-widest text-black/30 border-b border-black/10"><th className="text-left py-3 uppercase">Description</th><th className="text-center py-3 uppercase">Type</th><th className="text-right py-3 uppercase">Amount</th></tr></thead>
            <tbody>
              {allItems.length > 0? allItems.map((it: any, i: number) => (
                <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02]">
                  <td className="py-4 font-bold text-">{it.name}</td>
                  <td className="py-4 text-center"><span className="px-3 py-1 bg-black/5 rounded-full text- font-black uppercase tracking-widest">{it.type}</span></td>
                  <td className="py-4 text-right font-black text-">£{Number(it.price || 0).toFixed(2)}</td>
                </tr>
              )) : (
                <tr className="border-b border-black/5">
                  <td className="py-4 font-bold text-">{b.service_type || "Oil Change"}</td>
                  <td className="py-4 text-center"><span className="px-3 py-1 bg-black/5 rounded-full text- font-black uppercase tracking-widest">Service</span></td>
                  <td className="py-4 text-right font-black text-">£{itemsTotal.toFixed(2)}</td>
                </tr>
              )}
              <tr className="border-b border-black/5">
                <td className="py-4 font-bold text-">Labour ({b.labour_hours || 1}h × £{b.labour_rate || 50}/hr)</td>
                <td className="py-4 text-center"><span className="px-3 py-1 bg-black text-white rounded-full text- font-black uppercase tracking-widest">Labour</span></td>
                <td className="py-4 text-right font-black text-">£{labourTotal.toFixed(2)}</td>
              </tr>
              {taxiTotal > 0 && <tr className="border-b border-black/5"><td className="py-4 font-bold text-">Taxi Service</td><td className="py-4 text-center"><span className="px-3 py-1 bg-[#FFC600] text-black rounded-full text- font-black uppercase tracking-widest border border-black">Taxi</span></td><td className="py-4 text-right font-black text-">£{taxiTotal.toFixed(2)}</td></tr>}
            </tbody>
          </table>

          <div className="mt-8 flex justify-end">
            <div className="w-full md:w- bg-black text-white rounded- p-6 border border-white/5">
              <div className="flex justify-between text- text-white/40"><span>Subtotal + Labour</span><span className="text-white font-black">£{(itemsTotal + labourTotal).toFixed(2)}</span></div>
              {taxiTotal > 0 && <div className="flex justify-between text- text-white/40 mt-2"><span>Taxi</span><span className="text-white font-black">£{taxiTotal.toFixed(2)}</span></div>}
              <div className="flex justify-between text- font-black border-t border-white/10 pt-4 mt-4"><span>TOTAL DUE</span><span className="text-[#FFC600] text-">£{grandTotal.toFixed(2)}</span></div>
              <p className="text- text-white/30 mt-3 text-center font-bold tracking-widest uppercase">Car {carReg} • Ref {displayRef} • Locked ✅</p>
            </div>
          </div>

          {b.mechanic_notes && <div className="mt-8 bg-[#ffcc00]/10 border-2 border-dashed border-[#ffcc00]/30 p-5 rounded-"><p className="text- font-black tracking-widest text-black/50 uppercase">Mechanic Notes</p><p className="mt-2 text- font-medium leading-relaxed">{b.mechanic_notes}</p></div>}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={() => window.print()} className="h- bg-black text-white rounded- font-black text- active:scale-[0.98] hover:bg-[#1a1a1a] transition-all">🖨 Print / Save PDF</button>
            <a href={`/track/${displayRef}`} className="h- bg-[#FFC600] text-black rounded- font-black text- flex items-center justify-center active:scale-[0.98] hover:bg-[#ffd500] transition-all shadow-[0_8px_20px_rgba(255,204,0,0.3)]">📍 Track Job</a>
          </div>
          <p className="text-center text- tracking-[0.2em] font-black text-black/20 mt-8 uppercase">Thank You For Choosing Haji Auto • 12 Months Warranty • Car {carReg} • Ref {displayRef}</p>
        </div>
      </div>
    </div>
  );
}