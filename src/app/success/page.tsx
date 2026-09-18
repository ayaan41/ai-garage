"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [booking, setBooking] = useState<any>(null);

  useEffect(()=>{
    if (id) {
      supabase.from("bookings").select("*").eq("id", id).single().then(({data})=> setBooking(data));
    }
  }, [id]);

  if (!id) return <div className="min-h-screen flex items-center justify-center">No booking ID</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 max-w-[480px] w-full text-center">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mx-auto">✓</div>
        <h1 className="text-[22px] font-bold mt-4">Booked! Garage will quote shortly</h1>
        <p className="text-[13px] text-zinc-600 mt-2">Your car is now live in garage dashboard - NEW TODAY</p>
        
        <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-left">
          <p className="text-[11px] uppercase text-zinc-500 font-medium">Booking ID</p><p className="text-[16px] font-bold font-mono mt-1">{id}</p>
          {booking && <><p className="text-[11px] uppercase text-zinc-500 font-medium mt-3">Car</p><p className="text-[13px] font-medium mt-1">{booking.reg} • {booking.car}</p><p className="text-[11px] uppercase text-zinc-500 font-medium mt-3">Status</p><p className="text-[13px] font-medium mt-1">{booking.tab} • Garage will send quote soon</p></>}
        </div>

        <div className="mt-6 space-y-2">
          <Link href={`/track/${id}`} className="block w-full h-11 rounded-full bg-black text-white text-[13px] font-medium flex items-center justify-center">Track Your Booking → /track/{id}</Link>
          <Link href="/garage" className="block w-full h-11 rounded-full border border-zinc-300 text-[13px] font-medium flex items-center justify-center">View Garage Dashboard (see NEW)</Link>
          <Link href="/book" className="block w-full h-11 rounded-full bg-white border border-zinc-200 text-[13px] font-medium flex items-center justify-center">Book Another Car</Link>
        </div>

        <p className="text-[11px] text-zinc-500 mt-6">Live: Supabase • Garage sees this instantly in NEW TODAY tab • No refresh needed if realtime enabled</p>
      </div>
    </div>
  );
}
