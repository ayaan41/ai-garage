"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CustomerDashboard() {
  const [cars, setCars] = useState<any[]>([])
  const [newReg, setNewReg] = useState("")
  const [loading, setLoading] = useState(true)
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerName, setCustomerName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem("customer_email") || ""
    const name = localStorage.getItem("customer_name") || ""
    if (!email) {
      router.push("/customer/login")
      return
    }
    setCustomerEmail(email)
    setCustomerName(name)
    fetchCars(email)
  }, [])

  const fetchCars = async (email: string) => {
    setLoading(true)
    const { data } = await supabase.from("cars").select("*").eq("original_owner_email", email).order("created_at", { ascending: false })
    if (data) {
      const carsWithMileage = await Promise.all(data.map(async (car) => {
        const { data: logs } = await supabase.from("car_service_logs").select("*").eq("car_reg", car.car_reg).order("mileage", { ascending: false }).limit(1)
        const lastMileage = logs && logs[0] ? logs[0].mileage : 0
        const { data: interval } = await supabase.from("car_custom_intervals").select("*").eq("car_reg", car.car_reg).eq("owner_email", email).single()
        const oilInterval = interval?.oil_miles || 8000
        return {...car, lastMileage, oilInterval, nextOilDue: lastMileage + oilInterval }
      }))
      setCars(carsWithMileage)
    }
    setLoading(false)
  }

  const handleAddCar = async (e: any) => {
    e.preventDefault()
    if (!newReg.trim()) return alert("Car Reg daalo - KM66XMY jaise")
    const reg = newReg.toUpperCase().replace(/\s/g, "")

    const { data: existingCar } = await supabase.from("cars").select("*").eq("car_reg", reg).single()
    if (existingCar && existingCar.original_owner_email !== customerEmail) {
      const confirmTransfer = confirm(`Ye gadi ${reg} pehle se kisi aur ke naam hai - Kya tum new owner ho? Transfer?`)
      if (!confirmTransfer) return
      const { error } = await supabase.from("cars").update({ original_owner_email: customerEmail }).eq("car_reg", reg)
      if (error) return alert("Transfer fail: " + error.message)
      alert("Gadi transfer ho gayi! Ab tum owner ho")
      fetchCars(customerEmail)
      setNewReg("")
      return
    }

    if (existingCar) {
      alert("Ye gadi already tumhari My Cars mein hai!")
      return
    }

    const { error } = await supabase.from("cars").insert([{
      car_reg: reg,
      original_owner_email: customerEmail,
      is_public: true,
      created_at: new Date().toISOString()
    }])

    if (error) return alert("Error: " + error.message)

    await supabase.from("car_custom_intervals").insert([{
      car_reg: reg,
      owner_email: customerEmail,
      oil_miles: 8000,
      brake_pad_miles: 30000,
      tyre_miles: 25000,
      mot_days_before: 30
    }])

    alert(`Gadi ${reg} add ho gayi!`)
    setNewReg("")
    fetchCars(customerEmail)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/customer/login")
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading My Cars...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Cars - {customerName}</h1>
            <p className="text-sm text-gray-500">{customerEmail}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="font-bold mb-3">Add New Car - Reg Number Daalo</h2>
          <form onSubmit={handleAddCar} className="flex gap-2">
            <input value={newReg} onChange={e => setNewReg(e.target.value)} placeholder="KM66XMY" className="flex-1 p-3 border rounded-lg uppercase" />
            <button className="bg-blue-600 text-white px-6 rounded-lg font-bold">Add Car</button>
          </form>
          <p className="text-xs text-gray-400 mt-2">Example: KM66XMY, AB12CDE</p>
        </div>

        {cars.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-500">Abhi koi gadi nahi - Upar reg daal ke add karo!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cars.map((car) => (
              <div key={car.car_reg} className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-wider">{car.car_reg}</h3>
                  <p className="text-sm text-gray-500">Last: {car.lastMileage} miles | Next Oil: {car.nextOilDue} miles ({car.oilInterval})</p>
                  <p className="text-xs mt-1">
                    {car.lastMileage >= car.nextOilDue - 500 && car.lastMileage < car.nextOilDue && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">⚠ Due in {car.nextOilDue - car.lastMileage} miles</span>}
                    {car.lastMileage >= car.nextOilDue && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">🔴 OVERDUE!</span>}
                    {car.lastMileage < car.nextOilDue - 500 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">✅ OK</span>}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/customer/cars/${car.car_reg}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm text-center">View History</Link>
                  <Link href={`/customer/cars/${car.car_reg}/add-service`} className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-center">+ Add Service</Link>
                  <Link href={`/customer/cars/${car.car_reg}/settings`} className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-center">⚙ Settings (8000)</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
