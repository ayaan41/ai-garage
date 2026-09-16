"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function SettingsPage() {
  const { reg } = useParams()
  const [form, setForm] = useState({ oil_miles: 10000, brake_pad_miles: 30000, tyre_miles: 25000, mot_days_before: 30 })
  const [loading, setLoading] = useState(false)
  const [hasExisting, setHasExisting] = useState(false)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const email = localStorage.getItem("customer_email") || ""
    const cleanReg = (reg as string).toUpperCase().replace(/\s/g,"")
    const { data } = await supabase.from("car_custom_intervals").select("*").eq("car_reg", cleanReg).eq("owner_email", email).single()
    if (data) {
      setForm(data)
      setHasExisting(true)
    } else {
      // UK Standard default - 10000
      setForm({ oil_miles: 10000, brake_pad_miles: 30000, tyre_miles: 25000, mot_days_before: 30 })
    }
  }

  const save = async () => {
    setLoading(true)
    const email = localStorage.getItem("customer_email") || ""
    if (!email) { alert("Login required"); setLoading(false); return }
    const cleanReg = (reg as string).toUpperCase().replace(/\s/g,"")
    const { error } = await supabase.from("car_custom_intervals").upsert({
      car_reg: cleanReg,
      owner_email: email,
      oil_miles: form.oil_miles,
      brake_pad_miles: form.brake_pad_miles,
      tyre_miles: form.tyre_miles,
      mot_days_before: form.mot_days_before
    }, { onConflict: 'car_reg,owner_email' })
    if (error) alert(error.message);
    else alert(`✅ Saved! Oil ${form.oil_miles} miles pe AI notify karega - ${form.oil_miles === 8000? 'Premium Early Care ON' : form.oil_miles === 10000? 'UK Standard ON' : 'Custom ON'} - AI Garage ka brain set ho gaya!`)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-lg mx-auto">
        <Link href={`/customer/cars/${reg}`} className="text-blue-600 text-sm">← Back to {reg}</Link>
        <h1 className="text-xl font-bold mt-2">Settings - {reg}</h1>
        <p className="text-xs text-gray-500">Yahan tum custom interval set kar sakte ho - UK Standard 10k hai, tumhara 8k Premium hai</p>

        {hasExisting && <p className="text-xs text-green-600 mt-2">✓ Saved settings loaded - Last: Oil {form.oil_miles} miles</p>}

        <div className="space-y-4 mt-6 bg-yellow-50 p-6 rounded-xl border">
          <div>
            <label className="text-xs font-bold">Oil Change Miles - UK Standard vs Premium</label>
            <div className="flex gap-2 mt-1 mb-2">
              <button onClick={()=>setForm({...form, oil_miles: 6000})} className={`text-xs px-3 py-1 rounded-full border ${form.oil_miles===6000?'bg-black text-white':'bg-white'}`}>6000 Heavy</button>
              <button onClick={()=>setForm({...form, oil_miles: 8000})} className={`text-xs px-3 py-1 rounded-full border ${form.oil_miles===8000?'bg-yellow-400 text-black font-bold':'bg-white'}`}>8000 Premium</button>
              <button onClick={()=>setForm({...form, oil_miles: 10000})} className={`text-xs px-3 py-1 rounded-full border ${form.oil_miles===10000?'bg-green-600 text-white':'bg-white'}`}>10000 UK Std</button>
            </div>
            <input type="number" className="w-full p-3 border rounded-lg font-bold" value={form.oil_miles} onChange={e=>setForm({...form, oil_miles: parseInt(e.target.value) || 10000})} />
            <p className="text- text-gray-500 mt-1">
              {form.oil_miles===10000 && "🇬🇧 UK Standard - Manual mein yehi hai - 12 months / 10k miles"}
              {form.oil_miles===8000 && "⭐ Tumhara Premium idea - Early protection - Engine zyada safe - AI Garage USP"}
              {form.oil_miles===6000 && "🚕 Heavy / Taxi / City driver - Har 6 months"}
              {![6000,8000,10000].includes(form.oil_miles) && `Custom ${form.oil_miles} miles - AI usi hisab se notify karega`}
            </p>
          </div>

          <div><label className="text-xs font-bold">Brake Pads Miles</label><input type="number" className="w-full p-3 border rounded-lg" value={form.brake_pad_miles} onChange={e=>setForm({...form, brake_pad_miles: parseInt(e.target.value) || 30000})} /></div>
          <div><label className="text-xs font-bold">Tyres Miles</label><input type="number" className="w-full p-3 border rounded-lg" value={form.tyre_miles} onChange={e=>setForm({...form, tyre_miles: parseInt(e.target.value) || 25000})} /></div>
          <div><label className="text-xs font-bold">MOT Reminder Days Before</label><input type="number" className="w-full p-3 border rounded-lg" value={form.mot_days_before} onChange={e=>setForm({...form, mot_days_before: parseInt(e.target.value) || 30})} /></div>

          <button onClick={save} disabled={loading} className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold hover:bg-yellow-500">{loading? "Saving..." : `Save - ${form.oil_miles} Miles Lock - AI On Karo`}</button>

          <div className="bg-white p-3 rounded-lg border">
            <p className="text- font-bold">Example:</p>
            <p className="text- text-gray-600">Last oil 50000 tha - Tumne {form.oil_miles} set kiya - To {50000 + form.oil_miles} pe notify ayega - 500 miles pehle warning - Overdue pe red alert.</p>
          </div>
        </div>
      </div>
    </div>
  )
}