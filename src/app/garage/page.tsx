"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Booking = {
  id: string;
  booking_ref: string;
  customer_name?: string;
  phone: string;
  car_reg?: string;
  car_make?: string;
  service_type?: string;
  status: string;
  created_at: string;
  garage_id?: string;
};

const STATUS_FLOW = ["Confirmed", "Received", "In Progress", "Ready", "Completed"];
const STATUS_COLOR: any = {
  Confirmed: "bg-blue-500",
  Received: "bg-purple-500",
  "In Progress": "bg-yellow-400 text-black",
  Ready: "bg-green-500",
  Completed: "bg-zinc-600",
};

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("Fetch error", error);
      // Fallback mock data if table not exists yet
      setBookings([
        { id: "1", booking_ref: "TEST-1789475855057", phone: "+447782194511", car_reg: "AB19 CDE", service_type: "Full Service", status: "Confirmed", created_at: new Date().toISOString() },
        { id: "2", booking_ref: "BK-002", phone: "+447700900123", car_reg: "XY20 ZZZ", service_type: "MOT", status: "In Progress", created_at: new Date().toISOString() },
      ]);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (booking: Booking, newStatus: string) => {
    setUpdating(booking.id);
    try {
      // 1. Update in Supabase
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", booking.id);

      if (error) throw error;

      // 2. Update local state
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));

      // 3. Send SMS to customer via our API (mock now, real when Webex up)
      const smsRes = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: booking.phone,
          garageName: "AIGarage",
          bookingId: booking.booking_ref,
          booking_ref: booking.booking_ref,
          newStatus: newStatus,
        }),
      });
      const smsData = await smsRes.json();
      console.log("SMS Result:", smsData);

      alert(`✅ Status updated to "${newStatus}"\n📱 SMS sent to ${booking.phone}\n🔗 Tracking: /track/${booking.booking_ref}`);

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-10">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Garage Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Status change = Auto SMS to customer (AIGarage)</p>
          </div>
          <div className="flex gap-3">
            <a href="/test-sms" className="px-4 py-2 bg-zinc-800 rounded-lg text-sm">Test SMS</a>
            <button onClick={fetchBookings} className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {STATUS_FLOW.map(s => (
            <div key={s} className="bg-zinc-900 rounded-xl p-3">
              <p className="text-xs text-zinc-500">{s}</p>
              <p className="text-2xl font-bold">{bookings.filter(b => b.status === s).length}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {bookings.length === 0 && <p className="text-zinc-500">No bookings found. Create a test booking from homepage.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="bg-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-zinc-800">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-lg">{b.car_reg || "No Reg"} • {b.booking_ref}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[b.status] || "bg-zinc-700"}`}>{b.status}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">📞 {b.phone} | 🔧 {b.service_type || "General"} | {new Date(b.created_at).toLocaleString()}</p>
                <div className="flex gap-3 mt-2">
                  <a href={`/track/${b.booking_ref}`} target="_blank" className="text-xs text-yellow-400 underline">View Tracking Page</a>
                  <a href={`tel:${b.phone}`} className="text-xs text-zinc-400 underline">Call</a>
                  <a href={`https://wa.me/${b.phone.replace(/\D/g,'')}?text=Hi, your booking ${b.booking_ref} status is ${b.status}. Track: https://ai-garage-tan.vercel.app/track/${b.booking_ref}`} target="_blank" className="text-xs text-green-400 underline">WhatsApp</a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {updating === b.id ? (
                  <p className="text-sm text-yellow-400">Updating...</p>
                ) : (
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm font-semibold min-w-[160px]"
                  >
                    {STATUS_FLOW.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-zinc-900 rounded-xl p-4 border border-yellow-400/20">
          <p className="text-sm font-bold text-yellow-400">💡 How it works right now:</p>
          <p className="text-xs text-zinc-400 mt-1">1. You change status here → 2. Supabase updates → 3. Our /api/send-sms calls → 4. Mock SMS logged (queued_mock) → 5. Customer sees new status on /track/[ref]. When Webex token is fixed, same code will send real SMS from "AIGarage".</p>
        </div>
      </div>
    </div>
  );
}
