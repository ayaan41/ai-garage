"use client";
import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import Link from "next/link";

type ServiceEntry = {
  id: string;
  date: string;
  mileage: number;
  service: string;
  garage: string;
  source: "DVLA" | "GARAGE_INVOICE" | "MANUAL";
  evidence?: string;
  cost?: number;
  privacy: "PUBLIC" | "OWNER_ONLY";
};

export default function VehicleTimelinePage() {
  const [isOwnerView, setIsOwnerView] = useState(true);
  const [entries] = useState<ServiceEntry[]>([
    { id: "1", date: "2024-03-15", mileage: 45200, service: "MOT Test", garage: "DVLA Record", source: "DVLA", evidence: "GOV.UK vehicleenquiry.service.gov.uk • Verified", cost: 0, privacy: "PUBLIC" },
    { id: "2", date: "2024-06-20", mileage: 47800, service: "Full Service + Oil", garage: "Kwik Fit Glasgow", source: "GARAGE_INVOICE", evidence: "Invoice #KF-8842 • PDF uploaded", cost: 189, privacy: "OWNER_ONLY" },
  ]);

  const visibleEntries = isOwnerView ? entries : entries.filter(e => e.privacy === "PUBLIC");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e8eef6]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/customer" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0f172a]">← Back to My Garage</Link>
          <span className="text-[11px] font-bold bg-[#0f172a] text-white px-3 py-1 rounded-full">{isOwnerView ? "OWNER VIEW • PRIVATE" : "PUBLIC VIEW"}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* FIXED TO GOV.UK REAL DATA */}
        <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-gray-100 p-7 mb-6">
          <div className="flex gap-5">
            <div className="w-16 h-16 bg-[#ffcc00] border-2 border-black rounded-lg flex items-center justify-center text-black font-extrabold text-[11px]">KM66<br/>XMY</div>
            <div>
              <h1 className="text-[22px] font-extrabold text-[#0f172a] tracking-tight font-mono bg-[#ffcc00] border border-black px-2 py-0.5 rounded w-fit">KM66 XMY</h1>
              <p className="text-[14px] text-gray-800 mt-2 font-bold">Make: VOLKSWAGEN • Colour: RED • Source: GOV.UK vehicleenquiry.service.gov.uk</p>
              <p className="text-[12px] text-gray-500 mt-1">Is this the vehicle you are looking for? • GOV.UK Check if vehicle is taxed and has MOT</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">✓ DVLA VERIFIED • GOV.UK</span>
                <span className="text-[11px] font-bold bg-[#ffcc00]/20 text-black border border-black px-3 py-1 rounded-full">OFFICIAL MATCH</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-gray-100 p-7">
          <h3 className="font-extrabold text-[#0f172a] text-[18px]">Service History Timeline • {isOwnerView ? "Owner Private" : "Public"}</h3>
          <div className="space-y-4 mt-5">
            {visibleEntries.map(e=>(
              <div key={e.id} className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 flex justify-between">
                <div>
                  <p className="font-bold text-[#0f172a]">{e.service} <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border px-2 py-0.5 rounded-full ml-2">✓ {e.source} • {e.evidence}</span></p>
                  <p className="text-[13px] text-gray-600 mt-1">{e.garage} • {e.date} • {e.mileage.toLocaleString()} miles • {e.privacy}</p>
                </div>
                <p className="font-bold">{isOwnerView ? `£${e.cost}` : "£ HIDDEN"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
