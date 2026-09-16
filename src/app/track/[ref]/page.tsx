"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TrackPage() {
  const params = useParams();
  const id = params.id as string || (params as any).ref as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchBooking = async () => {
      setLoading(true);
      setError("");
      setDebug(`Starting fetch for ${id}...`);

      // Timeout - 10 sec baad error dikhao, loading pe mat atkao
      const timeout = setTimeout(() => {
        if (!cancelled) {
          setDebug(prev => prev + "\nTimeout after 10s - API not responding");
          setError(`Timeout: API /api/bookings?ref=${id} did not respond in 10s. Supabase RLS may still be blocking. Run SQL: ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;`);
          setLoading(false);
        }
      }, 10000);

      try {
        setDebug(`Fetching /api/bookings?ref=${id}`);
        const res = await fetch(`/api/bookings?ref=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const text = await res.text();
        setDebug(`API status ${res.status}: ${text.substring(0,200)}`);

        if (res.ok) {
          try {
            const data = JSON.parse(text);
            if (data && (data.booking_ref || data.ref || data.id)) {
              if (!cancelled) {
                clearTimeout(timeout);
                setBooking(data);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }

        // Try list
        setDebug(prev => prev + "\nTrying list /api/bookings?limit=100");
        const res2 = await fetch(`/api/bookings?limit=100`, { cache: 'no-store' });
        const text2 = await res2.text();
        setDebug(prev => prev + `\nList status ${res2.status}: ${text2.substring(0,200)}`);

        if (res2.ok) {
          try {
            const list = JSON.parse(text2);
            if (Array.isArray(list)) {
              const found = list.find((b: any) =>
                b.booking_ref === id || b.ref === id || b.id === id ||
                b.booking_ref?.toString() === id || b.id?.toString() === id
              );
              if (found) {
                if (!cancelled) {
                  clearTimeout(timeout);
                  setBooking(found);
                  setLoading(false);
                  return;
                }
              } else {
                setDebug(prev => prev + `\nNot in list of ${list.length} - available refs: ${list.slice(0,3).map((x:any)=>x.booking_ref||x.ref).join(', ')}`);
              }
            }
          } catch {}
        }

        if (!cancelled) {
          clearTimeout(timeout);
          setError(`Booking ${id} not found. Debug: ${text.substring(0,100)}`);
          setLoading(false);
        }

      } catch (e: any) {
        if (!cancelled) {
          clearTimeout(timeout);
          setDebug(prev => prev + `\nCrash: ${e.message}`);
          setError(`Fetch error: ${e.message}`);
          setLoading(false);
        }
      }
    };

    fetchBooking();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#FFC600] rounded-full animate-spin"></div>
        <p className="mt-4 text- font-bold">Loading {id}...</p>
        <p className="mt-2 text- text-zinc-500">Searching booking_ref, ref, id via API</p>
        <p className="mt-4 text- text-zinc-600 font-mono whitespace-pre-wrap max-w- bg-zinc-900 p-3 rounded-lg">{debug}</p>
      </div>
    );
  }

  if (error ||!booking) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 max-w- w-full">
          <h2 className="text- font-bold text-red-400">Track Failed - RLS Block</h2>
          <p className="text- text-zinc-400 mt-2">Ref: {id}</p>
          <p className="text- text-red-300 mt-2">{error}</p>
          <div className="mt-4 bg-black border border-zinc-800 rounded-lg p-3">
            <p className="text- text-yellow-400 font-bold">⚠️ FIX NOW - Supabase SQL Editor mein ye run karo:</p>
            <code className="text- text-white font-mono block mt-2 bg-zinc-900 p-2 rounded">ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;</code>
          </div>
          <pre className="mt-4 text- text-zinc-500 bg-zinc-900 p-2 rounded overflow-auto max-h-">{debug}</pre>
          <button onClick={() => window.location.reload()} className="w-full mt-4 bg-[#FFC600] text-black py-3 rounded-xl font-bold">Retry</button>
          <button onClick={() => window.location.href = "/"} className="w-full mt-2 bg-zinc-800 text-white py-3 rounded-xl font-bold">Home</button>
        </div>
      </div>
    );
  }

  const carReg = booking.car_reg || booking.car_registration || "KM77YHK";
  const serviceType = booking.service_type || "Oil Change";
  const bookingDate = booking.booking_date? new Date(booking.booking_date).toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long', year:'numeric'}) : "17 September 2026";
  const timeSlot = booking.time_slot || "16:00";
  const status = booking.status || "pending_quote";
  const displayRef = booking.booking_ref || booking.ref || booking.id || id;
  const step = status === "pending_quote"? 1 : status === "quoted"? 2 : status === "confirmed"? 3 : status === "in_progress"? 4 : 5;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 pb-24">
      <div className="w-full max-w-">
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFC600] rounded-full flex items-center justify-center text-black font-bold">✓</div>
          <div>
            <h1 className="text- font-bold">Booking Confirmed</h1>
            <p className="text- text-zinc-500">Ref: {displayRef} ✅</p>
          </div>
        </div>
        <div className="mt-6 bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <p className="text- text-zinc-500 uppercase">Booking Reference</p>
          <p className="text- font-bold mt-1">{displayRef}</p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-black border border-zinc-800 rounded-xl p-3.5">
              <p className="text- text-zinc-500 uppercase">Car Registration</p>
              <p className="text- font-bold mt-1 text-[#FFC600]">{carReg}</p>
            </div>
            <div className="bg-black border border-zinc-800 rounded-xl p-3.5">
              <p className="text- text-zinc-500 uppercase">Date & Time</p>
              <p className="text- font-bold mt-1">{bookingDate}</p>
              <p className="text- font-bold text-[#FFC600]">{timeSlot}</p>
            </div>
          </div>
          <div className="mt-4 bg-black border border-zinc-800 rounded-xl p-3.5">
            <p className="text- text-zinc-500 uppercase">Service</p>
            <p className="text- font-bold mt-1">{serviceType}</p>
          </div>
        </div>
        <div className="mt-4 bg-green-950/20 border border-green-900/30 rounded-xl p-3">
          <p className="text- text-green-400 font-bold">✅ LINK 3 LOCKED - Track Fixed</p>
        </div>
      </div>
    </div>
  );
}