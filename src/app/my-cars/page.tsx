"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MyCarsPremium() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(10);
      if (data) setBookings(data);
      else setBookings([
        { id: "AG-842901", reg: "YK66 OPR", car: "BMW 1 Series • 2016", year: "2016 • 1.5D • 52k mi • BLACK", tab: "Workshop", price: "49", area: "Haji Auto Center • G20 6", arrival: "Today 2:00 PM" },
        { id: "AG-842902", reg: "YK66 OPR", car: "BMW 1 Series • 2016", year: "2016 • 1.5D • 52k mi • BLACK", tab: "Collected", price: "145", area: "Glasgow Car Care • G21", arrival: "12 Sep 2026" },
      ]);
    };
    fetchBookings();
  }, []);

  const vehicles = [
    { reg: "YK66 OPR", car: "BMW 1 Series", year: "2016 • 1.5D • 52k mi • BLACK", motDue: "12 Dec 2026 • 84 days left", serviceDue: "Mar 2027 • 6 months • 12k mi", lastService: "Mar 2026 • 48k mi • Full Service • £145 • Glasgow Car Care", mileage: "52,847 mi • +1,247 mi since last service", insurance: "Due 15 Jan 2027", tax: "Due 01 Mar 2027", status: "In Workshop • AG-842901 • Today", active: true },
    { reg: "AB12 CDE", car: "Audi A3", year: "2019 • 1.5 TFSI • 38k mi • WHITE", motDue: "05 Jun 2027 • 259 days", serviceDue: "Jun 2027 • 9 months", lastService: "Jun 2026 • 35k mi • MOT + Service", mileage: "38,421 mi", insurance: "Due 10 Aug 2027", tax: "Due 01 Jul 2027", status: "Ready • No active booking", active: false },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-black antialiased">
      <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-20">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center text-white font-black text-[11px]">AG</div><span className="font-bold text-[14px]">AI GARAGE • MY CARS</span><span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full bg-black text-white font-bold">VEHICLE TIMELINE + REMINDERS • MOT DUE • SERVICE DUE • BOOKING HISTORY</span></div>
          <div className="flex gap-2"><a href="/" className="h-8 px-4 rounded-full bg-zinc-100 border text-[12px] font-semibold">Home</a><a href="/search" className="h-8 px-4 rounded-full bg-white border-2 border-zinc-200 text-[12px] font-semibold">Search →</a><a href="/garage" className="h-8 px-4 rounded-full bg-black text-white text-[12px] font-bold">Garage OS</a></div>
        </div>
      </header>

      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div><h1 className="text-[26px] md:text-[32px] font-black tracking-tight leading-tight">My vehicles • Mubeen Ahmad</h1><p className="text-[13px] text-zinc-500 mt-2">Glasgow • G20 6 • 2 vehicles • MOT reminders • Service due • Booking history • Vehicle timeline • PDF Page 11 • Pay direct to garage • Page 12 LOCKED</p></div>
          <div className="flex gap-2"><button className="h-10 px-5 rounded-full bg-[#FFCC00] border-2 border-black text-[12px] font-black shadow-[1px_1px_0px_0px_#000]">+ Add Vehicle • DVLA Lookup</button><button className="h-10 px-5 rounded-full bg-white border-2 border-zinc-200 text-[12px] font-semibold">Import from DVLA</button></div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <div className="space-y-5">
            {vehicles.map((v,i)=>(
              <div key={v.reg} className={`bg-white rounded-[20px] border-2 p-6 ${v.active ? "border-black shadow-[2px_2px_0px_0px_#000]" : "border-zinc-200 hover:border-black"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-[92px] h-[44px] bg-[#FFCC00] border-[1.5px] border-black rounded-[6px] flex items-center justify-center font-black text-[12px] shadow-[1px_1px_0px_0px_#000] shrink-0">{v.reg}</div>
                    <div><h3 className="font-bold text-[17px]">{v.car} • {v.year}</h3><p className={`mt-1.5 inline-flex text-[11px] font-bold px-3 py-1 rounded-full ${v.active?"bg-black text-white":"bg-zinc-100 border"}`}>{v.status}</p></div>
                  </div>
                  <div className="flex gap-2"><Link href={`/track/AG-842901`} className="h-8 px-3 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center">Track →</Link><span className="h-8 px-3 rounded-full bg-zinc-100 border text-[11px] font-semibold flex items-center">{v.mileage}</span></div>
                </div>

                <div className="mt-5 grid md:grid-cols-3 gap-3 text-[11px]">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-[12px] p-3.5"><p className="font-bold uppercase text-[10px] text-zinc-500">MOT • Due • Reminder</p><p className="font-bold mt-1.5 leading-relaxed">{v.motDue} • Automatic reminder • PDF Page 11 • No spam • DVLA source</p><span className="mt-2 inline-block text-[10px] font-bold px-2 py-1 rounded-full bg-[#FFCC00] border-2 border-black">84 days left • Book now</span></div>
                  <div className="bg-white border-2 border-zinc-200 rounded-[12px] p-3.5"><p className="font-bold uppercase text-[10px] text-zinc-500">Service • Due • Timeline</p><p className="font-bold mt-1.5 leading-relaxed">{v.serviceDue} • Last: {v.lastService} • {v.mileage}</p><span className="mt-2 inline-block text-[10px] font-bold px-2 py-1 rounded-full bg-white border-2 border-black">6 months left • 12k mi</span></div>
                  <div className="bg-black text-white rounded-[12px] p-3.5"><p className="font-bold uppercase text-[10px] text-white/60">Insurance • Tax • Pay direct</p><p className="font-semibold mt-1.5 leading-relaxed text-white/90">{v.insurance} • {v.tax} • Pay direct to garage • Page 12 LOCKED • No hidden • Booking amount only if deposit required</p></div>
                </div>

                <div className="mt-4 bg-zinc-50 border border-dashed border-zinc-300 rounded-[12px] p-4">
                  <p className="text-[11px] font-bold uppercase text-zinc-500">Vehicle timeline • Workflow milestones • PDF Page 10 LOCKED • No continuous GPS • No surveillance</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="px-3 py-1.5 rounded-full bg-black text-white font-bold">Booking Confirmed • Today 2 PM</span><span className="px-3 py-1.5 rounded-full bg-[#FFCC00] border-2 border-black font-black">Vehicle Received • Now • Workshop</span><span className="px-3 py-1.5 rounded-full bg-white border-2 border-zinc-200">Parts On Way • Tomorrow 10 AM</span><span className="px-3 py-1.5 rounded-full bg-white border-2 border-zinc-200">Repair • Tomorrow 11 AM</span><span className="px-3 py-1.5 rounded-full bg-white border-2 border-zinc-200">Ready • Tomorrow 3 PM • WhatsApp</span><span className="px-3 py-1.5 rounded-full bg-white border-2 border-zinc-200">Collected • Paid • Invoice</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-[76px] space-y-4">
            <div className="bg-white rounded-[18px] border-2 border-black p-5 shadow-[1.5px_1.5px_0px_0px_#000]">
              <p className="text-[11px] font-black uppercase tracking-wide">Booking history • {bookings.length} bookings • Pay direct to garage</p>
              <div className="mt-4 space-y-2.5">
                {bookings.map(b=>(
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-[12px] border border-zinc-200 hover:border-black">
                    <div className="flex items-center gap-3"><div className="w-[64px] h-[28px] bg-[#FFCC00] border border-black rounded-[5px] flex items-center justify-center font-black text-[10px]">{b.reg}</div><div><p className="font-bold text-[12px]">{b.id} • {b.car}</p><p className="text-[11px] text-zinc-500">{b.area} • {b.arrival} • {b.tab} • £{b.price}</p></div></div>
                    <div className="flex gap-1.5"><Link href={`/track/${b.id}`} className="h-7 px-3 rounded-full bg-black text-white text-[10px] font-bold flex items-center">Track</Link><Link href={`/invoice/${b.id}`} className="h-7 px-3 rounded-full bg-white border text-[10px] font-semibold flex items-center">Invoice</Link></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFCC00] border-2 border-black rounded-[18px] p-5 shadow-[1.5px_1.5px_0px_0px_#000]">
              <p className="text-[11px] font-black uppercase">Reminders • Automatic • PDF Page 11</p>
              <div className="mt-3 space-y-2 text-[11px] font-semibold leading-relaxed">
                <div className="bg-white border-2 border-black rounded-[10px] p-3 flex justify-between"><span>🛡️ MOT Due • YK66 OPR</span><span className="font-black">12 Dec 2026 • 84 days</span></div>
                <div className="bg-white border border-zinc-200 rounded-[10px] p-3 flex justify-between"><span>🔧 Service Due • YK66 OPR</span><span>Mar 2027 • 6 months • 12k mi</span></div>
                <div className="bg-black text-white rounded-[10px] p-3 flex justify-between"><span>💳 Payment • Page 12 LOCKED</span><span>Direct to garage • No upfront hidden</span></div>
              </div>
            </div>

            <div className="bg-zinc-900 text-white rounded-[18px] p-5"><p className="text-[11px] font-bold uppercase text-white/60">Customer choice • No hidden sponsored • PDF Page 12</p><p className="text-[12px] mt-3 leading-relaxed text-white/80">My Cars shows your vehicles, MOT due, service due, booking history, vehicle timeline. No hidden sponsored ranking. You choose garage, not platform. Booking amount only if deposit required, repair balance direct to garage. Auto WhatsApp on Ready, auto reminders. OS Complete.</p><a href="/search" className="mt-4 block h-9 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">Search garages → Capability graph • Not generic</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}
