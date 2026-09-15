"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type ServiceItem = { name: string; price: number };
type PartItem = { name: string; price: number; qty: number };
export default function JobSheetPage() {
  const params = useParams(); const ref = params.ref as string; const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [labourHours, setLabourHours] = useState(1); const [labourRate, setLabourRate] = useState(50);
  const [taxiRequired, setTaxiRequired] = useState(false); const [taxiCost, setTaxiCost] = useState(20);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("booking_ref", ref).single();
      if (data) { setBooking(data); setServices(data.services || []); setParts(data.parts || []); setLabourHours(data.labour_hours || 1); setLabourRate(data.labour_rate || 50); setTaxiRequired(data.taxi_required || false); setTaxiCost(data.taxi_cost || 20); }
      setLoading(false);
    }; fetchData();
  }, [ref]);
  const addService = () => { const name = prompt("Service name?"); const price = prompt("Price £?"); if (name && price) setServices([...services, { name, price: parseFloat(price) }]); };
  const addPart = () => { const name = prompt("Part name?"); const price = prompt("Price £?"); const qty = prompt("Quantity?", "1"); if (name && price) setParts([...parts, { name, price: parseFloat(price), qty: parseInt(qty||"1") }]); };
  const serviceTotal = services.reduce((s, x) => s + x.price, 0); const partsTotal = parts.reduce((s, x) => s + (x.price * x.qty), 0);
  const labourTotal = labourHours * labourRate; const taxiTotal = taxiRequired? taxiCost : 0;
  const subtotal = serviceTotal + partsTotal + labourTotal + taxiTotal; const vat = subtotal * 0.2; const total = subtotal + vat;
  const saveJobSheet = async () => {
    const { error } = await supabase.from("bookings").update({ services, parts, labour_hours: labourHours, labour_rate: labourRate, subtotal, vat, total_price: total, taxi_required: taxiRequired, taxi_cost: taxiTotal }).eq("booking_ref", ref);
    if (error) { alert(error.message); return; }
    await fetch("/api/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: booking.phone, garageName: "haji auto center", bookingId: ref, booking_ref: ref, newStatus: `Invoice Ready - Total £${total.toFixed(2)}` }) });
    alert(`Saved! Total: £${total.toFixed(2)} - Customer SMS sent`); router.push("/garage");
  };
  if (loading) return <div className="min-h-screen bg-black text-white p-10">Loading {ref}...</div>;
  return (
    <div className="min-h-screen bg-black text-white p-6"><div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-zinc-400 text-sm mb-4">← Back</button>
      <h1 className="text-3xl font-bold">Job Sheet - {ref}</h1><p className="text-zinc-400 text-sm">{booking?.customer_name} | {booking?.phone} | {booking?.car_reg}</p>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-4"><h2 className="font-bold">Services</h2><button onClick={addService} className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold">+ Add</button></div>{services.map((s,i)=>(<div key={i} className="flex justify-between py-2 border-b border-zinc-800 text-sm"><span>{s.name}</span><span>£{s.price}</span></div>))}<p className="mt-3 font-bold text-sm">Subtotal: £{serviceTotal.toFixed(2)}</p></div>
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"><div className="flex justify-between mb-4"><h2 className="font-bold">Parts</h2><button onClick={addPart} className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-bold">+ Add Part</button></div>{parts.map((p,i)=>(<div key={i} className="flex justify-between py-2 border-b border-zinc-800 text-sm"><span>{p.name} x{p.qty}</span><span>£{(p.price*p.qty).toFixed(2)}</span></div>))}<p className="mt-3 font-bold text-sm">Subtotal: £{partsTotal.toFixed(2)}</p></div>
      </div>
      <div className="bg-zinc-900 rounded-2xl p-5 mt-6 border border-zinc-800">
        <h2 className="font-bold mb-4">Pricing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="text-xs text-zinc-500">Labour Hours</label><input type="number" value={labourHours} onChange={e=>setLabourHours(parseFloat(e.target.value)||0)} className="w-full mt-1 bg-black border border-zinc-700 rounded-lg px-3 py-2" /></div>
          <div><label className="text-xs text-zinc-500">Rate £/hr</label><input type="number" value={labourRate} onChange={e=>setLabourRate(parseFloat(e.target.value)||0)} className="w-full mt-1 bg-black border border-zinc-700 rounded-lg px-3 py-2" /></div>
          <div className="flex items-center gap-2 mt-6"><input type="checkbox" checked={taxiRequired} onChange={e=>setTaxiRequired(e.target.checked)} /><label className="text-sm">Taxi (£{taxiCost})</label></div>
          {taxiRequired && <div><label className="text-xs text-zinc-500">Taxi Cost</label><input type="number" value={taxiCost} onChange={e=>setTaxiCost(parseFloat(e.target.value)||0)} className="w-full mt-1 bg-black border border-zinc-700 rounded-lg px-3 py-2" /></div>}
        </div>
        <div className="mt-6 bg-black rounded-xl p-4 space-y-2 text-sm"><div className="flex justify-between"><span>Services</span><span>£{serviceTotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Parts</span><span>£{partsTotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Labour</span><span>£{labourTotal.toFixed(2)}</span></div>{taxiRequired && <div className="flex justify-between"><span>Taxi</span><span>£{taxiTotal.toFixed(2)}</span></div>}<div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div><div className="flex justify-between text-zinc-400"><span>VAT 20%</span><span>£{vat.toFixed(2)}</span></div><div className="flex justify-between font-bold text-lg pt-2 border-t border-zinc-700"><span>Total</span><span className="text-yellow-400">£{total.toFixed(2)}</span></div></div>
        <button onClick={saveJobSheet} className="w-full mt-6 py-4 bg-yellow-400 text-black rounded-xl font-bold text-lg">Save & Send to Customer</button>
      </div>
    </div></div>
  );
}
