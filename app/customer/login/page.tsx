"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function CustomerLogin() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.from("profiles").select("*").eq("email", form.email).eq("password", form.password).eq("role", "customer").single()

    if (error || !data) {
      alert("Email ya password galat hai!")
      setLoading(false)
      return
    }

    localStorage.setItem("customer_email", data.email)
    localStorage.setItem("customer_name", data.name)
    localStorage.setItem("user_role", "customer")
    
    alert("Login ho gaya!")
    router.push("/customer")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Customer Login</h1>
        <p className="text-gray-500 text-sm mb-6">Apni cars ki history dekho</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full p-3 border rounded-lg" onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-3 border rounded-lg" onChange={e => setForm({...form, password: e.target.value})} />
          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">
            {loading ? "Login ho raha hai..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Account nahi hai? <Link href="/customer/register" className="text-blue-600 font-bold">Register</Link>
        </p>
      </div>
    </div>
  )
}
