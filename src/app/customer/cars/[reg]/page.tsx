"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function CarHistoryPage() {
  const { reg } = useParams()
  const [logs, setLogs] = useState<any[]>([])
  const [carInfo, setCarInfo] = useState<any>(null)
  const [intervalInfo, setIntervalInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    const cleanReg = (reg as string).toUpperCase().replace(/\s/g,"")
    const email = localStorage.getItem("customer_email") || ""

    const { data: car } = await supabase.from("cars").select("*").eq("car_reg", cleanReg).single()
    setCarInfo(car)

    const { data: intervals } = await supabase.from("car_custom_intervals").select("*").eq("car_reg", cleanReg).eq("owner_email", email).single()
    setIntervalInfo(intervals || { oil_miles: 10000 })

    const { data } = await supabase.from("car_service_logs").select("*").eq("car_reg", cleanReg).order("mileage", { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }

  const makePublic = async (isPublic: boolean) => {
    const cleanReg = (reg as string).toUpperCase().replace(/\s/g,"")
    await supabase.from("cars").update({ is_public: isPublic }).eq("car_reg", cleanReg)
    alert(isPublic? "✅ Public kar diya - Buyer ko verified history dikhegi - Value barhegi!" : "🔒 Private kar diya")
    fetchHistory()
  }

  if (loading) return <div className="p-8 text-center">Loading 100% history... Garage + Customer + DVLA merging...</div>

  const lastMileage = logs[0]?.mileage || 0
  const nextDue = lastMileage + (intervalInfo?.oil_miles || 10000)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/customer" className="text-blue-600 text-sm">← My Cars</Link>
        <div className="flex justify-between items-center mt-2 mb-2">
          <h1 className="text-2xl font-bold tracking-wider">{reg} - Full Timeline</h1>
          <span className={`text-xs px-3 py-1 rounded-full ${carInfo?.is_public? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>{carInfo?.is_public? '🌍 Public' : '🔒 Private'}</span>
        </div>
        <p className="text-xs text-gray-500 mb-1">3-way: Garage (Verified ✅) + Customer (Unverified) + DVLA - Clocking auto check - UK Std {intervalInfo?.oil_miles || 10000} miles</p>
        {lastMileage > 0 && <p className="text-xs font-bold text-blue-600 mb-4">Last: {lastMileage.toLocaleString()} miles → Next Due: {nextDue.toLocaleString()} miles ({intervalInfo?.oil_miles || 10000} interval)</p>}

        <div className="flex gap-2 mb-6 flex-wrap">
          <Link href={`/customer/cars/${reg}/add-service`} className="bg-black text-white px-4 py-2 rounded-lg text-sm">+ Add Service (Khud)</Link>
          <Link href={`/customer/cars/${reg}/settings`} className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-bold">⚙ Settings {intervalInfo?.oil_miles || 10000}</Link>
          <button onClick={() => makePublic(!carInfo?.is_public)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">{carInfo?.is_public? 'Make Private' : 'Make Public - Sell Better'}</button>
        </div>

        {logs.length === 0? (
          <div className="bg-white p-8 rounded-xl text-center">
            <p className="text-gray-400 mb-3">No history yet - Pehla service add karo</p>
            <Link href={`/customer/cars/${reg}/add-service`} className="text-blue-600 text-sm">Add first service - Meter se mileage daalo</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => {
              const older = logs[i+1]
              const isClock = older && log.mileage < older.mileage
              return (
                <div key={log.id} className={`bg-white p-4 rounded-xl border flex justify-between ${isClock? 'border-red-400 bg-red-50' : 'border-zinc-200'}`}>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{log.service_type} @ <span className="text-blue-600">{log.mileage.toLocaleString()} miles</span></p>
                    <p className="text-xs text-gray-500 mt-1">{log.date} - {log.garage_name} - {log.source} {log.verified? '✅ Verified' : '⚠️ Unverified'}</p>
                    {log.notes && <p className="text-xs text-zinc-400 mt-1">{log.notes}</p>}
                    {isClock && <p className="text-xs text-red-600 font-bold mt-1">⚠️ CLOCKING ALERT! Isse pehle {older.mileage.toLocaleString()} tha, ab {log.mileage.toLocaleString()} kam!</p>}
                  </div>
                  <div className="text-right">
                    <span className={`text- px-2 py-1 rounded-full ${log.source === 'garage'? 'bg-green-100 text-green-700' : log.source === 'dvla'? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>{log.source}</span>
                    <p className="text- text-gray-400 mt-1">{log.added_by?.substring(0,12)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 p-4 rounded-xl border">
          <p className="text-xs font-bold">AI Reminder Logic - UK Standard:</p>
          <p className="text- text-gray-600">Last {lastMileage.toLocaleString()} + Your interval ({intervalInfo?.oil_miles || 10000}) = Next due {nextDue.toLocaleString()}. 500 miles pehle warning, overdue pe red alert + SMS. {intervalInfo?.oil_miles === 8000? 'Tumhara Premium 8000 ON hai - Engine extra safe!' : 'UK Standard 10000 ON hai'}</p>
        </div>
      </div>
    </div>
  )
}