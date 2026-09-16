"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function CustomerPage() {
  const [cars, setCars] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [regInput, setRegInput] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const e = localStorage.getItem("customer_email") || ""
    setEmail(e)
    if (e) fetchCars(e)
    else setLoading(false)
  }, [])

  const fetchCars = async (ownerEmail: string) => {
    setLoading(true)
    const { data } = await supabase.from("cars").select("*").eq("original_owner_email", ownerEmail).order("created_at", { ascending: false })
    setCars(data || [])
    setLoading(false)
  }

  const addCar = async () => {
    if (!regInput) { alert("Reg daalo"); return }
    const cleanReg = regInput.toUpperCase().replace(/\s/g,"")
    const { error } = await supabase.from("cars").insert([{ car_reg: cleanReg, original_owner_email: email, is_public: false }])
    if (error) alert(error.message)
    else { setRegInput(""); fetchCars(email); alert(`✅ ${cleanReg} Added!`) }
  }

  if (!email) {
    return (
      <div className="min-h-screen w-full flex bg-[#0a0a0a]">
        <div className="hidden lg:flex w-[55%] bg-[#111] p-12 flex-col justify-between">
          <div><h1 className="text-white text- font-black tracking-tighter">HAJI AUTO CENTER</h1><p className="text-white/40 text- tracking-[0.2em] mt-1">UK • 10K STANDARD • GLASGOW</p></div>
          <div><h2 className="text-white text- font-black leading-[0.9] tracking-tighter">Your<br/>cars,<br/><span className="text-[#ffcc00]">secure.</span></h2></div>
          <div className="h-1 w-8 bg-[#ffcc00] rounded-full"></div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-[#f6f6f7]">
          <div className="w-full max-w- bg-white rounded- p-8 shadow-xl border border-black/5 text-center">
            <h1 className="font-black text- text-black tracking-tighter">Customer Login</h1>
            <p className="text- text-gray-500 mt-2">Email daalo - Cars dekho</p>
            <input id="emailInput" placeholder="mubeen@email.com" className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black outline-none text-black mt-6 text-" />
            <button onClick={() => {
              const val = (document.getElementById('emailInput') as HTMLInputElement).value
              if(val){ localStorage.setItem("customer_email", val); setEmail(val); fetchCars(val) }
            }} className="w-full bg-black text-white h- rounded- mt-4 font-bold hover:bg-[#222]">Login →</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Header */}
      <div className="bg-[#0a0a0a] text-white px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text- font-black tracking-[0.2em] text-white/40 uppercase">My Garage</h1>
            <p className="text- font-black tracking-tighter mt-1 leading-none">{email}</p>
          </div>
          <button onClick={()=>{localStorage.clear(); setEmail(""); setCars([])}} className="h- px-5 rounded-full bg-white/10 hover:bg-white/15 text-white text- font-bold border border-white/10">Logout</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
        {/* Add Car */}
        <div className="bg-white rounded- p-5 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex gap-3">
          <div className="flex-1">
            <label className="text- font-black tracking-widest text-black/40 uppercase mb-2 block">UK Registration</label>
            <input value={regInput} onChange={e=>setRegInput(e.target.value)} placeholder="KM66XMY" className="w-full h- px-4 rounded- bg-[#ffcc00] border-2 border-black text-black font-black text- tracking-[0.15em] uppercase placeholder:text-black/30 outline-none focus:border-black" />
          </div>
          <div className="flex items-end">
            <button onClick={addCar} className="h- px-8 bg-black text-white rounded- font-black text- hover:bg-[#222]">+ Add</button>
          </div>
        </div>

        {loading? <p className="mt-12 text-center text-gray-400 font-medium">Loading your cars...</p> : (
          <div className="grid gap-4 mt-8">
            {cars.length===0 && <div className="bg-white rounded- p-12 text-center border border-black/5"><p className="font-bold text-black">No cars yet</p><p className="text- text-gray-500 mt-1">Add your first registration above</p></div>}
            {cars.map(car=>(
              <Link key={car.car_reg} href={`/customer/cars/${car.car_reg}`} className="group bg-white p-6 rounded- border border-black/5 flex justify-between items-center hover:border-black hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w- h- bg-[#ffcc00] border-2 border-black rounded- flex items-center justify-center font-black text- tracking-wider text-black">{car.car_reg}</div>
                  <div><p className="font-black text- text-black tracking-wide">{car.car_reg}</p><p className="text- font-bold mt-1 ${car.is_public? 'text-green-600' : 'text-gray-400'}">{car.is_public? '🌍 Public • Anyone can view' : '🔒 Private • Only you'}</p></div>
                </div>
                <span className="text- font-black text-black group-hover:translate-x-1 transition-transform">View →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}