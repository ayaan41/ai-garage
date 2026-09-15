"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function HajiBooking() {
  const [carReg, setCarReg] = useState(""); const [phone, setPhone] = useState(""); const [name, setName] = useState(""); const [make, setMake] = useState(""); const [service, setService] = useState("General Service"); const [date, setDate] = useState(""); const [time, setTime] = useState("10:00"); const [loading, setLoading] = useState(false);
  const services = ["General Service", "Oil Change", "MOT", "Brake Pads", "Engine Repair", "Tyres", "Diagnostics", "Full Service"];
  const handleBooking = async () => {
    if (!carReg || !phone || !name) { alert("Car Reg, Name, Phone required!"); return; }
    setLoading(true); const bookingRef = `AG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const { error } = await supabase.from("bookings").insert({ booking_ref: bookingRef, customer_name: name, phone: phone, car_reg: carReg.toUpperCase(), car_make: make, service_type: service, status: "CONFIRMED", drop_off_date: date || new Date().toISOString().split('T')[0], drop_off_time: time, services: [], parts: [], total_price: 0, payment_status: "unpaid" });
    if (error) { alert(error.message); setLoading(false); return; }
    await fetch("/api/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, garageName: "haji auto center", booking_ref: bookingRef, bookingId: bookingRef, newStatus: `CONFIRMED - ${service} for ${carReg}` }) });
    setLoading(false); alert(`✅ Booking Created! Ref: ${bookingRef}`); window.location.href = `/track/${bookingRef}`;
  };
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4"><div className="max-w-md w-full bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
      <h1 className="text-3xl font-bold">haji auto center</h1><p className="text-zinc-400 text-sm">G40 1EU, Glasgow - Direct Booking</p><p className="text-yellow-400 text-xs mt-2">Instant • SMS • Invoice • Cash/Card</p>
      <div className="mt-8 space-y-4">
        <div><label className="text-xs text-zinc-500">Your Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ahmed" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-zinc-500">Car Reg *</label><input value={carReg} onChange={e=>setCarReg(e.target.value)} placeholder="KM88XMY" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm uppercase font-bold" /></div><div><label className="text-xs text-zinc-500">Phone *</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07XXX" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-zinc-500">Car Make</label><input value={make} onChange={e=>setMake(e.target.value)} placeholder="BMW" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div><div><label className="text-xs text-zinc-500">Service</label><select value={service} onChange={e=>setService(e.target.value)} className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm">{services.map(s=><option key={s}>{s}</option>)}</select></div></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-zinc-500">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div><div><label className="text-xs text-zinc-500">Time</label><select value={time} onChange={e=>setTime(e.target.value)} className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm"><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option><option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option></select></div></div>
        <button onClick={handleBooking} disabled={loading} className="w-full mt-2 py-4 bg-yellow-400 text-black rounded-xl font-bold text-lg">{loading? "Booking..." : "Book Now - Get AG-XXXX"}</button>
        <div className="flex gap-2 mt-4"><a href="/garage" className="flex-1 py-3 bg-zinc-800 rounded-xl text-center text-xs font-bold">Garage Login</a><a href="/" className="flex-1 py-3 bg-zinc-800 rounded-xl text-center text-xs font-bold">Home</a></div>
      </div>
    </div></div>
  );
}
