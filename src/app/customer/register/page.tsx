"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CustomerRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reg, setReg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0,30));
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });
      if (signUpError) throw signUpError;
      
      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email.trim(),
          vehicle_reg: reg.toUpperCase().trim() || null,
        });
        if (profileError) console.log("Profile error (may be RLS):", profileError.message);
      }
      
      router.push("/customer");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">AG</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-[#0f172a] mb-1">Create Account - AI GARAGE</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Customer Registration - Professional</p>
        {email && (
          <div className="mb-4 p-2 bg-green-50 text-green-700 text-xs rounded-lg text-center">
            Typing detected: {email} ✓ Visible!
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Email Address *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Password *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">First Vehicle Registration (Optional)</label>
            <input type="text" value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} placeholder="KM66XMY" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] uppercase" />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-black transition disabled:opacity-50">{loading ? "Creating..." : "Create Account →"}</button>
        </form>
        <div className="mt-6 text-center">
          <a href="/customer/login" className="text-sm font-semibold text-[#0f172a] underline">Already have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
}
