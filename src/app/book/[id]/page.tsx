"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function BookGaragePage() {
  const { id } = useParams();
  const router = useRouter();
  const [garage, setGarage] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [carReg, setCarReg] = useState("");
  const [service, setService] = useState("Full Service");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("garages").select("*").eq("id", id).single().then(({data})=>setGarage(data));
  }, [id]);

  const handleBooking = async () => {
    if (!date ||!carReg ||!name ||!phone) { alert("Date, Car Reg, Name, Phone required"); return; }
    setLoading(true);
    const bookingRef = `GLA-${Math.floor(100000 + Math.random()*900000)}-${Math.random().toString(36).substring(2,4).toUpperCase()}`;

    const { data, error } = await supabase.from("bookings").insert({
      booking_ref: bookingRef,
      garage_id: id,
      garage_name: garage?.name,
      service_type: service,
      service: service,
      booking_date: date,
      booking_time: time,
      car_reg: carReg,
      vehicle_reg: carReg,
      customer_name: name,
      customer_phone: phone,
      phone: phone,
      status: "pending_quote", // NO PAYMENT - garage will quote after inspection
      source: "website_calendar",
      total_price: null, // Price nahi - garage quote karega
    }).select().single();

    setLoading(false);
    if (error) { alert(error.message); return; }
    // Track pe bhejo - Domino's style
    router.push(`/track/${bookingRef}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold">Book {garage?.name}</h1>
      <p className="text-gray-400 text-sm mt-1">{garage?.address || "Glasgow, UK"} • Verified • MOT & Service</p>

      <div className="mt-6 bg-[#111] border border-white/10 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm text-gray-400">Select Date (Calendar)</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full mt-1 bg-black border border-white/10 rounded-lg p-3" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="text-sm text-gray-400">Time Slot</label>
          <select value={time} onChange={e=>setTime(e.target.value)} className="w-full mt-1 bg-black border border-white/10 rounded-lg p-3">
            <option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option><option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400">Car Registration</label>
          <input value={carReg} onChange={e=>setCarReg(e.target.value.toUpperCase())} placeholder="AB12 CDE" className="w-full mt-1 bg-black border border-white/10 rounded-lg p-3" />
        </div>
        <div>
          <label className="text-sm text-gray-400">Service Type</label>
          <select value={service} onChange={e=>setService(e.target.value)} className="w-full mt-1 bg-black border border-white/10 rounded-lg p-3">
            <option>Full Service</option><option>MOT</option><option>Brake Check</option><option>Full Diagnostics</option><option>Oil Change</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="bg-black border border-white/10 rounded-lg p-3" />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="bg-black border border-white/10 rounded-lg p-3" />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
          <p className="text-yellow-400 font-semibold">No Upfront Payment</p>
          <p className="text-gray-400">Garage will inspect & quote. You pay after approval. Price not set - Garage will quote after inspection.</p>
        </div>

        <button onClick={handleBooking} disabled={loading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 disabled:opacity-50">
          {loading? "Booking..." : "Confirm Booking - Get Ref (Free)"}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">Ya call karo - AI 24/7 book karega</p>
          <p className="text-sm font-bold text-yellow-400 mt-1">📞 AI Call Booking: {garage?.phone || "Auto"} → Same calendar system</p>
        </div>
      </div>
    </div>
  );
}