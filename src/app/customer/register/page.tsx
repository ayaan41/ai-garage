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
      created_at: new Date()
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Customer Register</h1>
        <p className="text-gray-500 text-sm mb-6">Apni gadiyon ki history ke liye register karo - Simple!</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded-lg" onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full p-3 border rounded-lg" onChange={e => setForm({...form, email: e.target.value})} />
          <input type="tel" placeholder="Phone" required className="w-full p-3 border rounded-lg" onChange={e => setForm({...form, phone: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-3 border rounded-lg" onChange={e => setForm({...form, password: e.target.value})} />
          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
            {loading ? "Register ho raha hai..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already registered? <Link href="/customer/login" className="text-blue-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  )
}
