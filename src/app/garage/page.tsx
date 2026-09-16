"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_FLOW = ["paid", "CONFIRMED", "IN_PROGRESS", "READY", "COMPLETED"];
const NEXT_STATUS: any = {
  paid: "CONFIRMED",
  CONFIRMED: "IN_PROGRESS",
  IN_PROGRESS: "READY",
  READY: "COMPLETED",
};

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (booking: any, newStatus: string) => {
    let smsText = `Hi, your booking ${booking.booking_ref} is now ${newStatus}. Track: https://ai-garage-mubeena754-2079s-projects.vercel.app/track/${booking.booking_ref}`;
    if (newStatus === "COMPLETED") smsText = `Thank you! Booking ${booking.booking_ref} Completed. Invoice Total: £${booking.total_price || 0}. Thanks for choosing Haji Auto Center!`;

    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: booking.phone, message: smsText, booking_ref: booking.booking_ref }),
    });
    const data = await res.json();

    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id);
    if (!error) {
      alert(`✅ Status: ${newStatus}\n SMS to ${booking.phone}: ${data.sms_message || smsText}\nStatus: ${data.sms_id || 'sent'}`);
      fetchBookings();
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">haji auto center</h1>
            <p className="text-zinc-400 text-sm">Garage Dashboard - {bookings.length} total bookings</p>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-bold">{bookings.filter(b=>b.status==='paid').length} NEW PAID</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["ALL", ...STATUS_FLOW].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${filter===s ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-300'}`}>
              {s} ({s==="ALL" ? bookings.length : bookings.filter(b=>b.status===s).length})
            </button>
          ))}
        </div>

        {loading && <p className="text-zinc-500">Loading bookings...</p>}

        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-yellow-400 text-lg">{b.booking_ref}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status==='paid'?'bg-green-500 text-white':'bg-zinc-700'}`}>{b.status}</span>
                  </div>
                  <p className="text-sm mt-2">Name: <span className="text-zinc-400">{b.customer_name || "ahmadddd"}</span> Phone: <span className="text-zinc-400">{b.phone}</span></p>
                  <p className="text-sm text-zinc-400">Amount: £{b.amount ? b.amount/100 : b.total_price || 0} | Car: {b.vehicle_reg || b.car_model || "N/A"}</p>
                </div>

                <div className="flex flex-col gap-2 min-w-">
                  {b.status !== "COMPLETED" && NEXT_STATUS[b.status] && (
                    <button onClick={() => updateStatus(b, NEXT_STATUS[b.status])} className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold">
                      {b.status === "paid" ? "Accept → CONFIRMED" : b.status === "CONFIRMED" ? "Start → IN_PROGRESS" : b.status === "IN_PROGRESS" ? "Ready → READY" : "Complete → COMPLETED"}
                    </button>
                  )}
                  <a href={`/garage/job/${b.booking_ref}`} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-yellow-400/30 rounded-xl text-center font-bold">View Job Card</a>
                  <div className="flex gap-2">
                    <a href={`/track/${b.booking_ref}`} target="_blank" className="flex-1 py-2 bg-black border border-zinc-700 rounded-xl text-center text-sm">Track</a>
                    <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}?text=Hi, your booking ${b.booking_ref} is ${b.status}. Track: https://ai-garage-mubeena754-2079s-projects.vercel.app/track/${b.booking_ref}`} target="_blank" className="flex-1 py-2 bg-green-600 rounded-xl text-center text-sm">WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-zinc-900 rounded-xl p-4 border border-yellow-400/20">
          <p className="text-sm font-bold text-yellow-400">💡 New Flow:</p>
          <p className="text-xs text-zinc-400 mt-1">paid (Stripe) → CONFIRMED → IN_PROGRESS → READY → COMPLETED (SMS auto on each step)</p>
        </div>
      </div>
    </div>
  );
}