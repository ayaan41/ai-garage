"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Garage = { id: string; name: string; address: string; rating: number; image_url?: string; is_sponsored?: boolean; };
type PriceTemplate = { garage_name: string; service_name: string; price: number; };
export default function HomePage() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [prices, setPrices] = useState<PriceTemplate[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const { data: garagesData } = await supabase.from("garages").select("*");
      if (garagesData) setGarages(garagesData);
      const { data: priceData } = await supabase.from("garage_price_templates").select("garage_name, service_name, price").order("price");
      if (priceData) setPrices(priceData);
    }; fetchData();
  }, []);
  const getGaragePrices = (garageName: string) => { return prices.filter(p => p.garage_name.toLowerCase() === garageName.toLowerCase()).slice(0, 3); };
  const filtered = garages.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w- mx-auto p-5 md:p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-10 bg-[#ffcc00] rounded-full"></div>
            <h1 className="text- font-black tracking-tighter uppercase">AI Garage <span className="text-[#ffcc00]">Marketplace</span></h1>
          </div>
          <div className="flex gap-2">
            <Link href="/garage" className="px-4 h- bg-[#151515] border border-white/5 rounded- text- font-black tracking-widest uppercase flex items-center hover:bg-white/10 transition-all">Garage Login</Link>
            <Link href="/register/garage" className="px-4 h- bg-[#ffcc00] text-black rounded- text- font-black tracking-widest uppercase flex items-center hover:bg-[#ffd500] shadow-[0_8px_20px_rgba(255,204,0,0.3)] transition-all">+ Register Garage</Link>
          </div>
        </div>

        <div className="mt-12 text-center max-w- mx-auto">
          <p className="inline-flex px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text- font-black tracking-widest uppercase text-white/50">UK Standard 10k • Verified History • AI Powered</p>
          <h2 className="text- md:text- font-black tracking-tighter leading-[0.9] mt-6">Find Trusted Garages<br/>in <span className="text-[#ffcc00]">Glasgow</span></h2>
          <p className="text-white/40 mt-4 text- font-medium tracking-wide">AI Powered • 90% Automated • Real Prices from Garages • Customer Approval • UK 10k Oil Logic</p>
          <div className="mt-8 max-w- mx-auto relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search garage, service, e.g. Haji Auto..." className="w-full h- bg-[#151515] border border-white/10 rounded- pl-12 pr-6 text- font-medium focus:border-[#ffcc00]/30 outline-none transition-all" />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map(g => {
            const gPrices = getGaragePrices(g.name);
            const minPrice = gPrices.length > 0? Math.min(...gPrices.map(p=>p.price)) : null;
            return (
              <div key={g.id} className="group bg-[#151515] rounded- p-6 border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a] transition-all relative overflow-hidden">
                {g.is_sponsored && <span className="absolute top-4 right-4 px-2.5 py-1 bg-[#ffcc00] text-black rounded-full text- font-black tracking-widest uppercase">Sponsored</span>}
                <h3 className="font-black text- tracking-tighter">{g.name}</h3>
                <p className="text- text-white/40 mt-1 font-medium">{g.address} • <span className="text-[#ffcc00]">⭐ {g.rating || "4.9"}</span></p>

                <div className="mt-5 bg-black rounded- p-4 border border-white/5">
                  <p className="text- font-black tracking-widest uppercase text-[#ffcc00]">Real Prices (Garage Set):</p>
                  {gPrices.length > 0? (
                    <div className="mt-3 space-y-2">
                      {gPrices.map((p,i)=><div key={i} className="flex justify-between text-"><span className="text-white/50 font-medium">{p.service_name}</span><span className="font-black">£{p.price}</span></div>)}
                      {minPrice && <p className="text- text-[#00d084] mt-3 font-black tracking-wide">From £{minPrice} - AI Quote</p>}
                    </div>
                  ) : (
                    <p className="text- text-white/20 mt-3 font-medium">Prices not set - Garage will quote after inspection</p>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link href={`/book/${g.id}`} className="h- bg-[#ffcc00] text-black rounded- flex items-center justify-center text- font-black tracking-widest uppercase hover:bg-[#ffd500] transition-all shadow-lg">Book Now</Link>
                  <Link href={`/garage/prices`} className="h- bg-white/5 border border-white/10 rounded- flex items-center justify-center text- font-black tracking-widest uppercase hover:bg-white/10 transition-all">View Prices</Link>
                </div>
                <Link href={`/book/haji-auto-center`} className="mt-3 block text-center text- text-white/30 hover:text-white/60 underline font-medium">Direct: haji auto center - Cumbernauld Road</Link>
              </div>
            );
          })}
          {filtered.length===0 && <div className="col-span-3 bg-[#151515] rounded- p-12 text-center border border-white/5"><p className="text-white/20 font-black tracking-widest uppercase text-">No garages found for "{search}"</p></div>}
        </div>

        <div className="mt-12 bg-[#ffcc00] rounded- p-8 border-2 border-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w- h- bg-black/5 rounded-full blur- -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text- font-black tracking-tighter text-black">🔧 Independent Mobile Mechanics - Ghar Pe Service!</h3>
          <p className="text- text-black/60 mt-2 font-medium">Ghar pe kaam karne wale mechanics bhi register hain. Garage ya Mobile Mechanic? UK 10k verified history ke saath!</p>
          <div className="mt-5 flex gap-3 flex-wrap">
            <Link href="/register/mechanic" className="px-6 h- bg-black text-white rounded- text- font-black tracking-widest uppercase flex items-center hover:bg-[#1a1a1a] transition-all">Register as Mobile Mechanic</Link>
            <Link href="/book/mobile" className="px-6 h- bg-white text-black rounded- text- font-black tracking-widest uppercase flex items-center hover:bg-white/90 transition-all">Book Mobile Mechanic</Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#151515] rounded- p-5 border border-white/5"><p className="font-black text-">🚕 Taxi Service</p><p className="text- text-white/40 mt-1 font-medium">Car drop ke baad taxi auto book - £20 - SMS auto</p></div>
          <div className="bg-[#151515] rounded- p-5 border border-white/5"><p className="font-black text-">🗺 Live Map</p><p className="text- text-white/40 mt-1 font-medium">Garage se ghar tak live tracking - UK standard</p></div>
          <div className="bg-[#151515] rounded- p-5 border border-red-500/20 bg-red-500/[0.03]"><p className="font-black text- text-red-400">🆘 Breakdown SOS</p><p className="text- text-white/40 mt-1 font-medium">Raste mein kharab? Nearest mechanic auto assign</p></div>
        </div>

        <p className="text-center text- font-black tracking-[0.2em] text-white/20 mt-12 uppercase">Haji Auto Center • Glasgow G20 • UK 10k Oil Standard • Verified History • 12 Months Warranty</p>
      </div>
    </div>
  );
}