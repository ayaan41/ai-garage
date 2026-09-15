"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Booking = {
  id: string; booking_ref: string; customer_name?: string; phone: string; car_reg?: string; car_make?: string; service_type?: string; status: string; drop_off_date?: string; drop_off_time?: string; created_at: string; total_price?: number; payment_status?: string;
};
const STATUS_FLOW = ["CONFIRMED", "IN_PROGRESS", "READY", "COMPLETED"];
export default function GarageDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (data) setBookings(data); setLoading(false);
  };
  useEffect(() => { fetchBookings(); }, []);
  const updateStatus = async (booking: Booking, newStatus: string) => {
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id);
    if (error) { alert(error.message); return; }
    setBookings(prev => prev.map(b => b.id === booking.id? {...b, status: newStatus } : b));
    let smsText = "";
    if (newStatus === "IN_PROGRESS") smsText = `Your car ${booking.car_reg} is now IN PROGRESS at haji auto center. Track: https://ai-garage-tan.vercel.app/track/${booking.booking_ref}`;
    if (newStatus === "READY") smsText = `Your car ${booking.car_reg} is READY FOR COLLECTION! Please collect from haji auto center. Ref: ${booking.booking_ref}`;
    if (newStatus === "COMPLETED") smsText = `Thank you! Booking ${booking.booking_ref} Completed. Invoice Total: £${booking.total_price || 0}`;
    const res = await fetch("/api/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: booking.phone, garageName: "haji auto center", bookingId: booking.booking_ref, booking_ref: booking.booking_ref, newStatus, message: smsText }) });
    const data = await res.json();
    alert(`✅ Status: ${newStatus}\n📱 SMS to ${booking.phone}: ${data.sms_message || smsText}\nStatus: ${data.sms_id || 'sent'}`);
  };
  const filtered = filter === "ALL"? bookings : bookings.filter(b => b.status === filter);
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8"><div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl md:text-3xl font-bold">haji auto center</h1><p className="text-zinc-400 text-sm">Owner Panel</p><p className="text-zinc-500 text-xs mt-1">Logged in as mubeena754@gmail.com</p></div><div className="flex gap-2"><button onClick={fetchBookings} className="px-4 py-2 bg-zinc-800 rounded-xl text-sm">Refresh</button><a href="/test-sms" className="px-4 py-2 bg-zinc-800 rounded-xl text-sm">Test SMS</a></div></div>
      <div className="flex gap-2 mb-6 overflow-x-auto">{["ALL",...STATUS_FLOW].map(s => (<button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === s? "bg-yellow-400 text-black" : "bg-zinc-800 text-zinc-400"}`}>{s} {s === "ALL"? `(${bookings.length})` : `(${bookings.filter(b=>b.status===s).length})`}</button>))}</div>
      {loading && <p className="text-zinc-500">Loading bookings...</p>}
      <div className="space-y-4">{filtered.map(b => (
        <div key={b.id} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"><div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div><div className="flex items-center gap-3"><p className="font-bold text-yellow-400 text-lg">{b.booking_ref}</p><span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === "READY"? "bg-green-500" : b.status === "IN_PROGRESS"? "bg-yellow-400 text-black" : b.status === "COMPLETED"? "bg-zinc-600" : "bg-blue-500"}`}>{b.status}</span>{b.total_price && b.total_price > 0 && <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">£{b.total_price.toFixed(2)} {b.payment_status}</span>}</div>
          <p className="text-sm mt-2">Name: <span className="text-zinc-400">{b.customer_name || "ahmadddd"} </span> Phone: <span className="text-zinc-400">{b.phone}</span></p><p className="text-sm">Car Reg: <span className="text-zinc-400">{b.car_reg} ({b.car_make})</span> - <span className="text-zinc-400">{b.service_type}</span></p><p className="text-xs text-zinc-500 mt-1">Drop-off: {b.drop_off_date} at {b.drop_off_time}</p></div>
          <div className="flex flex-col gap-2 min-w-">
            {b.status === "CONFIRMED" && <button onClick={() => updateStatus(b, "IN_PROGRESS")} className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold text-sm">Start Work 🔧</button>}
            {b.status === "IN_PROGRESS" && <button onClick={() => updateStatus(b, "READY")} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm">Mark Ready ✅</button>}
            {b.status === "READY" && <button onClick={() => updateStatus(b, "COMPLETED")} className="w-full py-3 bg-zinc-700 text-white rounded-xl font-bold text-sm">Mark Completed</button>}
            <a href={`/garage/job/${b.booking_ref}`} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-yellow-400/30 rounded-xl font-bold text-sm text-center text-yellow-400">💰 Job Sheet / Price {b.total_price? ` - £${b.total_price.toFixed(2)}` : ""}</a>
            <div className="flex gap-2"><a href={`/track/${b.booking_ref}`} target="_blank" className="flex-1 py-2 bg-black border border-zinc-700 rounded-xl text-center text-xs">View Tracking</a><a href={`tel:${b.phone}`} className="flex-1 py-2 bg-black border border-zinc-700 rounded-xl text-center text-xs">Call</a></div>
            <a href={`https://wa.me/${b.phone.replace(/\D/g,'')}?text=Hi, your booking ${b.booking_ref} is ${b.status}. Track: https://ai-garage-tan.vercel.app/track/${b.booking_ref}`} target="_blank" className="w-full py-2 bg-green-600 rounded-xl text-center text-xs font-bold">WhatsApp Customer</a>
          </div>
        </div></div>
      ))}</div>
      <div className="mt-10 bg-zinc-900 rounded-xl p-4 border border-yellow-400/20"><p className="text-sm font-bold text-yellow-400">💡 New Flow:</p><p className="text-xs text-zinc-400 mt-1">1. Start Work → SMS IN_PROGRESS → 2. Click Job Sheet → Add Services/Parts/Labour/Taxi → Save → Customer gets Invoice SMS → 3. Mark Ready → Customer collects & pays (Cash/Card) on tracking page.</p></div>
    </div></div>
  );
}
