"use client";
import { useState } from "react";
export default function StripeConnectPage() {
  const [loading, setLoading] = useState(false);
  const handleConnect = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ garage_name: "haji auto center" }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url; else { alert(JSON.stringify(data)); setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4"><div className="max-w-md w-full mt-10">
      <h1 className="text-2xl font-bold">Connect Bank - Direct Payments</h1><p className="text-sm text-zinc-400 mt-2">Customer ka paisa direct tumhare bank mein ayega - AI Garage 10% commission lega</p>
      <div className="mt-6 bg-zinc-900 rounded-2xl p-6 border border-yellow-400/20">
        <p className="text-sm">🔒 Stripe Connect - Secure</p><p className="text-xs text-zinc-500 mt-2">✓ Customer £100 pay karega</p><p className="text-xs text-zinc-500">✓ £90 direct tumhare bank mein (instant)</p><p className="text-xs text-zinc-500">✓ £10 AI Garage commission auto cut</p><p className="text-xs text-zinc-500">✓ Tumhe payout nahi karna padega</p>
        <button onClick={handleConnect} disabled={loading} className="w-full mt-6 py-4 bg-yellow-400 text-black rounded-xl font-bold">{loading ? "Connecting..." : "Connect Your Bank Account"}</button>
        <p className="text-xs text-zinc-600 mt-2 text-center">Tumhara Stripe account dosri company ka hai to bhi chalega - har garage apna alag bank connect karega</p>
      </div>
    </div></div>
  );
}
