"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TrackPremium() {
  const params = useParams();
  const id = params?.id as string || "AG-842901";
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (data) setBooking(data);
      else setBooking({ id, reg: "YK66 OPR", car: "BMW 1 Series • 2016", year: "1.5D • 52k mi • BLACK", customer: "Mubeen Ahmad", area: "Haji Auto Center • G20 6 • 0.4 mi", tab: "Workshop", price: "49", work: ["Brakes", "Oil Change"], detail: "Brake noise grinding at low speed", parts: "Brake pads ATE £42", supplier: "Euro Car Parts Tomorrow 10 AM", parts_cost: "42" });
    };
    fetchData();
  }, [id]);

  if (!booking) return <div className="min-h-screen bg-white flex items-center justify-center text-zinc-500">Loading tracking...</div>;

  const currentStep = 2; // 0-6
  const steps = [
    { label: "Booking Confirmed", time: "Today 2:00 PM", desc: "Request received • Garage notified", icon: "✓" },
    { label: "Quote Approved", time: "Today 2:15 PM", desc: "£49 approved • Vehicle arrival scheduled", icon: "✓" },
    { label: "Vehicle Received", time: "Today 3:00 PM • Now", desc: "At garage • Inspection started • Parts ordered", icon: "●", active: true },
    { label: "Parts", time: "Tomorrow 10 AM", desc: "Euro Car Parts • Ordered by garage", icon: "○" },
    { label: "Repair", time: "Tomorrow 11 AM", desc: "Brake pads replacement • In progress", icon: "○" },
    { label: "Ready", time: "Tomorrow 3 PM", desc: "Ready for collection • WhatsApp sent • Invoice ready", icon: "○" },
    { label: "Collected", time: "After collection", desc: "Paid direct to garage • Feedback", icon: "○" },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-black antialiased">
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-20">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center text-white font-black text-[11px]">AG</div><span className="font-bold text-[14px] tracking-tight">AI GARAGE</span><span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 border text-zinc-600">Track • Live timeline</span></div>
          <div className="flex items-center gap-2"><a href="/" className="h-8 px-4 rounded-full bg-zinc-100 border text-[12px] font-semibold hover:bg-zinc-200">Home</a><a href="/garage" className="h-8 px-4 rounded-full bg-black text-white text-[12px] font-semibold">Garage OS</a></div>
        </div>
      </header>

      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-8 md:py-10">
        {/* TOP - Premium Header - Plate normal size, not huge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-200">
          <div className="flex items-center gap-5">
            <div className="w-[92px] h-[44px] bg-[#FFCC00] border-[1.5px] border-black rounded-[6px] flex items-center justify-center font-black text-[13px] tracking-tight shadow-[1px_1px_0px_0px_#000]">YK66 OPR</div>
            <div>
              <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight leading-tight">BMW 1 Series • 2016 • 1.5D • 52k mi • BLACK</h1>
              <p className="text-[13px] text-zinc-500 mt-1.5">{booking.area} • Booking {booking.id} • {booking.customer} • £{booking.price} • Pay direct to garage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-9 px-4 rounded-full bg-black text-white text-[12px] font-bold flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>Workshop • Live • Now</span>
            <a href={`/invoice/${booking.id}`} className="h-9 px-4 rounded-full bg-white border-2 border-zinc-200 text-[12px] font-semibold hover:border-black">Invoice →</a>
          </div>
        </div>

        {/* Premium Horizontal Progress - Like Uber / Domino's */}
        <div className="mt-8 bg-white rounded-[20px] border border-zinc-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6"><h2 className="text-[15px] font-bold">Tracking your vehicle</h2><span className="text-[11px] text-zinc-500">No continuous GPS • Workflow milestones only • No surveillance • PDF Page 10 LOCKED</span></div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-[22px] left-[4%] right-[4%] h-[3px] bg-zinc-200 rounded-full"><div className="h-full bg-black rounded-full" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div></div>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-6 md:gap-2">
              {steps.map((s, i) => (
                <div key={i} className="flex md:flex-col items-start md:items-center gap-3 md:gap-2 text-left md:text-center">
                  <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-[13px] font-bold shrink-0 z-10 transition-all ${i < currentStep ? "bg-black border-black text-white" : i === currentStep ? "bg-[#FFCC00] border-black text-black shadow-[1.5px_1.5px_0px_0px_#000] scale-110" : "bg-white border-zinc-300 text-zinc-400"}`}>{s.icon}</div>
                  <div className="md:mt-2"><p className={`text-[12px] font-bold leading-tight ${i === currentStep ? "text-black" : i < currentStep ? "text-black" : "text-zinc-500"}`}>{s.label}</p><p className="text-[11px] text-zinc-500 mt-1">{s.time}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-[14px] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Current status</p><p className="text-[13px] font-semibold mt-2 leading-relaxed">Vehicle received at garage • Inspection started • Brake noise confirmed • Parts ordered: {booking.parts} • {booking.supplier}</p></div>
            <div className="bg-white border border-zinc-200 rounded-[14px] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Parts & supplier • Who orders</p><p className="text-[13px] font-semibold mt-2">{booking.parts} • {booking.supplier} • £{booking.parts_cost} • Ordered by garage • Garage controls pricing</p></div>
            <div className="bg-black text-white rounded-[14px] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Payment • Page 12 LOCKED</p><p className="text-[12px] font-medium mt-2 leading-relaxed text-white/90">Repair balance direct to garage • Only booking amount via platform if deposit required • No upfront hidden • Pay after approval • Invoice /invoice/{booking.id}</p></div>
          </div>
        </div>

        {/* Detailed Timeline - Premium vertical */}
        <div className="mt-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          <div className="bg-white rounded-[20px] border border-zinc-200 p-7 shadow-sm">
            <h3 className="text-[15px] font-bold">Vehicle timeline + reminders • Workshop visibility</h3>
            <p className="text-[12px] text-zinc-500 mt-2 leading-relaxed">Rule: Timeline shows workflow milestones, not continuous location. Booking confirmed → Vehicle received → Inspection / work started → Waiting for approval → Parts on the way → Repair in progress → Quality check → Ready for collection. Continuous GPS is NOT default. No surveillance of vehicle.</p>
            
            <div className="mt-8 space-y-0 relative">
              <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-zinc-200"></div>
              {steps.map((s, i) => (
                <div key={i} className="relative flex gap-4 pb-7 last:pb-0">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[12px] font-bold shrink-0 z-10 ${i < currentStep ? "bg-black border-black text-white" : i === currentStep ? "bg-[#FFCC00] border-black text-black shadow-[1px_1px_0px_0px_#000]" : "bg-white border-zinc-300 text-zinc-400"}`}>{i < currentStep ? "✓" : s.icon}</div>
                  <div className={`flex-1 -mt-1 rounded-[14px] border p-4 ${i === currentStep ? "bg-[#FFCC00]/20 border-black" : i < currentStep ? "bg-zinc-50 border-zinc-200" : "bg-white border-zinc-200"}`}>
                    <div className="flex justify-between items-start gap-3"><p className="font-semibold text-[13px]">{s.label}</p><span className="text-[11px] px-2.5 py-1 rounded-full bg-white border text-zinc-600 shrink-0">{s.time}</span></div>
                    <p className="text-[12px] text-zinc-600 mt-1.5 leading-relaxed">{s.desc}</p>
                    {i === currentStep && <span className="mt-3 inline-flex text-[11px] font-bold px-3 py-1 rounded-full bg-black text-white">● Live • Workshop • Now • Parts readiness: {booking.supplier}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-[76px] space-y-4">
            <div className="bg-white rounded-[18px] border border-zinc-200 p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Customer communication • Reminders</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[12px] border border-zinc-200 p-3.5"><p className="text-[12px] font-bold">📱 Auto WhatsApp on Ready</p><p className="text-[11px] text-zinc-600 mt-1.5 leading-relaxed">When garage marks Ready → You get WhatsApp: YK66 OPR ready for collection! Total £{booking.price}. Invoice /invoice/{booking.id} • Pay at garage.</p></div>
                <div className="rounded-[12px] border border-zinc-200 p-3.5"><p className="text-[12px] font-bold">⏰ Reminders</p><p className="text-[11px] text-zinc-600 mt-1.5">MOT Due 12 Dec 2026 • Service due in 2 months • Automatic • No spam</p></div>
                <div className="rounded-[12px] bg-[#FFCC00] border-2 border-black p-3.5 shadow-[1px_1px_0px_0px_#000]"><p className="text-[12px] font-black">💳 Payment • Page 12 LOCKED</p><p className="text-[11px] font-semibold mt-1.5 leading-relaxed">Repair balance direct to garage • Only booking amount via platform if deposit required • No upfront hidden • Pay after approval</p></div>
              </div>
            </div>

            <div className="bg-zinc-900 text-white rounded-[18px] p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">Live tracking • Clear • No surveillance</p>
              <p className="text-[13px] font-semibold mt-3">Workshop visibility only • Not continuous GPS</p>
              <p className="text-[11px] text-white/70 mt-2 leading-relaxed">Location only when vehicle in transit for collection/delivery if you opt in. Otherwise only workflow milestones: Received → In Progress → Ready.</p>
              <div className="mt-4 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[11px] font-medium">Glasgow G20 • Received → In Progress → Ready</div>
            </div>

            <a href={`/invoice/${id}`} className="block h-11 rounded-full bg-black text-white text-[13px] font-bold flex items-center justify-center hover:bg-zinc-900">View Invoice → Full Screen Premium</a>
          </div>
        </div>

        <div className="mt-10 text-center text-[11px] text-zinc-400">AI Garage • Premium Tracking • Uber / Domino's style • No thick borders • No huge plate cut • Clean • Spacious • Only plates yellow • Workshop visibility • No surveillance • PDF Page 10-11 LOCKED</div>
      </div>
    </div>
  );
}
