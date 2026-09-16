"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function JobSheetPage() {
  const { ref } = useParams() as any;
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [labourHours, setLabourHours] = useState(0);
  const [labourRate, setLabourRate] = useState(50);
  const [taxiRequired, setTaxiRequired] = useState(false);
  const [taxiCost, setTaxiCost] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("booking_ref", ref).single();
      if (data) {
        setBooking(data);
        setServices(data.services || []);
        setParts(data.parts_used || []);
        setLabourHours(data.labour_hours || 1);
        setLabourRate(data.labour_rate || 50);
        setTaxiRequired(data.taxi_required || false);
        setTaxiCost(data.taxi_cost || 0);
        setNotes(data.mechanic_notes || "");
      }
      setLoading(false);
    };
    load();
  }, [ref]);

  const serviceTotal = services.reduce((s, x) => s + (x.price || 0), 0);
  const partsTotal = parts.reduce((s, x) => s + (x.price || 0), 0);
  const labourTotal = labourHours * labourRate;
  const grandTotal = serviceTotal + partsTotal + labourTotal + (taxiRequired? taxiCost : 0);

  const saveJobSheet = async (sendToCustomer = true) => {
    const payload = {
      services,
      parts_used: parts,
      labour_hours: labourHours,
      labour_rate: labourRate,
      taxi_required: taxiRequired,
      taxi_cost: taxiCost,
      total_price: grandTotal,
      mechanic_notes: notes,
      status: "ready", // auto move to READY when saved
    };

    await supabase.from("bookings").update(payload).eq("booking_ref", ref);

    if (sendToCustomer) {
      // AUTOMATION - SMS + WhatsApp
      const msg = `🔧 Job ${ref} READY! Total: £${grandTotal}. Services: £${serviceTotal}, Parts: £${partsTotal}, Labour: £${labourTotal}${taxiRequired? `, Taxi: £${taxiCost}` : ""}. Invoice: https://ai-garage-mubeena754-2079s-projects.vercel.app/invoice/${ref} - Haji Auto Center`;

      await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: booking.phone, message: msg, booking_ref: ref }),
      });
      alert(`✅ Saved! SMS + Invoice sent to ${booking.customer_name} - £${grandTotal}`);
    } else {
      alert("✅ Job Sheet Saved (Draft)");
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10">Loading {ref}...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="text-zinc-400 text-sm mb-4">← Back</button>
        <h1 className="text-3xl font-bold">Job Sheet - {ref}</h1>
        <p className="text-zinc-400 text-sm">{booking?.customer_name} | {booking?.phone} | {booking?.vehicle_reg || "No Reg"}</p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Services</h2><button onClick={() => setServices([...services, { name: "", price: 0 }])} className="text-yellow-400 text-xs">+ Add</button></div>
            {services.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={s.name} onChange={e => { const n = [...services]; n[i].name = e.target.value; setServices(n); }} placeholder="Service" className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm" />
                <input type="number" value={s.price} onChange={e => { const n = [...services]; n[i].price = parseFloat(e.target.value); setServices(n); }} className="w-20 bg-black border border-zinc-700 rounded p-2 text-sm" />
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex justify-between mb-4"><h2 className="font-bold">Parts</h2><button onClick={() => setParts([...parts, { name: "", price: 0 }])} className="text-yellow-400 text-xs">+ Add</button></div>
            {parts.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={p.name} onChange={e => { const n = [...parts]; n[i].name = e.target.value; setParts(n); }} placeholder="Part" className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm" />
                <input type="number" value={p.price} onChange={e => { const n = [...parts]; n[i].price = parseFloat(e.target.value); setParts(n); }} className="w-20 bg-black border border-zinc-700 rounded p-2 text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-5 mt-6 border border-zinc-800">
          <h2 className="font-bold mb-4">Pricing + Automation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="text-xs text-zinc-500">Labour Hours</label><input type="number" value={labourHours} onChange={e => setLabourHours(parseFloat(e.target.value))} className="w-full mt-1 bg-black border border-zinc-700 rounded p-2" /></div>
            <div><label className="text-xs text-zinc-500">Rate £/hr</label><input type="number" value={labourRate} onChange={e => setLabourRate(parseFloat(e.target.value))} className="w-full mt-1 bg-black border border-zinc-700 rounded p-2" /></div>
            <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={taxiRequired} onChange={e => setTaxiRequired(e.target.checked)} /><label className="text-xs">Taxi Required?</label></div>
            {taxiRequired && <div><label className="text-xs text-zinc-500">Taxi Cost</label><input type="number" value={taxiCost} onChange={e => setTaxiCost(parseFloat(e.target.value))} className="w-full mt-1 bg-black border border-zinc-700 rounded p-2" /></div>}
          </div>

          <div className="mt-6 bg-black rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Services</span><span>£{serviceTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Parts</span><span>£{partsTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Labour ({labourHours}h × £{labourRate})</span><span>£{labourTotal.toFixed(2)}</span></div>
            {taxiRequired && <div className="flex justify-between"><span>Taxi</span><span>£{taxiCost.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-lg border-t border-zinc-800 pt-2"><span>Grand Total</span><span className="text-yellow-400">£{grandTotal.toFixed(2)}</span></div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-zinc-500">Mechanic Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 bg-black border border-zinc-700 rounded p-2 h-20 text-sm" placeholder="Brakes changed, test drive done..." />
          </div>

          <button onClick={() => saveJobSheet(true)} className="w-full mt-6 py-4 bg-yellow-400 text-black rounded-xl font-bold text-lg">Save & Send to Customer (Auto SMS + Invoice)</button>
          <button onClick={() => saveJobSheet(false)} className="w-full mt-3 py-3 bg-zinc-800 rounded-xl text-sm">Save Draft Only</button>
        </div>
      </div>
    </div>
  );
}