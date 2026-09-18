"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InvoicePremium() {
  const params = useParams();
  const id = params?.id as string || "AG-842901";
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (data) setBooking(data);
      else setBooking({ id, reg: "YK66 OPR", car: "BMW 1 Series • 2016 • 1.5D • 52k mi • BLACK", year: "2016 • 1.5D • 52k mi • BLACK", customer: "Mubeen Ahmad", area: "Haji Auto Center • G20 6 • 0.4 mi • Glasgow", phone: "0909090900", tab: "Ready", price: "49", work: ["Brakes • Oil Change • Brake noise grinding"], detail: "Brake noise grinding at low speed, worse when cold.", parts: "Brake pads - ATE - £42 • Brake disc inspection", supplier: "Euro Car Parts - Tomorrow 10 AM • GSF Backup", parts_cost: "42", parts_ordered_by: "garage" });
    };
    fetchData();
  }, [id]);

  if (!booking) return <div className="min-h-screen bg-white flex items-center justify-center text-zinc-500">Loading invoice...</div>;

  const partsCost = parseInt(booking.parts_cost || "42");
  const labour = parseInt(booking.price || "49");
  const total = partsCost + labour;
  const vat = Math.round(total * 0.2);
  const grandTotal = total + vat;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-black antialiased">
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-20">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center text-white font-black text-[11px]">AG</div><span className="font-bold text-[14px]">AI GARAGE • INVOICE</span><span className="hidden md:block text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 border text-zinc-600">Premium • Vehicle number big decent • QR • Pay at garage</span></div>
          <div className="flex items-center gap-2"><a href="/" className="h-8 px-4 rounded-full bg-zinc-100 border text-[12px] font-semibold">Home</a><a href={`/track/${id}`} className="h-8 px-4 rounded-full bg-white border-2 border-zinc-200 text-[12px] font-semibold">Track →</a><button onClick={()=>window.print()} className="h-8 px-4 rounded-full bg-black text-white text-[12px] font-bold">Print • PDF</button></div>
        </div>
      </header>

      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-8 md:py-10">
        {/* INVOICE HEADER - Vehicle number upar bara waza decent - Premium */}
        <div className="bg-white rounded-[24px] border border-zinc-200 p-8 md:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-[92px] h-[44px] bg-[#FFCC00] border-[1.5px] border-black rounded-[6px] flex items-center justify-center font-black text-[13px] tracking-tight shadow-[1px_1px_0px_0px_#000]">YK66 OPR</div>
                <div><p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Invoice • Pay direct to garage • Page 12 LOCKED</p><h1 className="text-[28px] md:text-[32px] font-black tracking-tight leading-[0.95] mt-1">Invoice {booking.id}</h1></div>
              </div>
              
              <h2 className="text-[20px] md:text-[22px] font-bold leading-tight">{booking.car} • {booking.year}</h2>
              <p className="text-[13px] text-zinc-600 mt-2">{booking.area} • Customer: {booking.customer} • {booking.phone} • Booking {booking.id}</p>
              
              <div className="mt-6 grid md:grid-cols-2 gap-4 text-[12px]">
                <div className="bg-zinc-50 border border-zinc-200 rounded-[14px] p-4"><p className="text-[10px] font-bold uppercase text-zinc-500">Bill to • Customer</p><p className="font-bold mt-2">{booking.customer}<br/>{booking.area.split("•")[0]}<br/>Glasgow • {booking.phone}<br/>Vehicle: {booking.reg} • {booking.car}</p></div>
                <div className="bg-white border-2 border-black rounded-[14px] p-4 shadow-[1px_1px_0px_0px_#000]"><p className="text-[10px] font-bold uppercase text-zinc-500">Bill from • Garage • Price control garage</p><p className="font-bold mt-2">Haji Auto Center<br/>Glasgow G20 • 0.4 mi • 127 jobs • 4.9★<br/>Verified • No upfront • Pay after approval<br/>Price control garage • Labour pricing garage</p></div>
              </div>
            </div>

            <div className="lg:w-[300px] shrink-0 space-y-4">
              <div className="bg-zinc-900 text-white rounded-[18px] p-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Scan to pay • Track • Verify</p>
                <div className="mt-4 w-[180px] h-[180px] bg-white rounded-[14px] mx-auto flex items-center justify-center border-2 border-white">
                  <div className="w-[160px] h-[160px] bg-[repeating-linear-gradient(0deg,#000_0px,#000_4px,transparent_4px,transparent_8px)] opacity-20"></div>
                  <span className="absolute text-[10px] font-black text-black">QR CODE<br/>{booking.id}<br/>{booking.reg}<br/>£{grandTotal}</span>
                </div>
                <p className="text-[11px] text-white/70 mt-3 leading-relaxed">Scan for invoice • Track • Payment • /invoice/{booking.id} • /track/{booking.id}</p>
              </div>
              <div className="bg-[#FFCC00] border-2 border-black rounded-[16px] p-4 shadow-[1.5px_1.5px_0px_0px_#000] text-center"><p className="text-[11px] font-black uppercase">Total due • Pay at garage direct</p><p className="text-[28px] font-black mt-1">£{grandTotal}</p><p className="text-[11px] font-bold">Parts £{partsCost} + Labour £{labour} + VAT £{vat} • No hidden • Page 12 LOCKED</p></div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mt-8 border-t border-zinc-200 pt-8">
            <h3 className="text-[14px] font-bold">Service details • Work performed • Evidence source: garage • Customer approval required</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b-2 border-black text-left"><th className="pb-3 font-bold uppercase text-[11px]">Service / Work</th><th className="pb-3 font-bold uppercase text-[11px]">Detail • Symptoms</th><th className="pb-3 font-bold uppercase text-[11px]">Parts • Supplier • Who Orders</th><th className="pb-3 font-bold uppercase text-[11px] text-right">Amount</th></tr></thead>
                <tbody>
                  <tr className="border-b border-zinc-200"><td className="py-4 font-semibold">Brakes • Oil Change • Brake noise grinding</td><td className="py-4 text-zinc-600 max-w-[280px] leading-relaxed">{booking.detail} • Inspection confirmed • Disc thickness measured • Customer approved</td><td className="py-4"><span className="font-semibold">{booking.parts}</span><br/><span className="text-zinc-500">{booking.supplier} • £{booking.parts_cost} • {booking.parts_ordered_by}</span></td><td className="py-4 text-right font-bold">£{partsCost + labour}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-50 border border-zinc-200 rounded-[14px] p-5">
                <p className="text-[11px] font-bold uppercase text-zinc-500">Pricing breakdown • Page 12 LOCKED • Price control garage</p>
                <div className="mt-4 space-y-2.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-zinc-600">Parts • Brake pads ATE • Brake disc inspection</span><span className="font-bold">£{partsCost}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-600">Labour • Brakes + Oil Change • Garage controls</span><span className="font-bold">£{labour}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-600">Subtotal</span><span className="font-bold">£{total}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-600">VAT 20%</span><span className="font-bold">£{vat}</span></div>
                  <div className="flex justify-between border-t-2 border-black pt-2.5 mt-2.5"><span className="font-black">Grand Total • Pay direct to garage</span><span className="font-black text-[14px]">£{grandTotal}</span></div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed">Rule: Quote = itemised or pre-set service price • Garage controls labour, service pricing, deposit rules • If deposit required, only booking amount via platform • Repair balance direct to garage • No hidden charges • Customer approval required before work beyond quote.</p>
              </div>

              <div className="space-y-3">
                <div className="bg-white border-2 border-black rounded-[14px] p-4 shadow-[1px_1px_0px_0px_#000]"><p className="text-[11px] font-black uppercase">Payment method • Page 12 LOCKED • Auto notify</p><p className="text-[12px] font-semibold mt-2 leading-relaxed">Pay at garage direct • Cash / Card / Bank transfer • No upfront via platform unless deposit for booking • When garage marks Collected → Auto WhatsApp: {booking.reg} collected • Invoice /invoice/{booking.id} • Payment £{grandTotal} confirmed • Feedback request</p></div>
                <div className="bg-black text-white rounded-[14px] p-4"><p className="text-[11px] font-bold uppercase text-white/60">Warranty • Terms • Garage policy</p><p className="text-[11px] leading-relaxed mt-2 text-white/80">Parts warranty 12 months • Labour warranty 6 months • Brake pads wear item • Oil change next due 12k mi / 12 months • MOT due 12 Dec 2026 • Keep invoice for warranty • Garage controls warranty terms</p></div>
                <div className="flex gap-2"><button className="flex-1 h-11 rounded-full bg-black text-white text-[12px] font-bold">Pay £{grandTotal} at Garage • Cash / Card</button><button className="h-11 px-5 rounded-full border-2 border-zinc-200 text-[12px] font-semibold">Feedback ★★★★★</button></div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-200 pt-6 flex flex-col md:flex-row justify-between gap-4 text-[11px] text-zinc-500">
            <p className="leading-relaxed max-w-[600px]">AI Garage • Invoice {booking.id} • {booking.reg} • {booking.car} • Customer {booking.customer} • Garage Haji Auto Center • Glasgow G20 • Booking {booking.id} • Payment direct to garage • Page 12 LOCKED • Price control garage • No hidden sponsored • Customer choice • OS Complete • Full screen premium • Only plates yellow • Vehicle number big decent • QR code • Pay at garage</p>
            <span className="font-bold text-black">Invoice generated • {new Date().toLocaleDateString()} • Valid • No upfront hidden • Pay after approval</span>
          </div>
        </div>
      </div>
    </div>
  );
}
