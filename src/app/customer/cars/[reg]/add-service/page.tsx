"use client"
import { useState, use } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AddService({ params }: { params: Promise<{ reg: string }> }) {
  const { reg: rawReg } = use(params)
  const reg = decodeURIComponent(rawReg).toUpperCase().replace(/\s/g,"")
  const router = useRouter()
  const [mileage, setMileage] = useState("")
  const [type, setType] = useState("Oil Change")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const save = async () => {
    if(!mileage){ alert("Mileage daalo"); return }
    const { error } = await supabase.from("car_service_logs").insert([{
      car_reg: reg,
      mileage: parseInt(mileage),
      service_type: type,
      date: date,
      source: "customer",
      verified: false
    }])
    if(error) alert(error.message)
    else {
      alert(`✅ Service Added! ${reg} - ${mileage} miles`)
      router.push(`/customer/cars/${reg}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Black Header */}
      <div className="bg-[#0a0a0a] text-white px-6 lg:px-12 py-8">
        <div className="max-w- mx-auto">
          <Link href={`/customer/cars/${reg}`} className="inline-flex items-center gap-2 text- font-bold text-white/50 hover:text-white bg-white/10 px-4 py-2 rounded-full border border-white/10">← Back to {reg}</Link>
          <div className="flex items-center gap-4 mt-6">
            <div className="w- h- bg-[#ffcc00] border-[2.5px] border-black rounded- flex items-center justify-center">
              <span className="font-black text- tracking-wider text-black">{reg}</span>
            </div>
            <div>
              <h1 className="text- font-black tracking-tighter leading-none">Add Service - {reg}</h1>
              <p className="text- text-white/50 mt-2 font-medium">⚠ Unverified - Garage se verify hoga to ✅ ayega</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto px-6 py-8">
        <div className="bg-white rounded- p-8 border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="space-y-5">
            <div>
              <label className="text- font-black tracking-widest text-black/60 uppercase mb-2 block">Current Mileage *</label>
              <div className="relative">
                <input type="number" value={mileage} onChange={e=>setMileage(e.target.value)} placeholder="85000" className="w-full h- px-4 pr-16 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-black outline-none transition-all" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text- font-black tracking-widest text-black/40">MILES</span>
              </div>
              <p className="text- text-black/40 mt-2 font-medium">Last service se zyada hona chahiye - Clocking check hoga</p>
            </div>

            <div>
              <label className="text- font-black tracking-widest text-black/60 uppercase mb-2 block">Service Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {["Oil Change","Full Service","Major Service","Interim Service","Brake Service","MOT","Tyres"].map(s=>(
                  <button key={s} onClick={()=>setType(s)} className={`h- rounded- border text- font-bold transition-all ${type===s? 'bg-black text-white border-black shadow-lg' : 'bg-[#f5f5f7] text-black/60 border-transparent hover:border-black/10'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text- font-black tracking-widest text-black/60 uppercase mb-2 block">Service Date *</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all" />
            </div>
          </div>

          <div className="mt-8 bg-[#1a1a00] border border-yellow-900/20 rounded- p-4 flex gap-3">
            <span className="text-[#ffcc00] text-">💛</span>
            <p className="text- text-[#ffcc00]/80 leading-relaxed font-medium">Customer added = ⚠ Unverified. Jab garage verify karega to ✅ Verified badge ayega - UK 10k Standard compliance.</p>
          </div>

          <button onClick={save} className="w-full h- bg-black text-white rounded- mt-6 font-black text- hover:bg-[#222] transition-all shadow-lg active:scale-[0.98]">💾 Save Service - {reg}</button>
        </div>
      </div>
    </div>
  )
}