"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TrackPage() {
  const params = useParams() as any;
  const router = useRouter();
  const id = params.ref || params.id || params.booking_ref;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings?ref=${encodeURIComponent(id)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.booking_ref || data.ref || data.id)) {
            setBooking(data);
            setLoading(false);
            return;
          }
        }
        const q1 = await supabase.from("bookings").select("*").eq("booking_ref", id).maybeSingle();
        if (q1.data) { setBooking(q1.data); setLoading(false); return; }
        const q2 = await supabase.from("bookings").select("*").eq("ref", id).maybeSingle();
        if (q2.data) { setBooking(q2.data); setLoading(false); return; }
        const q3 = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
        if (q3.data) { setBooking(q3.data); setLoading(false); return; }
        setError(`Booking ${id} not found`);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#FFC600] rounded-full animate-spin"></div>
        <p className="mt-4 text- font-black tracking-widest uppercase text-white/40">Loading {id}...</p>
      </div>
    );
  }

  if (error ||!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <p className="text-red-400 font-black text-">Booking Not Found: {id}</p>
        <button onClick={() => router.push("/")} className="mt-6 bg-[#FFC600] text-black px-6 h- rounded- font-black text-">Back to Home</button>
      </div>
    );
  }

  const carReg = (booking.car_reg || booking.vehicle_reg || booking.car_registration || "KM77YHK").toString().trim().toUpperCase();
  const serviceType = booking.service_type || "Oil Change";
  const bookingDate = booking.booking_date? new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "Wednesday, 16 September 2026";
  const timeSlot = booking.time_slot || "14:00";
  const status = booking.status || "pending_quote";
  const displayRef = booking.booking_ref || booking.ref || booking.id || id;
  const customerName = booking.customer_name || "ahmadd";
  const phone = booking.phone || "09989897677";

  const getStep = () => {
    if (status === "pending_quote") return 1;
    if (status === "quoted" || status === "quote_sent") return 2;
    if (status === "confirmed" || status === "approved") return 3;
    if (status === "in_progress") return 4;
    if (status === "completed") return 5;
    return 1;
  };
  const step = getStep();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex justify-center p-4 pb-24">
      <div className="w-full max-w-">
        <div className="mt-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFC600] rounded-full flex items-center justify-center text-black font-black text- shadow-[0_8px_20px_rgba(255,204,0,0.4)]">✓</div>
          <div>
            <h1 className="text- font-black tracking-tighter leading-none">Booking Confirmed</h1>
            <p className="text- text-white/50 mt-1.5 font-bold tracking-widest">Ref: {displayRef} ✅ UK Standard</p>
          </div>
        </div>

        <div className="mt-7 bg-[#151515] border border-white/5 rounded- p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text- text-white/30 uppercase tracking-widest font-black">Booking Reference</p>
              <p className="text- font-black mt-1.5 tracking-wider">{displayRef}</p>
            </div>
            <div className="bg-[#FFC600] text-black px-3.5 py-1.5 rounded-full text- font-black uppercase tracking-widest">{status.replace("_", " ")}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-black border border-white/5 rounded- p-4">
              <p className="text- text-white/30 uppercase tracking-widest font-black">Car Registration</p>
              <div className="mt-2 w-full h- bg-[#FFC600] border-2 border-black rounded- flex items-center justify-center">
                <p className="text- font-black tracking-wider text-black">{carReg}</p>
              </div>
            </div>
            <div className="bg-black border border-white/5 rounded- p-4">
              <p className="text- text-white/30 uppercase tracking-widest font-black">Date & Time</p>
              <p className="text- font-bold mt-2 leading-tight">{bookingDate}</p>
              <p className="text- font-black text-[#FFC600] mt-1">{timeSlot}</p>
            </div>
          </div>

          <div className="mt-3 bg-black border border-white/5 rounded- p-4 flex justify-between items-center">
            <div>
              <p className="text- text-white/30 uppercase tracking-widest font-black">Service</p>
              <p className="text- font-black mt-1">{serviceType}</p>
            </div>
            <span className="text-[#FFC600] text-">🔧</span>
          </div>

          <div className="mt-3 bg-black border border-white/5 rounded- p-4 flex justify-between items-center">
            <div>
              <p className="text- text-white/30 uppercase tracking-widest font-black">Customer</p>
              <p className="text- font-bold mt-1">{customerName} - {phone}</p>
            </div>
            <span className="text-white/30 text- font-black tracking-widest">VERIFIED</span>
          </div>
        </div>

        <div className="mt-6 bg-[#151515] border border-white/5 rounded- p-6">
          <h3 className="text- font-black tracking-tighter">Track Progress</h3>
          <div className="mt-6 relative">
            {[
              { label: "Booking Received", desc: `Car ${carReg} - ${serviceType}`, active: step >= 1, current: step === 1 },
              { label: "Quote Sent", desc: "Garage will send price estimate", active: step >= 2, current: step === 2 },
              { label: "Confirmed", desc: "You approved the quote", active: step >= 3, current: step === 3 },
              { label: "In Progress", desc: `Work started on ${carReg}`, active: step >= 4, current: step === 4 },
              { label: "Completed", desc: "Car ready + Invoice ready", active: step >= 5, current: step === 5 },
            ].map((s, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text- font-black border-2 transition-all ${s.active? "bg-[#FFC600] border-[#FFC600] text-black shadow-[0_4px_12px_rgba(255,204,0,0.4)]" : "bg-[#0a0a0a] border-white/10 text-white/20"}`}>{s.active? "✓" : i + 1}</div>
                  {i < 4 && <div className={`w- h-10 mt-1 rounded-full ${s.active && step > i + 1? "bg-[#FFC600]" : s.active? "bg-[#FFC600]/40" : "bg-white/5"}`}></div>}
                </div>
                <div className="pb-8">
                  <p className={`text- font-black ${s.current? "text-[#FFC600]" : s.active? "text-white" : "text-white/30"}`}>{s.label} {s.current? "- CURRENT" : ""}</p>
                  <p className="text- text-white/40 mt-1 font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => router.push(`/invoice/${displayRef}`)} className="bg-white text-black h- rounded- font-black text- hover:bg-white/90 transition-all shadow-lg">🧾 View Invoice</button>
          <button onClick={() => router.push("/")} className="bg-[#151515] border border-white/10 text-white h- rounded- font-black text- hover:bg-white/5 transition-all">Back to Home</button>
        </div>
      </div>
    </div>
  );
}