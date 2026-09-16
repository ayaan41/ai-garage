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
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      console.log("Fetching booking for ID:", id);

      // Search strategy 1: by ref
      let { data, error: err1 } = await supabase.from("bookings").select("*").eq("ref", id).single();
      if (err1) console.log("Not found by ref:", err1.message);

      // Strategy 2: by booking_ref
      if (!data) {
        const res2 = await supabase.from("bookings").select("*").eq("booking_ref", id).single();
        if (!res2.error) data = res2.data;
        else console.log("Not found by booking_ref:", res2.error.message);
      }

      // Strategy 3: by id (UUID)
      if (!data && id.length > 20) {
        const res3 = await supabase.from("bookings").select("*").eq("id", id).single();
        if (!res3.error) data = res3.data;
      }

      // Strategy 4: ilike search for partial match
      if (!data) {
        const res4 = await supabase.from("bookings").select("*").ilike("booking_ref", `%${id}%`).limit(1).maybeSingle();
        if (res4.data) data = res4.data;
      }

      // Strategy 5: search all and filter client side
      if (!data) {
        const res5 = await supabase.from("bookings").select("*").limit(100);
        if (res5.data) {
          const found = res5.data.find((b: any) =>
            b.ref === id || b.booking_ref === id || b.id === id || b.booking_ref?.includes(id) || b.ref?.includes(id)
          );
          if (found) data = found;
        }
      }

      if (data) {
        console.log("Booking found:", data);
        setBooking(data);
        setError(null);
      } else {
        console.log("Booking not found after all strategies");
        setError(`Booking ${id} not found in database`);
        setBooking(null);
      }
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshCount(c => c + 1);
    }
  };

  useEffect(() => {
    fetchBooking(true);
    // Auto refresh every 5 seconds for live tracking
    intervalRef.current = setInterval(() => fetchBooking(false), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  const steps = [
    { key: "pending_quote", label: "Booking Received", desc: "Your booking is confirmed, garage will check", icon: "📥" },
    { key: "quoted", label: "Quote Sent", desc: "Garage sent you a price quote", icon: "💷" },
    { key: "approved", label: "Quote Approved", desc: "You approved the quote", icon: "✅" },
    { key: "in_progress", label: "Work Started", desc: "Mechanic started working on your car", icon: "🔧" },
    { key: "ready", label: "Ready for Collection", desc: "Car is ready, you can collect", icon: "🚗" },
    { key: "completed", label: "Completed", desc: "Job completed successfully", icon: "🎉" },
  ];

  const getCurrentIndex = () => {
    if (!booking) return -1;
    const status = booking.status || "pending_quote";
    const idx = steps.findIndex(s => s.key === status);
    return idx === -1? 0 : idx;
  };

  const currentIdx = getCurrentIndex();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-[#FFC600] rounded-full animate-spin mb-4"></div>
        <h2 className="text- font-bold">Loading Booking {id}...</h2>
        <p className="text-zinc-500 text-sm mt-2">Please wait, fetching from database</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-4">❌</div>
        <h1 className="text- font-bold">Booking {id} not found</h1>
        <p className="text-zinc-400 text- mt-2 max-w-">Check your reference or contact garage. This happens when booking was not saved in Supabase.</p>
        <p className="text-zinc-600 text- mt-2 font-mono bg-zinc-900 px-3 py-1 rounded-full">Error: {error}</p>
        <p className="text-zinc-600 text- mt-3">Refreshed {refreshCount} times - Last: {new Date().toLocaleTimeString()}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => fetchBooking(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium">Retry Fetch</button>
          <button onClick={() => router.push("/")} className="bg-[#FFC600] hover:bg-[#FFD500] text-black px-6 py-3 rounded-xl font-bold">Go Home</button>
        </div>
        <div className="mt-8 bg-[#121212] border border-zinc-800 rounded-xl p-4 w-full max-w- text-left">
          <p className="text- text-zinc-400 font-bold">Debug Info:</p>
          <p className="text- text-zinc-500 mt-1">Looking for: {id}</p>
          <p className="text- text-zinc-500">URL: /track/{id}</p>
          <p className="text- text-zinc-500">Time: {new Date().toISOString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 pb-20">
      <div className="w-full max-w-">
        <div className="pt-6 pb-2">
          <button onClick={() => router.push("/")} className="text-zinc-500 text-sm mb-3 flex items-center gap-1">‹ Back to Home</button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text- font-bold leading-tight">Tracking {booking.ref || booking.booking_ref || booking.id}</h1>
              <p className="text-zinc-400 text- mt-1.5 leading-relaxed">
                <span className="text-white font-medium">{booking.car_reg || booking.vehicle_reg}</span> • {booking.service_type} <br />
                📅 {booking.booking_date} at {booking.time_slot} • Status: <span className="text-[#FFC600]">{booking.status}</span>
              </p>
            </div>
            <div className="bg-[#FFC600] text-black text- font-bold px-3 py-1.5 rounded-full animate-pulse">LIVE</div>
          </div>
          <p className="text- text-zinc-600 mt-3">Auto refresh: {refreshCount} times • Last update: {new Date().toLocaleTimeString()} • Every 5s</p>
        </div>

        <div className="mt-5 bg-[#121212] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text- font-bold text-zinc-300 mb-5 flex items-center gap-2">📍 Live Timeline - {steps[currentIdx]?.label}</h2>

          <div className="relative">
            {steps.map((s, i) => {
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isFuture = i > currentIdx;

              return (
                <div key={s.key} className="flex gap-4 pb-7 last:pb-0 relative">
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text- font-bold border-2 transition-all
                      ${isCompleted? "bg-[#FFC600] text-black border-[#FFC600]" : ""}
                      ${isCurrent? "bg-[#FFC600] text-black border-[#FFC600] scale-110 shadow-lg shadow-yellow-500/30 animate-pulse" : ""}
                      ${isFuture? "bg-zinc-900 text-zinc-600 border-zinc-800" : ""}
                    `}>
                      {isCompleted? "✓" : s.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w- h-12 mt-2 rounded-full transition-all ${i < currentIdx? "bg-[#FFC600]" : "bg-zinc-800"}`} />
                    )}
                  </div>

                  <div className="flex-1 pt-1.5 pb-1">
                    <div className="flex justify-between items-center">
                      <p className={`font-bold text- ${isCurrent? "text-[#FFC600]" : isCompleted? "text-white" : "text-zinc-500"}`}>
                        {s.label}
                      </p>
                      {isCurrent && <span className="text- bg-[#FFC600] text-black font-bold px-2 py-0.5 rounded-full">CURRENT</span>}
                      {isCompleted && <span className="text- bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">DONE</span>}
                    </div>
                    <p className={`text- mt-1 leading-relaxed ${isCurrent? "text-zinc-300" : "text-zinc-500"}`}>{s.desc}</p>
                    {isCurrent && (
                      <div className="mt-2.5 bg-[#FFC600]/10 border border-[#FFC600]/20 rounded-lg p-2.5">
                        <p className="text- text-[#FFC600]">🔔 You will get SMS update when status changes to next step: {steps[i + 1]?.label || "Completed"}</p>
                      </div>
                    )}
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
            <p className="text- text-zinc-500">Car & Service</p>
            <p className="text- font-bold mt-1">{booking.car_reg}</p>
            <p className="text- text-zinc-400">{booking.service_type}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button onClick={() => router.push(`/invoice/${booking.ref || booking.booking_ref || booking.id}`)} className="w-full bg-white hover:bg-zinc-100 text-black py-4 rounded-xl font-bold text- flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            🧾 View Invoice - {booking.ref || booking.booking_ref}
          </button>
          <button onClick={() => fetchBooking(true)} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-3.5 rounded-xl font-medium text-">🔄 Refresh Status Now ({refreshCount})</button>
          <button onClick={() => router.push("/")} className="w-full bg-transparent text-zinc-500 py-3 rounded-xl font-medium text-">Back to Homepage</button>
        </div>

        <p className="text- text-zinc-600 text-center mt-6 leading-relaxed">
          Booking ID: {booking.id} <br />
          Ref: {booking.ref} | Booking Ref: {booking.booking_ref} | Created: {new Date(booking.created_at).toLocaleString('en-GB')}
        </p>
      </div>
    </div>
  );
}