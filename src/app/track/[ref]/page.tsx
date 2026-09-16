"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      // 3 jagah search karo: ref, booking_ref, id
      let { data } = await supabase.from("bookings").select("*").eq("ref", id).single();
      if (!data) { const r = await supabase.from("bookings").select("*").eq("booking_ref", id).single(); data = r.data; }
      if (!data) { const r = await supabase.from("bookings").select("*").eq("id", id).single(); data = r.data; }
      if (!data) { // agar id UUID nahi hai toh ilike search
        const r = await supabase.from("bookings").select("*").ilike("booking_ref", `%${id}%`).limit(1).single(); data = r.data;
      }
      setBooking(data || null);
      setLoading(false);
    };
    fetchBooking();
    const iv = setInterval(fetchBooking, 5000);
    return () => clearInterval(iv);
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading {id}...</div>;
  if (!booking) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Booking {id} not found</h1>
      <p className="text-zinc-400 text-sm">Check Supabase - booking not saved yet</p>
      <button onClick={() => router.push("/")} className="bg-[#FFC600] text-black px-6 py-3 rounded-xl font-bold">Go Home</button>
    </div>
  );

  const steps = [
    { key: "pending_quote", label: "Booking Received" },
    { key: "quoted", label: "Quote Sent" },
    { key: "in_progress", label: "Work Started" },
    { key: "ready", label: "Ready for Collection" },
    { key: "completed", label: "Completed" },
  ];
  const currentIdx = steps.findIndex(s => s.key === booking.status);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w- pt-6">
        <h1 className="text- font-bold">Tracking {booking.ref || booking.booking_ref || booking.id}</h1>
        <p className="text-zinc-400 text-sm mt-1">{booking.car_reg} • {booking.service_type} • {booking.booking_date} at {booking.time_slot}</p>
        <div className="mt-6 bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          {steps.map((s, i) => (
            <div key={s.key} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${i <= currentIdx? "bg-[#FFC600] text-black" : "bg-zinc-800 text-zinc-500"}`}>{i < currentIdx? "✓" : i + 1}</div>
                {i < steps.length - 1 && <div className={`w- h-10 mt-2 ${i < currentIdx? "bg-[#FFC600]" : "bg-zinc-800"}`} />}
              </div>
              <div className="pt-1">
                <p className={`font-medium ${i === currentIdx? "text-[#FFC600]" : i < currentIdx? "text-white" : "text-zinc-500"}`}>{s.label} {i === currentIdx && "- CURRENT"}</p>
                <p className="text- text-zinc-500">{i === currentIdx? "Live tracking - auto refresh every 5s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => router.push(`/invoice/${booking.ref || booking.booking_ref || booking.id}`)} className="w-full mt-4 bg-white text-black py-3.5 rounded-xl font-bold">View Invoice</button>
      </div>
    </div>
  );
}