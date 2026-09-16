"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicePage() {
  const { booking_ref } = useParams() as any;
  const [b, setB] = useState<any>(null);

  useEffect(() => {
    supabase.from("bookings").select("*").eq("booking_ref", booking_ref).single().then(({ data }) => setB(data));
  }, [booking_ref]);

  if (!b) return <div className="min-h-screen bg-black text-white p-10">Loading Invoice {booking_ref}...</div>;

  const partsTotal = (b.parts_used || []).reduce((s: number, p: any) => s + (parseFloat(p.price) || 0), 0);
  const labourTotal = (b.labour_hours || 0) * (b.labour_rate || 50);
  const serviceTotal = (b.services || []).reduce((s: number, x: any) => s + (x.price || 0), 0);
  const taxi = b.taxi_required? b.taxi_cost || 0 : 0;
  const grand = b.total_price || (serviceTotal + partsTotal + labourTotal + taxi);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-black p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded- shadow-2xl overflow-hidden">
        <div className="bg-black text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black">HAJI AUTO CENTER</h1>
              <p className="text-zinc-400 text-sm mt-1">Glasgow • MOT • Service • Repairs</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-black text-lg">{b.booking_ref}</p>
              <p className="text-xs text-zinc-400">INVOICE</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">Bill To</p>
              <p className="font-bold mt-1">{b.customer_name}</p>
              <p>{b.phone}</p>
              <p>{b.vehicle_reg || "No Reg"}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs uppercase font-bold">Date</p>
              <p className="font-bold mt-1">{new Date(b.created_at).toLocaleDateString()}</p>
              <p className="text-xs">Status: <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{b.status?.toUpperCase()}</span></p>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-sm border-t pt-6">
            {b.services?.map((s: any, i: number) => (
              <div key={i} className="flex justify-between"><span>{s.name}</span><span>£{s.price}</span></div>
            ))}
            {b.parts_used?.map((p: any, i: number) => (
              <div key={i} className="flex justify-between"><span>Part: {p.name}</span><span>£{p.price}</span></div>
            ))}
            <div className="flex justify-between"><span>Labour ({b.labour_hours}h × £{b.labour_rate})</span><span>£{labourTotal.toFixed(2)}</span></div>
            {b.taxi_required && <div className="flex justify-between"><span>Taxi Service</span><span>£{b.taxi_cost}</span></div>}

            <div className="flex justify-between font-black text-xl border-t-2 border-black pt-4 mt-4">
              <span>GRAND TOTAL</span>
              <span className="text-yellow-500">£{grand.toFixed(2)}</span>
            </div>
          </div>

          {b.mechanic_notes && (
            <div className="mt-6 bg-zinc-50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 font-bold uppercase">Mechanic Notes</p>
              <p className="text-sm mt-1">{b.mechanic_notes}</p>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button onClick={() => window.print()} className="flex-1 py-3 bg-black text-white rounded-xl font-bold">🖨️ Print / Save PDF</button>
            <a href={`https://wa.me/${b.phone?.replace(/\D/g, '')}?text=Invoice ${b.booking_ref} - £${grand.toFixed(2)} - Haji Auto`} className="flex-1 py-3 bg-[#25D366] text-black rounded-xl font-bold text-center">WhatsApp</a>
          </div>

          <p className="text-center text- text-zinc-400 mt-6">Thank you for choosing Haji Auto Center • This is a computer generated invoice</p>
        </div>
      </div>
    </div>
  );
}