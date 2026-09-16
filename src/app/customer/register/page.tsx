"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function CustomerRegister() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { data: existing } = await supabase.from("profiles").select("*").eq("email", form.email).single()
    if (existing) {
      alert("Email already registered! Login karo.")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("profiles").insert([{
      email: form.email,
      name: form.name,
      phone: form.phone,
      password: form.password,
      role: "customer",
      created_at: new Date().toISOString()
    }])

    if (error) {
      alert("Error: " + error.message)
      setLoading(false)
      return
    }

    localStorage.setItem("customer_email", form.email)
    localStorage.setItem("customer_name", form.name)
    localStorage.setItem("user_role", "customer")

    alert("Register ho gaya! My Cars pe ja rahe ho.")
    router.push("/customer")
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0a0a0a]">
      {/* Left - Same Black Branding */}
      <div className="hidden lg:flex w-[55%] bg-[#111] relative flex-col justify-between p-12">
        <div>
          <h1 className="text-white text- font-black tracking-tighter">HAJI AUTO CENTER</h1>
          <p className="text-white/40 text- tracking-[0.2em] mt-1">UK • 10K STANDARD • GLASGOW</p>
        </div>
        <div>
          <h2 className="text-white text- font-black leading-[0.9] tracking-tighter">
            Join<br />the<br /><span className="text-[#ffcc00]">family.</span>
          </h2>
          <p className="text-white/50 text- mt-6 max-w-">Apni gadiyon ki history ke liye register karo - Simple!</p>
        </div>
        <div className="h-1 w-8 bg-[#ffcc00] rounded-full"></div>
      </div>

      {/* Right - Your Same Logic With Premium Card */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f6f6f7]">
        <div className="w-full max-w-">
          <div className="lg:hidden mb-8"><h1 className="text-black text- font-black tracking-tighter">HAJI AUTO CENTER</h1></div>

          <div className="bg-white rounded- p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-black/[0.06]">
            <h1 className="text- font-black text-black tracking-[-0.02em] leading-none">Customer Register</h1>
            <p className="text- text-[#6e6e73] mt-3 font-medium">Apni gadiyon ki history ke liye register karo - Simple!</p>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <div>
                <label className="text- font-black tracking-widest text-black/60 mb-2 block uppercase">Full Name</label>
                <input type="text" placeholder="Muhammad Mubeen" required className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all" onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="text- font-black tracking-widest text-black/60 mb-2 block uppercase">Email</label>
                <input type="email" placeholder="you@email.com" required className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all" onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="text- font-black tracking-widest text-black/60 mb-2 block uppercase">Phone</label>
                <input type="tel" placeholder="07XXX XXXXXX" required className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all" onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="text- font-black tracking-widest text-black/60 mb-2 block uppercase">Password</label>
                <input type="password" placeholder="••••••••" required className="w-full h- px-4 rounded- bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black text-black text- font-medium outline-none transition-all" onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <button disabled={loading} className="w-full h- bg-black text-white font-bold rounded- hover:bg-[#222] transition-all text- mt-2">
                {loading? "Register ho raha hai..." : "Register →"}
              </button>
            </form>

            <p className="text-center mt-8 text- text-[#6e6e73]">
              Already registered? <Link href="/customer/login" className="text-black font-black underline decoration-2 underline-offset-4">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}