"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || "";
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBooking = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      console.log("EXACT SEARCH FOR:", id);

      let found: any = null;

      // EXACT ONLY - no ilike
      const searches = [
        { col: "ref", val: id },
        { col: "booking_ref", val: id },
      ];

      for (let s of searches) {
        const res = await supabase.from("bookings").select("*").eq(s.col, s.val).maybeSingle();
        if (res.data) { found = res.data; console.log("Found by", s.col, ":", found.car_reg); break; }
      }

      if (!found && id.length > 20) {
        const res = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
        if (res.data) found = res.data;
      }

      if (found) {
        setBooking(found);
        setError(null);
        console.log("BOOKING CAR REG:", found.car_reg, found.vehicle_reg);
      } else {
        setError(`Booking ${id} not found`);
        setBooking(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshCount(c => c + 1);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchBooking(true);
    intervalRef.current = setInterval(() => fetchBooking(false), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  const steps = [
    { key: "pending_quote", label: "Booking Received", desc: "Confirmed", icon: "📥" },
    { key: "quoted", label: "Quote Sent", desc: "Price sent", icon: "💷" },
    { key: "approved", label: "Quote Approved", desc: "You approved", icon: "✅" },
    { key: "in_progress", label: "Work Started", desc: "Mechanic working", icon: "🔧" },
    { key: "ready", label: "Ready for Collection", desc: "Ready to collect", icon: "🚗" },
    { key: "completed", label: "Completed", desc: "Done", icon: "🎉" },
  ];

  const getIdx = () => {
    if (!booking) return -1;
    const idx = steps.findIndex(s => s.key === booking.status);
    return idx === -1? 0 : idx;
  };
  const currentIdx = getIdx();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-[#FFC600] rounded-full animate-spin mb-4"></div>
        <h2 className="text- font-bold">Loading {id}...</h2>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-4">❌</div>
        <h1 className="text- font-bold">Booking {id} not found</h1>
        <p className="text-zinc-600 text- mt-2">Error: {error}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => fetchBooking(true)} className="bg-zinc-800 text-white px-6 py-3 rounded-xl">Retry</button>
          <button onClick={() => router.push("/")} className="bg-[#FFC600] text-black px-6 py-3 rounded-xl font-bold">Home</button>
        </div>
      </div>
    );
  }

  const displayCarReg = booking.car_reg || booking.vehicle_reg || booking.registration || booking.car_registration || "No Reg Found";

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 pb-20">
      <div className="w-full max-w-">
        <div className="pt-6">
          <button onClick={() => router.push("/")} className="text-zinc-500 text-sm mb-3">‹ Back to Home</button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text- font-bold">Tracking {booking.ref || booking.booking_ref || booking.id}</h1>
              <p className="text-zinc-400 text- mt-1.5">
                <span className="text-white font-bold text-">{displayCarReg}</span> • {booking.service_type}<br />
                📅 {booking.booking_date} at {booking.time_slot || booking.time} • <span className="text-[#FFC600]">{booking.status}</span>
              </p>
              <p className="text- text-zinc-500 mt-1">Exact Ref Match: {id} = {booking.ref || booking.booking_ref}? {(booking.ref === id || booking.booking_ref === id)? "YES ✅" : "NO ❌"}</p>
            </div>
            <div className="bg-[#FFC600] text-black text- font-bold px-3 py-1.5 rounded-full animate-pulse">LIVE</div>
          </div>
        </div>

        <div className="mt-4 bg-[#121212] border border-zinc-800 rounded-2xl p-4">
          <p className="text- text-zinc-400">Car Number Verified: <span className="text-white font-bold">{displayCarReg}</span> - This is the number you booked</p>
        </div>

        <div className="mt-4 bg-[#121212] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text- font-bold text-zinc-300 mb-5">📍 Live Timeline - {steps[currentIdx]?.label}</h2>
          <div>
            {steps.map((s, i) => {
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isFuture = i > currentIdx;
              return (
                <div key={s.key} className="flex gap-4 pb-7 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text- font-bold border-2 ${isCompleted? "bg-[#FFC600] text-black border-[#FFC600]" : ""} ${isCurrent? "bg-[#FFC600] text-black border-[#FFC600] scale-110 shadow-lg animate-pulse" : ""} ${isFuture? "bg-zinc-900 text-zinc-600 border-zinc-800" : ""}`}>{isCompleted? "✓" : s.icon}</div>
                    {i < steps.length - 1 && <div className={`w- h-12 mt-2 rounded-full ${i < currentIdx? "bg-[#FFC600]" : "bg-zinc-800"}`} />}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div className="flex justify-between items-center">
                      <p className={`font-bold text- ${isCurrent? "text-[#FFC600]" : isCompleted? "text-white" : "text-zinc-500"}`}>{s.label}</p>
                      {isCurrent && <span className="text- bg-[#FFC600] text-black font-bold px-2 py-0.5 rounded-full">CURRENT</span>}
                      {isCompleted && <span className="text- bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">DONE</span>}
                    </div>
                    <p className={`text- mt-1 ${isCurrent? "text-zinc-300" : "text-zinc-500"}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-[#121212] border border-zinc-800 rounded-xl p-4">
            <p className="text- text-zinc-500">Customer</p>
            <p className="text- font-bold mt-1">{booking.customer_name}</p>
            <p className="text- text-zinc-400">{booking.phone}</p>
          </div>
          <div className="bg-[#121212] border border-zinc-800 rounded-xl p-4">
            <p className="text- text-zinc-500">Car Reg (Correct)</p>
            <p className="text- font-bold mt-1 text-[#FFC600]">{displayCarReg}</p>
            <p className="text- text-zinc-400">{booking.service_type}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button onClick={() => router.push(`/invoice/${booking.ref || booking.booking_ref || booking.id}`)} className="w-full bg-white text-black py-4 rounded-xl font-bold text-">🧾 View Invoice - {displayCarReg}</button>
          <button onClick={() => router.push("/")} className="w-full bg-zinc-900 text-white border border-zinc-800 py-3.5 rounded-xl font-medium">Back Home</button>
        </div>

        <p className="text- text-zinc-600 text-center mt-6">ID: {booking.id} | Ref: {booking.ref} | Booking Ref: {booking.booking_ref} | Car: {displayCarReg} | All columns: {Object.keys(booking).join(", ")}</p>
      </div>
    </div>
  );
}