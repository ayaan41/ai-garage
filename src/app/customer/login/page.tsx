"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (authError) throw authError;
      router.push("/customer");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border">
        <div className="flex justify-center mb-6"><div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center"><span className="text-white font-bold text-sm">AG</span></div></div>
        <h1 className="text-2xl font-bold text-center text-[#0f172a] mb-1">Welcome Back - AI GARAGE</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Customer Login - Professional</p>
        {email && <div className="mb-4 p-2 bg-green-50 text-green-700 text-xs rounded-lg text-center">Typing detected: {email} ✓ Visible!</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="block text-sm font-semibold text-[#0f172a] mb-2">Email Address *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black bg-white" required /></div>
          <div><label className="block text-sm font-semibold text-[#0f172a] mb-2">Password *</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black bg-white" required /></div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#0f172a] text-white font-semibold py-3 rounded-xl hover:bg-black transition disabled:opacity-50">{loading ? "Signing in..." : "Sign In →"}</button>
        </form>
        <div className="mt-6 text-center"><a href="/customer/register" className="text-sm font-semibold text-[#0f172a] underline">Don't have an account? Create Account</a></div>
      </div>
    </div>
  );
}
