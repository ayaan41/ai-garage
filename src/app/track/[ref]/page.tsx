"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function TrackPage({ params }: { params: { ref: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    const { data } = await supabase.from("bookings").select("*").eq("booking_ref", params.ref).single();
    if (data) setBooking(data);
    setLoading(false);
  };
  useEffect(() => { fetchBooking(); }, []);

  const handleApproval = async (approved: boolean) => {
    const newStatus = approved ? "IN_PROGRESS" : "APPROVAL_REJECTED";
    const approval = approved ? "approved" : "rejected";
    await supabase.from("bookings").update({ approval_status: approval, status: newStatus, requires_approval: false }).eq("booking_ref", params.ref);
    await fetch("/api/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: booking.phone, garageName: "haji auto center", booking_ref: params.ref, bookingId: params.ref, newStatus: approved ? `APPROVED - Work Started £${booking.total_price}` : `REJECTED - Customer rejected quote` }) });
    alert(approved ? "✅ Approved! Work will start now." : "❌ Rejected. Garage will contact you.");
    fetchBooking();
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (!booking) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Booking {params.ref} not found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 flex justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold">Track: {booking.booking_ref}</h1>
        <p className="text-zinc-400 text-sm">{booking.car_reg} - {booking.service_type}</p>
        
        <div className="mt-6 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex justify-between mb-2"><span className="text-xs text-zinc-500">Status</span><span className={`text-xs font-bold px-3 py-1 rounded-full ${booking.status === 'CONFIRMED' ? 'bg-yellow-400 text-black' : booking.status === 'IN_PROGRESS' ? 'bg-blue-500' : booking.status === 'READY' ? 'bg-green-500' : 'bg-zinc-700'}`}>{booking.status}</span></div>
          <div className="flex justify-between mb-2"><span className="text-xs text-zinc-500">Car</span><span className="text-sm font-bold">{booking.car_reg} {booking.car_make}</span></div>
          <div className="flex justify-between"><span className="text-xs text-zinc-500">Total Price</span><span className="text-lg font-bold text-yellow-400">£{booking.total_price || 0}</span></div>
          
          {booking.services && booking.services.length > 0 && (
            <div className="mt-4 border-t border-zinc-800 pt-4"><p className="text-xs font-bold mb-2">Services:</p>{booking.services.map((s:any,i:number)=><div key={i} className="flex justify-between text-xs"><span>{s.name} x{s.qty}</span><span>£{s.price * s.qty}</span></div>)}</div>
          )}
          {booking.parts && booking.parts.length > 0 && (
            <div className="mt-2"><p className="text-xs font-bold mb-2">Parts:</p>{booking.parts.map((p:any,i:number)=><div key={i} className="flex justify-between text-xs"><span>{p.name} x{p.qty}</span><span>£{p.price * p.qty}</span></div>)}</div>
          )}
        </div>

        {booking.requires_approval && booking.approval_status === 'pending' && (
          <div className="mt-6 bg-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-6">
            <h2 className="font-bold text-yellow-400">⚠️ Approval Required!</h2>
            <p className="text-sm mt-2">Garage ne extra kaam ka quote bheja hai: <span className="font-bold">£{booking.total_price}</span></p>
            <p className="text-xs text-zinc-400 mt-1">{booking.approval_note || "Extra work found, please approve to start work"}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={()=>handleApproval(true)} className="py-3 bg-green-500 text-black rounded-xl font-bold">✅ Approve & Start Work</button>
              <button onClick={()=>handleApproval(false)} className="py-3 bg-red-500 text-white rounded-xl font-bold">❌ Reject</button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-center">Approve karne pe hi gari ka kaam shuru hoga</p>
          </div>
        )}

        {booking.approval_status === 'approved' && <div className="mt-4 bg-green-500/20 border border-green-500 rounded-xl p-4 text-sm text-green-400">✅ You approved £{booking.total_price} - Work started!</div>}
        {booking.approval_status === 'rejected' && <div className="mt-4 bg-red-500/20 border border-red-500 rounded-xl p-4 text-sm text-red-400">❌ You rejected the quote - Garage will call you</div>}

        <div className="mt-6 bg-zinc-900 rounded-xl p-4">
          <p className="text-xs font-bold mb-2">Invoice Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>window.print()} className="py-3 bg-zinc-800 rounded-xl text-xs font-bold">📄 Print Invoice</button>
            <a href={`https://wa.me/${booking.phone}?text=Invoice for ${booking.booking_ref} - £${booking.total_price}`} className="py-3 bg-green-600 rounded-xl text-xs font-bold text-center">WhatsApp Invoice</a>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button className="py-3 bg-yellow-400 text-black rounded-xl text-xs font-bold">💵 Paid Cash at Shop</button>
            <button className="py-3 bg-blue-600 rounded-xl text-xs font-bold">💳 Pay by Card (Stripe)</button>
          </div>
        </div>

        <p className="text-xs text-zinc-600 text-center mt-6">🔄 Auto updates via SMS • 90% AI Automated • haji auto center</p>
      </div>
    </div>
  );
}
