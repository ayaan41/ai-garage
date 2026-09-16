"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function AddServicePage() {
  const params = useParams()
  const reg = (params.reg as string)?.toUpperCase()
  const [form, setForm] = useState({ service_type: "Oil Change", mileage: "", date: new Date().toISOString().split('T')[0], garage_name: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [customerEmail, setCustomerEmail] = useState("")

  useEffect(() => {
    const email = localStorage.getItem("customer_email") || ""
    if (!email) router.push("/customer/login")
    setCustomerEmail(email)
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const mileageInt = parseInt(form.mileage)
    if (!mileageInt) { alert("Mileage daalo - Meter se dekho"); setLoading(false); return }

    const { error } = await supabase.from("car_service_logs").insert([{
      car_reg: reg,
      mileage: mileageInt,
      service_type: form.service_type,
      date: form.date,
      source: "customer",
      garage_name: form.garage_name || "Customer Added - Bahar se",
      verified: false,
      added_by: customerEmail,
      created_at: new Date()
    }])

    if (error) { alert("Error: " + error.message); setLoading(false); return }

    // Update cars table if new highest mileage
    const { data: maxLog } = await supabase.from("car_service_logs").select("mileage").eq("car_reg", reg).order("mileage", { ascending: false }).limit(1).single()

    alert(`Service add ho gaya! ${mileageInt} miles pe ${form.service_type} - History mein aa gaya - AI ko ab pata chal gaya!`)
    router.push(`/customer/cars/${reg}`)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <Link href={`/customer/cars/${reg}`} className="text-blue-600 text-sm">← Back to {reg}</Link>
        <h1 className="text-xl font-bold mt-2">Add Service / Mileage - {reg}</h1>
        <p className="text-xs text-gray-500 mb-4">Agar garage ne nahi likha ya bahar se karwaya - Khud add karo - 100% history!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500">Service Type</label>
            <select value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})} className="w-full p-3 border rounded-lg">
              <option>Oil Change</option>
              <option>Oil + Filter</option>
              <option>Brake Pads</option>
              <option>Tyres</option>
              <option>MOT</option>
              <option>Service</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Mileage - Meter se dekho - Important!</label>
            <input type="number" required placeholder="58500" className="w-full p-3 border rounded-lg" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Date</label>
            <input type="date" required className="w-full p-3 border rounded-lg" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Garage Name - Kahan karwaya? (Kwik Fit / Khud / etc)</label>
            <input type="text" placeholder="Kwik Fit - Glasgow / Khud kiya" className="w-full p-3 border rounded-lg" value={form.garage_name} onChange={e => setForm({...form, garage_name: e.target.value})} />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            {loading? "Adding..." : "Add to History"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">Ye unverified hoga - Lekin AI ko pata chal jayega aur next reminder usi hisab se dega!</p>
      </div>
    </div>
  )
}
