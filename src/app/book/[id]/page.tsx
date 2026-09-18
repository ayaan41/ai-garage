"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const GARAGES: any = {
  "1": { name: "Glasgow Auto Centre", address: "145 Maryhill Rd, G20 7", rating: 4.9, distance: "0.4 mi", price: 165 },
  "2": { name: "Northside Motors", address: "22 Queen Margaret Dr", rating: 4.8, distance: "0.7 mi", price: 149 },
  "3": { name: "Kelvinbridge Garage", address: "8 Otago St", rating: 4.7, distance: "1.1 mi", price: 175 },
};

export default function BookIdProPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params as any)?.id || "1";
  const garage = GARAGES[id] || GARAGES["2"];

  const [selectedServices] = useState(["Full Service"]);
  const [extraNotes, setExtraNotes] = useState("Brake noise - grinding at low speed, started 2 days ago");
  const [customJob] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!name || !phone) { alert("Please enter name and phone"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); router.push("/success?garage=" + id); }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/book" className="text-[13px] font-medium text-gray-700 hover:text-black flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-black">←</span> Back to garages
          </Link>
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-[10px]">AG</div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-4">
            <div className="bg-black text-white rounded-2xl p-4 flex justify-between border-2 border-black">
              <div>
                <p className="font-bold text-[14px] text-white">{garage.name}</p>
                <p className="text-[11px] text-white/60 mt-1">{garage.address} • {garage.distance} • ⭐ {garage.rating}</p>
                <p className="text-[11px] text-[#FFCC00] mt-1 font-medium">⚙️ AI Match: 96% • Best for your brake issue</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[20px] text-white">£{garage.price}</p>
                <p className="text-[10px] text-white/50">Est. 2.5 hrs</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-[13px] text-black flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">1</span> Your booking summary
              </h3>
              <div className="mt-3 flex gap-2.5">
                <div className="w-[60px] h-[36px] bg-[#FFCC00] border-2 border-black rounded-md flex flex-col items-center justify-center font-black text-[9px] leading-none text-black">YK66<br/>OPR</div>
                <div>
                  <p className="font-semibold text-[12px] text-black">BMW 1 Series • 2016 • BLACK • 52k mi</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">G20 6 • MOT Valid until Jun 2025</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {selectedServices.map((s: string) => (
                  <div key={s} className="p-2.5 bg-black text-white rounded-xl border-2 border-black">
                    <p className="text-[11px] font-medium leading-tight">{s}</p>
                    <p className="text-[9px] text-white/60 mt-0.5">Included</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-black p-4 shadow-sm">
              <h3 className="font-semibold text-[13px] text-black flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">2</span> Your vehicle details • Separate from cards
                <span className="ml-auto text-[9px] bg-[#FFCC00] text-black border border-black px-2 py-0.5 rounded-full font-bold">AI → GARAGE</span>
              </h3>
              <div className="mt-3">
                <label className="text-[11px] font-semibold text-black">Additional Details - Optional but helps garage quote accurately</label>
                <textarea value={extraNotes} onChange={(e)=>setExtraNotes(e.target.value)} placeholder="Example: Brake noise, tyre change needed..." rows={3} className="mt-1.5 w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl text-[12px] text-black bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-100 resize-none" />
                <div className="mt-2 bg-[#FFCC00]/20 border-2 border-[#FFCC00] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-black uppercase tracking-wide">⚙️ Live AI Analysis</p>
                  <p className="text-[11px] text-black mt-1 font-medium">🔴 Brake system • High urgency • Likely worn pads • Photo recommended</p>
                  <p className="text-[10px] text-black/70 mt-1">→ Original + AI summary will be sent to {garage.name}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-[11px] font-bold bg-black text-white px-4 py-2.5 rounded-full border-2 border-black hover:bg-gray-900">📸 Add photo</button>
                  <button className="text-[11px] font-bold bg-white border-2 border-black px-4 py-2.5 rounded-full text-black hover:bg-gray-50">🎙️ Voice note</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-[13px] text-black flex items-center gap-2">
                <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">3</span> Your contact details
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your Name *" className="px-3.5 py-3 border-2 border-gray-300 rounded-xl text-[12px] text-black bg-white focus:outline-none focus:border-black" />
                <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone - 07xxx *" className="px-3.5 py-3 border-2 border-gray-300 rounded-xl text-[12px] text-black bg-white focus:outline-none focus:border-black" />
              </div>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email (optional) - for confirmation" className="mt-3 w-full px-3.5 py-3 border-2 border-gray-300 rounded-xl text-[12px] text-black bg-white focus:outline-none focus:border-black" />
              <div className="mt-4 bg-[#FFCC00]/20 border-2 border-[#FFCC00] rounded-xl p-3">
                <p className="text-[11px] font-bold text-black">No Price Displayed - Garage Will Quote</p>
                <p className="text-[11px] text-black/70 mt-1 leading-relaxed">Garage will inspect and send you a quote. You selected {selectedServices.length} jobs. Extra details + AI analysis included.</p>
              </div>
              <button onClick={handleBooking} disabled={loading} className="mt-4 w-full bg-black text-white font-bold py-3.5 rounded-xl text-[13px] hover:bg-gray-900 disabled:opacity-50 border-2 border-black shadow-md active:scale-[0.99] transition">
                {loading ? "Creating booking..." : `Confirm Booking - ${selectedServices.length} Jobs - Free Quote`}
              </button>
              <p className="text-[10px] text-gray-500 mt-2 text-center font-medium">✓ No spam • Free quote • You choose garage • Encrypted</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-black p-4 sticky top-[65px] shadow-sm">
              <h4 className="font-bold text-[12px] text-black">Booking summary</h4>
              <div className="mt-3 space-y-2.5 text-[11px]">
                <div className="flex justify-between"><span className="text-gray-600 font-medium">Garage</span><span className="font-bold text-black">{garage.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-medium">Vehicle</span><span className="font-bold text-black">YK66 OPR • BMW</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-medium">Services</span><span className="font-bold text-black">{selectedServices.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 font-medium">Est. Price</span><span className="font-bold text-black text-[14px]">£{garage.price}</span></div>
                <div className="pt-3 border-t-2 border-gray-100">
                  <p className="text-[10px] font-bold text-black uppercase tracking-wide">Customer detail (separate)</p>
                  <p className="text-[11px] text-black mt-1.5 font-medium bg-gray-50 border border-gray-200 rounded-lg p-2">{extraNotes || "No extra details"}</p>
                </div>
              </div>
              <div className="mt-4 bg-black text-white rounded-xl p-3 border-2 border-black">
                <p className="text-[10px] font-bold uppercase tracking-wide">✓ Detail separate • AI → Garage • No sponsored ranking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
