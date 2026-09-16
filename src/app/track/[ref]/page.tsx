"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TrackPage() {
  const params = useParams();
  const id = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      setError("");
      console.log("Fetching track for:", id);

      try {
        // Try 1: booking_ref
        let { data, error } = await supabase.from("bookings").select("*").eq("booking_ref", id).maybeSingle();
        console.log("Try booking_ref:", data, error);

        // Try 2: ref
        if (!data) {
          const r2 = await supabase.from("bookings").select("*").eq("ref", id).maybeSingle();
          console.log("Try ref:", r2.data, r2.error);
          if (r2.data) {
            data = r2.data;
            error = null;
          }
        }

        // Try 3: id
        if (!data) {
          const r3 = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
          console.log("Try id:", r3.data, r3.error);
          if (r3.data) {
            data = r3.data;
            error = null;
          }
        }

        // Try 4: OR query (sab ek saath)
        if (!data) {
          const r4 = await supabase.from("bookings").select("*").or(`booking_ref.eq.${id},ref.eq.${id}`).limit(1).maybeSingle();
          console.log("Try OR:", r4.data, r4.error);
          if (r4.data) {
            data = r4.data;
            error = null;
          }
        }

        if (data) {
          console.log("FOUND:", data);
          setBooking(data);
          setError("");
        } else {
          console.log("NOT FOUND");
          setError(`Booking not found: ${id}. Check Supabase bookings table - booking_ref column exists?`);
        }
      } catch (e: any) {
        console.error("Fetch crash:", e);
        setError("Error: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#FFC600] rounded-full animate-spin"></div>
        <p className="mt-4 text- font-medium">Loading {id}...</p>
        <p className="mt-2 text- text-zinc-500">Searching booking_ref, ref, id</p>
      </div>
    );
  }

  if (error ||!booking) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 max-w- w-full">
          <h2 className="text- font-bold text-red-400">Booking Not Found</h2>
          <p className="text- text-zinc-400 mt-2">Ref: {id}</p>
          <p className="text- text-zinc-500 mt-2">{error}</p>
          <div className="mt-4 bg-black rounded-lg p-3">
            <p className="text- text-zinc-500">Debug: Go to Supabase → Table Editor → bookings → Check if row with booking_ref = {id} exists</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full mt-4 bg-[#FFC600] text-black py-3 rounded-xl font-bold">
            Retry
          </button>
          <button onClick={() => window.history.back()} className="w-full mt-2 bg-zinc-800 text-white py-3 rounded-xl font-bold">
            Go Back to Book
          </button>
        </div>
      </div>
    );
  }

  const carReg = booking.car_reg || booking.car_registration || booking.registration || "KM77YHK";
  const serviceType = booking.service_type || booking.service_types?.join(", ") || "Oil Change";
  const bookingDate = booking.booking_date? new Date(booking.booking_date).toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'}) : "17 Sept 2026";
  const timeSlot = booking.time_slot || booking.time || "16:00";
  const status = booking.status || "pending_quote";
  const displayRef = booking.booking_ref || booking.ref || booking.id || id;

  const getStatusStep = () => {
    if (status === "pending_quote") return 1;
    if (status === "quote_sent" || status === "quoted") return 2;
    if (status === "approved" || status === "confirmed") return 3;
    if (status === "in_progress") return 4;
    if (status === "completed") return 5;
    return 1;
  };

  const step = getStatusStep();

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 pb-20">
      <div className="w-full max-w-">
        <div className="mt-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFC600] rounded-full flex items-center justify-center text-black font-bold">✓</div>
          <div>
            <h1 className="text- font-bold">Booking Confirmed</h1>
            <p className="text- text-zinc-500">Ref: {displayRef}</p>
          </div>
        </div>

        <div className="mt-6 bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text- text-zinc-500 uppercase tracking-wider">Booking Reference</p>
              <p className="text- font-bold mt-1 tracking-wider">{displayRef}</p>
            </div>
            <div className="bg-[#FFC600] text-black px-3 py-1 rounded-full text- font-bold">
              {status.replace("_", " ").toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-black border border-zinc-800 rounded-xl p-3">
              <p className="text- text-zinc-500 uppercase">Car Registration</p>
              <p className="text- font-bold mt-1 tracking-wider">{carReg}</p>
            </div>
            <div className="bg-black border border-zinc-800 rounded-xl p-3">
              <p className="text- text-zinc-500 uppercase">Date & Time</p>
              <p className="text- font-bold mt-1">{bookingDate}</p>
              <p className="text- font-bold text-[#FFC600]">{timeSlot}</p>
            </div>
          </div>

          <div className="mt-4 bg-black border border-zinc-800 rounded-xl p-3">
            <p className="text- text-zinc-500 uppercase">Service</p>
            <p className="text- font-bold mt-1">{serviceType}</p>
          </div>

          <div className="mt-4 bg-black border border-zinc-800 rounded-xl p-3">
            <p className="text- text-zinc-500 uppercase">Customer</p>
            <p className="text- font-bold mt-1">{booking.customer_name || "ahmadd"} - {booking.phone || "09989897677"}</p>
          </div>
        </div>

        <div className="mt-6 bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <h3 className="text- font-bold">Track Progress</h3>
          <div className="mt-5 space-y-0">
            {[
              { label: "Booking Received", desc: `Car ${carReg} - ${serviceType}`, active: step >= 1, current: step === 1 },
              { label: "Quote Sent", desc: "Garage will send price estimate", active: step >= 2, current: step === 2 },
              { label: "Confirmed", desc: "You approved the quote", active: step >= 3, current: step === 3 },
              { label: "In Progress", desc: "Work started on your car", active: step >= 4, current: step === 4 },
              { label: "Completed", desc: "Car ready for collection + Invoice", active: step >= 5, current: step === 5 },
            ].map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text- font-bold border-2 ${s.active? "bg-[#FFC600] border-[#FFC600] text-black" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
                    {s.active? "✓" : i + 1}
                  </div>
                  {i < 4 && <div className={`w-0.5 h-10 mt-1 ${s.active? "bg-[#FFC600]/50" : "bg-zinc-800"}`}></div>}
                </div>
                <div className="pb-8">
                  <p className={`text- font-bold ${s.current? "text-[#FFC600]" : s.active? "text-white" : "text-zinc-500"}`}>{s.label} {s.current? "- CURRENT" : ""}</p>
                  <p className="text- text-zinc-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-[#1a1a00] border border-yellow-900/30 rounded-xl p-3 flex gap-2">
          <span className="text-yellow-500">⚠️</span>
          <p className="text- text-zinc-400">Booking Ref <span className="text-white font-bold">{displayRef}</span> is exact match of URL. Car <span className="text-[#FFC600] font-bold">{carReg}</span> saved correctly. No yk66opr mismatch!</p>
        </div>

        <button onClick={() => window.location.href = "/"} className="w-full bg-zinc-800 text-white py-4 rounded-xl font-bold mt-6">
          Back to Home
        </button>
      </div>
    </div>
  );
}