"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicePage() {
  const params = useParams() as any;
  const booking_ref = params.booking_ref;
  const [b, setB] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("booking_ref", booking_ref).maybeSingle();
      if (error) setMsg(error.message);
      if (!data) setMsg(`Booking ${booking_ref} not found. Go to /garage to copy correct REF`);
      else setB(data);
    };
    if (booking_ref) load();
  }, [booking_ref]);

  if (msg) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-10 text-center"><div><p className="text-red-400 mb-4">{msg}</p><a href="/garage" className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold">Go to Garage Dashboard</a></div></div>;
  if (!b) return <div className="min-h-screen bg-black text-white p-10">Loading Invoice {booking_ref}...</div>;

  const partsTotal = (b.parts_used || []).reduce((s: number, p: any) => s + (parseFloat(p.price) || 0), 0);
  const labourTotal = (b.labour_hours || 0) * (b.labour_rate || 50);
  const serviceTotal = (b.services || []).reduce((s: number, x: any) => s + (x.price || 0), 0);
  const taxi = b.taxi_required ? b.taxi_cost || 0 : 0;
  const grand = b.total_price || serviceTotal + partsTotal + labourTotal + taxi || 0;

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded- shadow-2xl overflow-hidden border">
        <div className="bg-black text-white p-8 flex justify-between">
          <div><h1 className="text-3xl font-black">HAJI AUTO</h1><p className="text-zinc-400 text-xs mt-1">Glasgow • MOT • Service</p></div>
          <div className="text-right"><p className="text-yellow-400 font-black">{b.booking_ref}</p><p className="text- text-zinc-400">INVOICE</p></div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text- text-zinc-500 font-bold">BILL TO</p><p className="font-bold">{b.customer_name}</p><p>{b.phone}</p><p>{b.vehicle_reg}</p></div>
            <div className="text-right"><p className="text- text-zinc-500 font-bold">DATE</p><p className="font-bold">{new Date(b.created_at).toLocaleDateString()}</p><p className="mt-1 text-xs"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">{b.status}</span></p></div>
          </div>
          <div className="mt-8 border-t pt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span>Services</span><span>£{serviceTotal}</span></div>
            <div className="flex justify-between"><span>Parts</span><span>£{partsTotal}</span></div>
            <div className="flex justify-between"><span>Labour ({b.labour_hours || 0}h × £{b.labour_rate || 0})</span><span>£{labourTotal.toFixed(2)}</span></div>
            {b.taxi_required && <div className="flex justify-between"><span>Taxi</span><span>£{taxi}</span></div>}
            <div className="flex justify-between font-black text-xl border-t-2 border-black pt-4 mt-4"><span>TOTAL</span><span className="text-yellow-500">£{grand.toFixed(2)}</span></div>
          </div>
          {b.mechanic_notes && <div className="mt-6 bg-zinc-50 rounded-xl p-4"><p className="text- text-zinc-500 font-bold">NOTES</p><p className="text-sm mt-1">{b.mechanic_notes}</p></div>}
          <div className="mt-8 flex gap-3">
            <button onClick={() => window.print()} className="flex-1 py-3 bg-black text-white rounded-xl font-bold">🖨️ Print / PDF</button>
            <a href={`https://wa.me/${b.phone?.replace(/\D/g, '')}?text=Invoice ${b.booking_ref} £${grand} - Haji Auto`} className="flex-1 py-3 bg-[#25D366] text-black rounded-xl font-bold text-center">WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}