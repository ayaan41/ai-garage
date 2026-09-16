"use client"
import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function CarHistory({ params }: { params: Promise<{ reg: string }> }) {
  const { reg: rawReg } = use(params)
  const reg = decodeURIComponent(rawReg).toUpperCase().replace(/\s/g,"")
  const [logs, setLogs] = useState<any[]>([])
  const [car, setCar] = useState<any>(null)
  const [interval, setInterval] = useState(10000)

  const load = async () => {
    const { data: carData } = await supabase.from("cars").select("*").eq("car_reg", reg).single()
    setCar(carData)
    const { data: logsData } = await supabase.from("car_service_logs").select("*").eq("car_reg", reg).order("mileage", { ascending: false })
    setLogs(logsData || [])
    const email = localStorage.getItem("customer_email")
    if(email){
      const { data: intData } = await supabase.from("car_custom_intervals").select("oil_miles").eq("car_reg", reg).eq("owner_email", email).single()
      if(intData) setInterval(intData.oil_miles)
    }
  }
  useEffect(()=>{ load() },[reg])

  const lastMileage = logs.length>0? logs[0].mileage : 0
  const nextDue = lastMileage + interval
  const hasClocking = logs.some((log, i)=> i < logs.length-1 && log.mileage < logs[i+1].mileage)
  const togglePublic = async () => { await supabase.from("cars").update({ is_public:!car.is_public }).eq("car_reg", reg); load() }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Top Black Header */}
      <div className="bg-[#0a0a0a] text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
          <Link href="/customer" className="inline-flex items-center gap-2 text- font-bold text-white/50 hover:text-white bg-white/10 px-4 py-2 rounded-full border border-white/10">← Back to My Cars</Link>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mt-6">
            <div className="flex items-center gap-5">
              <div className="w- h- bg-[#ffcc00] border- border-black rounded- flex items-center justify-center shadow-[0_8px_20px_rgba(255,204,0,0.3)]">
                <span className="font-black text- tracking-[0.12em] text-black">{reg}</span>
              </div>
              <div>
                <h1 className="text- font-black tracking-tighter leading-none">{reg}</h1>
                <p className="text- text-white/50 mt-2 font-medium">Last: <b className="text-white">{lastMileage.toLocaleString()}</b> miles | Next: <b className="text-[#ffcc00]">{nextDue.toLocaleString()}</b> | Interval: <b className="text-white">{interval.toLocaleString()}</b></p>
              </div>
            </div>
            <button onClick={togglePublic} className={`h- px-5 rounded-full text- font-black tracking-widest uppercase transition-all ${car?.is_public? 'bg-[#00d084] text-black shadow-lg' : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15'}`}>
              {car?.is_public? '🌍 Public - Anyone can view' : '🔒 Private - Only you'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
        {hasClocking && (
          <div className="bg-[#ff1a1a] text-white p-4 rounded- flex gap-3 items-center shadow-[0_10px_30px_rgba(255,26,26,0.3)] mb-6">
            <span className="text-">🚨</span>
            <div><p className="font-black text- tracking-widest uppercase">CLOCKING ALERT! Mileage kam hua hai!</p><p className="text- opacity-80 mt-1">Service history mein mileage piche ja raha hai - Check karo</p></div>
          </div>
        )}

        {/* UK 10k Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded- p-4 border border-black/5"><p className="text- font-black tracking-widest text-black/40 uppercase">Last Service</p><p className="text- font-black text-black mt-1">{lastMileage.toLocaleString()}<span className="text- font-medium text-black/50 ml-1">mi</span></p></div>
          <div className="bg-black rounded- p-4 border border-white/5"><p className="text- font-black tracking-widest text-white/40 uppercase">Next Due</p><p className="text- font-black text-[#ffcc00] mt-1">{nextDue.toLocaleString()}<span className="text- font-medium text-white/50 ml-1">mi</span></p></div>
          <div className="bg-white rounded- p-4 border border-black/5"><p className="text- font-black tracking-widest text-black/40 uppercase">Interval</p><p className="text- font-black text-black mt-1">{(interval/1000).toFixed(0)}k<span className="text- font-medium text-black/50 ml-1">miles</span></p></div>
        </div>

        <div className="flex gap-3 mb-8">
          <Link href={`/customer/cars/${reg}/add-service`} className="flex-1 h- bg-black text-white rounded- flex items-center justify-center font-black text- hover:bg-[#222] transition-all shadow-lg">+ Add Service Record</Link>
          <Link href={`/customer/cars/${reg}/settings`} className="h- px-6 bg-white border border-black/10 text-black rounded- flex items-center justify-center font-black text- hover:border-black transition-all">⚙ Settings</Link>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text- text-black tracking-tighter">Service History - {logs.length} records</h2>
          <span className="text- font-bold text-black/40 bg-black/5 px-3 py-1 rounded-full">{logs.length>0? 'UK 10k Standard' : 'No history'}</span>
        </div>

        {logs.length===0? (
          <div className="bg-white rounded- p-12 text-center border border-black/5"><p className="font-bold text-black">No service history yet</p><p className="text- text-gray-500 mt-2">Pehla service record add karo - Mileage se track hoga</p></div>
        ) : (
          <div className="grid gap-3">
            {logs.map((log)=>(
              <div key={log.id} className="group bg-white p-5 rounded- border border-black/5 flex justify-between items-center hover:border-black/20 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w- h- rounded- bg-[#f5f5f7] flex flex-col items-center justify-center border border-black/5">
                    <span className="font-black text- text-black leading-none">{(log.mileage/1000).toFixed(0)}k</span>
                    <span className="text- font-bold text-black/40 uppercase tracking-widest mt-1">miles</span>
                  </div>
                  <div>
                    <p className="font-black text- text-black">{log.mileage.toLocaleString()} miles - {log.service_type}</p>
                    <p className="text- text-black/50 mt-1 font-medium">{log.date} | {log.source} {log.verified? '✅ Verified by Garage' : '⚠ Unverified - Customer added'}</p>
                  </div>
                </div>
                <span className={`text- px-3 py-1.5 rounded-full font-black tracking-widest uppercase h-fit ${log.verified? 'bg-[#00d084]/15 text-[#00a86b] border border-[#00d084]/20' : 'bg-[#ffcc00]/20 text-black border border-[#ffcc00]/30'}`}>{log.verified? 'Verified' : 'Customer'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}