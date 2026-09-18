"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SERVICES = [
  { id: "full", label: "Full Service", icon: "🔧", price: "£149-299" },
  { id: "mot", label: "MOT", icon: "✅", price: "£54.85" },
  { id: "brakes", label: "Brakes", icon: "🛑", price: "£89-189" },
  { id: "oil", label: "Oil Change", icon: "🛢️", price: "£49-89" },
  { id: "diagnostics", label: "Diagnostics", icon: "🤖", price: "£45-90" },
  { id: "clutch", label: "Clutch", icon: "⚙️", price: "£350-650" },
  { id: "tyres", label: "Tyres", icon: "🛞", price: "£60-150" },
  { id: "battery", label: "Battery", icon: "🔋", price: "£80-180" },
  { id: "other", label: "Custom", icon: "✨", price: "TBC" },
];

export default function FinalAIPage() {
  const router = useRouter();
  const [reg, setReg] = useState("YK66OPR");
  const [postcode, setPostcode] = useState("G20 6");
  const [selected, setSelected] = useState<string[]>(["full"]);
  const [customJob, setCustomJob] = useState("");
  const [details, setDetails] = useState("break");
  const [issues, setIssues] = useState<string[]>(["Brake noise"]);
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<any>({ reg: "YK66 OPR", make: "BMW", model: "1 Series", colour: "BLACK", year: "2016", mileage: 52000, mot: "Valid until Jun 2025", tax: "Taxed" });

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  const toggleIssue = (i: string) => setIssues(p => p.includes(i) ? p.filter(x=>x!==i) : [...p, i]);

  const lookup = () => {
    setLoading(true);
    setTimeout(() => {
      setVehicle({ reg: "YK66 OPR", make: "BMW", model: "1 Series", colour: "BLACK", year: "2016", mileage: 52000, mot: "Valid until Jun 2025", tax: "Taxed" });
      setLoading(false);
    }, 600);
  };

  // Live AI analysis
  const aiAnalysis = useMemo(() => {
    const text = (details + " " + issues.join(" ")).toLowerCase();
    if (!text.trim()) return null;
    let issue = "General check";
    let urgency = "Normal";
    let cause = "Needs inspection";
    let photo = "Optional";
    let flag = "🟡";

    if (text.includes("brak") || text.includes("break")) {
      issue = "Brake system";
      urgency = "High - Safety";
      cause = "Likely worn pads / discs - grinding noise indicates metal contact";
      photo = "Recommended: Brake disc & pad photo";
      flag = "🔴";
    } else if (text.includes("steer") || text.includes("vibra")) {
      issue = "Steering / Suspension";
      urgency = "Medium";
      cause = "Possible wheel balancing or suspension wear";
      photo = "Optional: Tyre wear photo";
      flag = "🟡";
    } else if (text.includes("light") || text.includes("engine") || text.includes("warning")) {
      issue = "Diagnostics / Warning light";
      urgency = "Medium-High";
      cause = "ECU fault code needed - diagnostic scan required";
      photo = "Recommended: Dashboard warning light photo";
      flag = "🟠";
    } else if (text.includes("oil") || text.includes("leak")) {
      issue = "Oil / Fluid leak";
      urgency = "Medium";
      cause = "Check sump, seals, gasket";
      photo = "Recommended: Leak location photo";
      flag = "🟡";
    }
    return { issue, urgency, cause, photo, flag };
  }, [details, issues]);

  const canContinue = selected.length > 0 && (selected.includes("other") ? customJob.trim().length > 2 : true);

  return (
    <div className="min-h-screen bg-[#fafafb]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/customer" className="text-[13px] font-medium text-gray-600 hover:text-black flex items-center gap-2"><span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">←</span> Back</Link>
          <div className="flex items-center gap-2">
            <span className="bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">● AI Online</span>
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-[10px]">AG</div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
          <div className="space-y-5">
            {/* Vehicle */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-bold">1</div>
                <h3 className="font-semibold text-[13px]">Vehicle details</h3>
                <span className="ml-auto text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">✓ DVLA Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <input value={reg} onChange={e=>setReg(e.target.value.toUpperCase())} className="px-3 py-2.5 bg-[#ffcc00]/15 border-2 border-[#ffcc00] rounded-xl font-mono font-bold text-[12px] uppercase text-black focus:outline-none" />
                <input value={postcode} onChange={e=>setPostcode(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-[12px] font-medium text-black bg-white focus:outline-none focus:border-black" />
              </div>
              <button onClick={lookup} className="mt-3 w-full bg-black text-white py-2.5 rounded-xl text-[12px] font-medium">{loading ? "Checking..." : "🔍 Check vehicle"}</button>
            </div>

            {/* Services - EXTRA SMALL */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-bold">2</div>
                  <h3 className="font-semibold text-[13px]">Select service • Small cards</h3>
                </div>
                <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{selected.length} • £{selected.length*110}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {SERVICES.map(s=>{
                  const active = selected.includes(s.id);
                  return (
                    <button key={s.id} onClick={()=>toggle(s.id)} className={`relative p-2.5 rounded-xl border text-left transition ${active ? "bg-black text-white border-black shadow" : "bg-white border-gray-200 hover:border-black"}`}>
                      <div className="flex justify-between">
                        <span className="text-[13px]">{s.icon}</span>
                        {active && <span className="w-3.5 h-3.5 bg-white text-black rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>}
                      </div>
                      <div className={`font-medium text-[11px] mt-1.5 leading-tight ${active ? "text-white" : "text-black"}`}>{s.label}</div>
                      <div className={`text-[9px] mt-0.5 ${active ? "text-white/60" : "text-gray-500"}`}>{s.price}</div>
                    </button>
                  )
                })}
              </div>

              {selected.includes("other") && (
                <div className="mt-3 p-2.5 bg-violet-50 border border-violet-200 rounded-xl">
                  <label className="text-[10px] font-bold text-violet-700">✨ Custom job *</label>
                  <input value={customJob} onChange={e=>setCustomJob(e.target.value)} placeholder="e.g. Tow bar, AC re-gas..." className="mt-1 w-full px-2.5 py-2 border border-violet-200 rounded-lg text-[11px] text-black bg-white focus:outline-none" />
                </div>
              )}
            </div>

            {/* CUSTOMER DETAIL - SEPARATE SECTION */}
            <div className="bg-white rounded-2xl border-2 border-violet-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-[11px] font-bold">3</div>
                  <h3 className="font-semibold text-[13px]">Your vehicle details • Separate</h3>
                </div>
                <span className="text-[10px] bg-violet-600 text-white px-2.5 py-1 rounded-full font-bold">CUSTOMER INPUT → AI → GARAGE</span>
              </div>
              
              <p className="text-[11px] text-gray-600 mb-3">Write your issue here - this is separate from service cards. AI will understand and send to garages with your booking.</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {["Brake noise","Steering vibration","Warning light","Strange noise","Oil leak","Hard to start"].map(t=>{
                  const a = issues.includes(t);
                  return <button key={t} onClick={()=>toggleIssue(t)} className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${a ? "bg-violet-600 text-white border-violet-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:border-violet-300"}`}>{a ? "✓ " : "+ "}{t}</button>
                })}
              </div>

              <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Describe issue in your own words - separate from cards...&#10;e.g. Brake grinding at low speed, started 2 days ago, only when cold..." rows={3} className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-xl text-[12px] text-black bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 resize-none" />

              {/* LIVE AI PREVIEW */}
              {aiAnalysis && (
                <div className="mt-3 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-3 animate-in fade-in">
                  <p className="text-[11px] font-bold text-violet-800 flex items-center gap-1.5">🤖 Live AI Analysis • What AI understood:</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white border border-violet-100 rounded-lg p-2"><span className="text-[10px] text-gray-500 font-bold uppercase">Issue</span><p className="font-semibold text-black mt-0.5">{aiAnalysis.flag} {aiAnalysis.issue}</p></div>
                    <div className="bg-white border border-violet-100 rounded-lg p-2"><span className="text-[10px] text-gray-500 font-bold uppercase">Urgency</span><p className="font-semibold text-black mt-0.5">{aiAnalysis.urgency}</p></div>
                    <div className="col-span-2 bg-white border border-violet-100 rounded-lg p-2"><span className="text-[10px] text-gray-500 font-bold uppercase">Possible cause</span><p className="text-gray-700 mt-0.5">{aiAnalysis.cause}</p></div>
                    <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-2"><span className="text-[10px] text-amber-700 font-bold uppercase">📸 {aiAnalysis.photo}</span></div>
                  </div>
                  <p className="text-[10px] text-violet-600 mt-2">→ This AI summary + your original text will be sent to garages with booking</p>
                </div>
              )}

              {/* 2 BUTTONS - VISIBLE FIXED */}
              <div className="mt-3 flex items-center gap-2.5">
                <button className="flex items-center gap-1.5 text-[12px] font-semibold bg-black text-white px-4 py-2.5 rounded-full hover:bg-gray-900 shadow-md transition">📸 Add photo</button>
                <button className="flex items-center gap-1.5 text-[12px] font-semibold bg-white border-2 border-black text-black px-4 py-2.5 rounded-full hover:bg-gray-50 shadow-sm transition">🎙️ Voice note</button>
                <span className="ml-auto text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">{details.length} chars • {issues.length} tags</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Customer detail is separate → AI reads → Garage receives both original + AI analysis</p>
            </div>
          </div>

          {/* Right Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-[65px] shadow-sm">
              <div className="flex gap-2.5">
                <div className="w-[68px] h-[40px] bg-[#ffcc00] border-2 border-black rounded-md flex flex-col items-center justify-center font-black text-[10px] leading-none text-black">YK66<br/>OPR</div>
                <div>
                  <p className="font-bold text-[13px] text-black">{vehicle.make} {vehicle.model}</p>
                  <p className="text-[11px] text-gray-600">{vehicle.year} • {vehicle.colour} • {vehicle.mileage.toLocaleString()} mi</p>
                  <p className="text-[10px] text-green-700 mt-0.5 font-medium">✓ MOT {vehicle.mot}</p>
                </div>
              </div>

              <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Booking</p>
                <p className="text-[12px] font-medium text-black mt-1">{selected.map(id=>SERVICES.find(s=>s.id===id)?.label).join(", ")}</p>
                {customJob && <p className="text-[11px] mt-2 bg-white border border-violet-200 rounded-lg p-2"><span className="font-bold text-violet-700">Custom:</span> {customJob}</p>}
              </div>

              <div className="mt-3 bg-violet-50 border border-violet-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-violet-700 uppercase">Customer detail (separate)</p>
                <p className="text-[11px] text-black mt-1">{issues.join(", ")}{details ? ` • ${details}` : ""}</p>
                {aiAnalysis && <p className="text-[10px] text-violet-700 mt-2 bg-white border border-violet-100 rounded-lg p-2">{aiAnalysis.flag} AI: {aiAnalysis.issue} • {aiAnalysis.urgency}</p>}
              </div>

              <button disabled={!canContinue} onClick={()=>router.push(`/book`)} className="mt-4 w-full bg-black disabled:bg-gray-300 text-white py-3 rounded-xl font-medium text-[12px]">Continue to garages →</button>
              <p className="text-[10px] text-gray-400 mt-2 text-center">✓ Detail separate • AI → Garage • You choose</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
