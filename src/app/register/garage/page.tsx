"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export default function RegisterGaragePage() {
  const [form, setForm] = useState({ garage_name: "", owner_name: "", phone: "", address: "", postcode: "", type: "independent_garage", services: "", experience: "" });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!form.garage_name || !form.phone) { alert("Garage Name and Phone required!"); return; }
    setLoading(true);
    const { error } = await supabase.from("garage_registrations").insert({ ...form, status: "pending_approval" });
    if (error) { alert(error.message); setLoading(false); return; }
    alert("✅ Registration Submitted! 24h mein approve karenge. Phir /garage/prices pe prices set kar sakte hain.");
    setLoading(false); window.location.href = "/";
  };
  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4"><div className="max-w-lg w-full">
      <h1 className="text-3xl font-bold mt-8">Register Garage / Mobile Mechanic</h1><p className="text-zinc-400 text-sm mt-2">AI Garage - Independent wale bhi join kar sakte hain</p>
      <div className="mt-8 bg-zinc-900 rounded-3xl p-8 border border-yellow-400/20 space-y-4">
        <div><label className="text-xs text-zinc-500">Type</label><select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm"><option value="independent_garage">Independent Garage (Shop)</option><option value="mobile_mechanic">Mobile Mechanic (Ghar pe)</option><option value="breakdown_specialist">Breakdown Specialist</option></select></div>
        <div><label className="text-xs text-zinc-500">Garage / Your Name *</label><input value={form.garage_name} onChange={e=>setForm({...form, garage_name: e.target.value})} placeholder="Ahmed Mobile Mechanics" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-zinc-500">Owner</label><input value={form.owner_name} onChange={e=>setForm({...form, owner_name: e.target.value})} placeholder="Ahmed" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div><div><label className="text-xs text-zinc-500">Phone *</label><input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="07XXX" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div></div>
        <div><label className="text-xs text-zinc-500">Address</label><input value={form.address} onChange={e=>setForm({...form, address: e.target.value})} placeholder="Glasgow G40 1EU" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div>
        <div><label className="text-xs text-zinc-500">Services</label><textarea value={form.services} onChange={e=>setForm({...form, services: e.target.value})} placeholder="Oil Change, MOT, Mobile Service, Breakdown" className="w-full mt-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm h-20" /></div>
        <button onClick={handleSubmit} disabled={loading} className="w-full mt-2 py-4 bg-yellow-400 text-black rounded-xl font-bold">{loading ? "Submitting..." : "Submit - Join AI Garage"}</button>
        <p className="text-xs text-zinc-500 text-center">Approval ke baad /garage/prices pe prices set karenge</p>
      </div>
    </div></div>
  );
}
