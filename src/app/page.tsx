"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Garage = { id: string; name: string; address: string; rating: number; image_url?: string; is_sponsored?: boolean; };
type PriceTemplate = { garage_name: string; service_name: string; price: number; };
export default function HomePage() {
  const [garages, setGarages] = useState<Garage[]>([]); const [prices, setPrices] = useState<PriceTemplate[]>([]); const [search, setSearch] = useState("");
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
    <div className="min-h-screen bg-black text-white"><div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">AI Garage <span className="text-yellow-400">Marketplace</span></h1><div className="flex gap-2"><Link href="/garage" className="px-4 py-2 bg-zinc-800 rounded-xl text-xs">Garage Login</Link><Link href="/register/garage" className="px-4 py-2 bg-yellow-400 text-black rounded-xl text-xs font-bold">+ Register Garage / Mechanic</Link></div></div>
      <div className="mt-8 text-center"><h2 className="text-3xl md:text-5xl font-bold">Find Trusted Garages in Glasgow</h2><p className="text-zinc-400 mt-2 text-sm">AI Powered • 90% Automated • Real Prices from Garages • Customer Approval</p><div className="mt-6 max-w-md mx-auto"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search garage, service..." className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 text-sm" /></div></div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">{filtered.map(g => { const gPrices = getGaragePrices(g.name); const minPrice = gPrices.length > 0 ? Math.min(...gPrices.map(p=>p.price)) : null; return (<div key={g.id} className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 relative"><h3 className="font-bold text-lg">{g.name}</h3><p className="text-xs text-zinc-500">{g.address} • ⭐ {g.rating || "4.9"}</p><div className="mt-4 bg-black rounded-xl p-3 border border-zinc-800"><p className="text-xs font-bold text-yellow-400">Real Prices (Garage Set):</p>{gPrices.length > 0 ? (<div className="mt-2 space-y-1">{gPrices.map((p,i)=><div key={i} className="flex justify-between text-xs"><span className="text-zinc-400">{p.service_name}</span><span className="font-bold">£{p.price}</span></div>)}{minPrice && <p className="text-xs text-green-400 mt-2 font-bold">From £{minPrice} - AI Quote</p>}</div>) : (<p className="text-xs text-zinc-600 mt-2">Prices not set - Garage will quote after inspection</p>)}</div><div className="mt-4 grid grid-cols-2 gap-2"><Link href={`/book/${g.id}`} className="py-3 bg-yellow-400 text-black rounded-xl text-center text-xs font-bold">Book Now</Link><Link href={`/garage/prices`} className="py-3 bg-zinc-800 rounded-xl text-center text-xs font-bold">View Prices</Link></div><Link href={`/book/haji-auto-center`} className="mt-2 block text-center text-xs text-zinc-500 underline">Direct: haji auto center</Link></div>); })}</div>
      <div className="mt-16 bg-zinc-900 rounded-3xl p-8 border border-yellow-400/20"><h3 className="text-xl font-bold">🔧 Independent Mobile Mechanics - Ghar Pe Service!</h3><p className="text-sm text-zinc-400 mt-2">Ghar pe kaam karne wale mechanics bhi register hain. Garage ya Mobile Mechanic?</p><div className="mt-4 flex gap-3"><Link href="/register/mechanic" className="px-6 py-3 bg-yellow-400 text-black rounded-xl text-sm font-bold">Register as Mobile Mechanic</Link><Link href="/book/mobile" className="px-6 py-3 bg-zinc-800 rounded-xl text-sm font-bold">Book Mobile Mechanic</Link></div></div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"><p className="font-bold text-sm">🚕 Taxi Service</p><p className="text-xs text-zinc-500 mt-1">Car drop ke baad taxi auto book - £20</p></div><div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"><p className="font-bold text-sm">🗺️ Live Map</p><p className="text-xs text-zinc-500 mt-1">Garage se ghar tak live tracking</p></div><div className="bg-zinc-900 rounded-2xl p-4 border border-red-500/20"><p className="font-bold text-sm text-red-400">🆘 Breakdown SOS</p><p className="text-xs text-zinc-500 mt-1">Raste mein kharab? Nearest mechanic auto assign</p></div></div>
    </div></div>
  );
}
