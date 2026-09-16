"use client"
import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function Settings({ params }: { params: Promise<{ reg: string }> }) {
  const { reg: rawReg } = use(params)
  const reg = decodeURIComponent(rawReg).toUpperCase().replace(/\s/g,"")
  const [oil, setOil] = useState(10000)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async () => {
      const e = localStorage.getItem("customer_email")
      if(!e){ setLoading(false); return }
      const { data } = await supabase.from("car_custom_intervals").select("oil_miles").eq("car_reg", reg).eq("owner_email", e).single()
      if(data) setOil(data.oil_miles)
      setLoading(false)
    }
    load()
  },[reg])

  const save = async () => {
    const email = localStorage.getItem("customer_email") || ""
    const { error } = await supabase.from("car_custom_intervals").upsert({ car_reg: reg, owner_email: email, oil_miles: oil }, { onConflict: "car_reg,owner_email" })
    if(error) alert(error.message)
    else alert(`✅ Saved! ${reg} ka oil interval ${oil} miles set ho gaya!`)
  }

  if(loading) return <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center font-bold text-black/40">Loading...</div>

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <div className="bg-[#0a0a0a] text-white px-6 lg:px-12 py-8">
        <div className="max-w- mx-auto">
          <Link href={`/customer/cars/${reg}`} className="inline-flex items-center gap-2 text- font-bold text-white/50 hover:text-white bg-white/10 px-4 py-2 rounded-full border border-white/10">← Back to {reg}</Link>
          <div className="flex items-center gap-4 mt-6">
            <div className="w- h- bg-[#ffcc00] border-[2.5px] border-black rounded- flex items-center justify-center">
              <span className="font-black text- tracking-wider text-black">{reg}</span>
            </div>
            <div>
              <h1 className="text- font-black tracking-tighter leading-none">Settings - {reg}</h1>
              <p className="text- text-white/50 mt-2 font-medium">UK Standard 10k - Premium 8k - Heavy 6k</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto px-6 py-8">
        <div className="bg-white rounded- p-8 border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <p className="text- font-black tracking-widest text-black/40 uppercase">Oil Change Interval</p>
          <h2 className="text- font-black text-black tracking-tighter mt-2">Kitne miles par reminder chahiye?</h2>
          <p className="text- text-black/50 mt-2 leading-relaxed font-medium">Standard UK mein 10k normal hai - Agar gaadi purani hai ya zyada chalti hai to 8k ya 6k rakho</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <button onClick={()=>setOil(6000)} className={`py-5 rounded- border-2 font-black text- transition-all ${oil===6000? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-[#f5f5f7] text-black/60 border-transparent hover:border-black/10'}`}>
              6k<span className="block text- font-bold tracking-widest mt-1 opacity-60">HEAVY USE</span>
            </button>
            <button onClick={()=>setOil(8000)} className={`py-5 rounded- border-2 font-black text- transition-all ${oil===8000? 'bg-[#ffcc00] border-black text-black shadow-[0_8px_20px_rgba(255,204,0,0.4)] scale-[1.02]' : 'bg-[#f5f5f7] text-black/60 border-transparent hover:border-black/10'}`}>
              8k<span className="block text- font-bold tracking-widest mt-1 opacity-60">PREMIUM</span>
            </button>
            <button onClick={()=>setOil(10000)} className={`py-5 rounded- border-2 font-black text- transition-all ${oil===10000? 'bg-[#00d084] text-black border-black shadow-[0_8px_20px_rgba(0,208,132,0.3)] scale-[1.02]' : 'bg-[#f5f5f7] text-black/60 border-transparent hover:border-black/10'}`}>
              10k<span className="block text- font-bold tracking-widest mt-1 opacity-60">UK STD</span>
            </button>
          </div>

          <div className="mt-6 bg-[#f5f5f7] rounded- p-4 flex justify-between items-center">
            <span className="text- font-black tracking-widest text-black/40 uppercase">Selected</span>
            <span className="text- font-black text-black">{oil.toLocaleString()} miles - Next due: {oil.toLocaleString()} miles after last service</span>
          </div>

          <button onClick={save} className="w-full h- bg-black text-white rounded- mt-6 font-black text- hover:bg-[#222] transition-all shadow-lg active:scale-[0.98]">💾 Save Settings for {reg}</button>
          <p className="text- text-black/30 text-center mt-4 font-medium tracking-wide">Ye sirf {reg} ke liye save hoga - Har car ka alag interval</p>
        </div>

        <div className="mt-4 bg-[#0a0a0a] rounded- p-4 flex gap-3">
          <span className="text-[#ffcc00]">💡</span>
          <p className="text- text-white/60 leading-relaxed"><b className="text-white">UK Advice:</b> New car 10k, 3-5 years 8k, Old / Taxi / Heavy city driving 6k - Engine zyada safe rahega.</p>
        </div>
      </div>
    </div>
  )
}