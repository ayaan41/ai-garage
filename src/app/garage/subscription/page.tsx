"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const PLANS = [
  { id: "per_booking_10", name: "Per Booking - 10%", type: "per_booking", price: 0, commission: 10, fixed: 0, desc: "Har booking pe 10% AI Garage lega. Booking nahi to paisa nahi.", popular: false },
  { id: "per_booking_5", name: "Per Booking - £5 Fixed", type: "per_booking", price: 0, commission: 0, fixed: 5, desc: "Har booking pe sirf £5 fixed. £100 ki booking ho ya £500 ki.", popular: true },
  { id: "monthly_49", name: "Monthly - £49 Unlimited", type: "monthly", price: 49, commission: 0, fixed: 0, desc: "£49/month - Unlimited bookings, 0% commission. Zyada bookings wale garages ke liye best.", popular: false },
  { id: "monthly_99", name: "Monthly - £99 Premium", type: "monthly", price: 99, commission: 0, fixed: 0, desc: "£99/month - Unlimited + Homepage pe Sponsored + Priority support", popular: false },
];

export default function SubscriptionPage() {
  const [selected, setSelected] = useState("per_booking_5");
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async () => {
    setLoading(true);
    const plan = PLANS.find(p=>p.id===selected)!;
    const trialEnds = new Date(); trialEnds.setDate(trialEnds.getDate() + 30);
    
    const { error } = await supabase.from("garage_subscriptions").upsert({
      garage_name: "haji auto center",
      plan_type: plan.type,
      plan_name: plan.name,
      monthly_price: plan.price,
      commission_percent: plan.commission,
      commission_fixed: plan.fixed,
      status: "trialing",
      trial_ends_at: trialEnds.toISOString()
    }, { onConflict: "garage_name" });
    
    if (error) { alert(error.message); setLoading(false); return; }
    
    if (plan.type === "monthly") {
      const res = await fetch("/api/stripe/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ garage_name: "haji auto center", plan_id: plan.id, price: plan.price }) });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
    }
    
    alert(`✅ ${plan.name} selected! First 30 Days FREE! Trial ends: ${trialEnds.toLocaleDateString()}. After trial, ${plan.type === 'monthly' ? `£${plan.price}/month` : plan.fixed ? `£${plan.fixed} per booking` : `${plan.commission}% per booking`}`);
    window.location.href = "/garage";
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex justify-center"><div className="max-w-4xl w-full">
      <div className="text-center mt-8"><h1 className="text-3xl font-bold">Choose Your Plan - First Month FREE!</h1><p className="text-zinc-400 text-sm mt-2">Garage wala khud decide kare - Per Booking ya Monthly. 30 din free trial!</p></div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map(p=>(
          <div key={p.id} onClick={()=>setSelected(p.id)} className={`rounded-3xl p-6 border-2 cursor-pointer relative ${selected===p.id ? 'border-yellow-400 bg-yellow-400/10' : 'border-zinc-800 bg-zinc-900'} ${p.popular ? 'ring-2 ring-yellow-400/30' : ''}`}>
            {p.popular && <span className="absolute -top-3 left-6 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold">MOST POPULAR</span>}
            <h3 className="font-bold text-lg">{p.name}</h3><p className="text-xs text-zinc-400 mt-1">{p.desc}</p>
            <div className="mt-4"><span className="text-2xl font-bold text-yellow-400">{p.price===0 ? (p.fixed ? `£${p.fixed}` : `${p.commission}%`) : `£${p.price}`}</span><span className="text-xs text-zinc-500">{p.type==='monthly' ? '/month' : ' per booking'}</span></div>
            <p className="text-xs text-green-400 mt-2 font-bold">✓ First 30 Days FREE - No card needed for trial</p>
            {selected===p.id && <div className="mt-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs">✓</div>}
          </div>
        ))}
      </div>
      <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center">
        <p className="text-sm">Selected: <span className="font-bold text-yellow-400">{PLANS.find(p=>p.id===selected)?.name}</span> - First Month FREE!</p>
        <button onClick={handleSelectPlan} disabled={loading} className="mt-4 w-full md:w-auto px-10 py-4 bg-yellow-400 text-black rounded-xl font-bold text-sm">{loading ? "Setting up..." : "Start 30 Days FREE Trial - Activate Plan"}</button>
        <p className="text-xs text-zinc-500 mt-2">Trial ke baad auto charge hoga - Cancel anytime. Direct bank payout via Stripe Connect.</p>
      </div>
    </div></div>
  );
}
