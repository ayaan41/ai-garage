"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type Template = { id?: string; garage_name: string; service_name: string; price: number; duration_minutes: number; description: string; };
export default function PriceTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ service_name: "", price: 0, duration_minutes: 60, description: "" });
  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase.from("garage_price_templates").select("*").eq("garage_name", "haji auto center").order("service_name");
    if (data) setTemplates(data); setLoading(false);
  };
  useEffect(() => { fetchTemplates(); }, []);
  const addTemplate = async () => {
    if (!newService.service_name || !newService.price) { alert("Service name and price required"); return; }
    const { error } = await supabase.from("garage_price_templates").insert({ garage_name: "haji auto center", ...newService });
    if (error) { alert(error.message); return; }
    setNewService({ service_name: "", price: 0, duration_minutes: 60, description: "" }); fetchTemplates();
  };
  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete?")) return; await supabase.from("garage_price_templates").delete().eq("id", id); fetchTemplates();
  };
  const updatePrice = async (id: string, newPrice: number) => {
    await supabase.from("garage_price_templates").update({ price: newPrice }).eq("id", id); fetchTemplates();
  };
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8"><div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8"><div><h1 className="text-2xl font-bold">haji auto center</h1><p className="text-yellow-400 text-sm font-bold">Price Templates - AI System</p><p className="text-zinc-500 text-xs mt-1">Set your fixed prices once - AI will use them for auto quotes</p></div><a href="/garage" className="px-4 py-2 bg-zinc-800 rounded-xl text-sm">← Garage Dashboard</a></div>
      <div className="bg-zinc-900 rounded-2xl p-6 border border-yellow-400/20 mb-8"><h2 className="font-bold text-yellow-400 mb-4">+ Add New Service Price</h2><div className="grid grid-cols-1 md:grid-cols-4 gap-3"><input value={newService.service_name} onChange={e=>setNewService({...newService, service_name: e.target.value})} placeholder="Service Name" className="bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm col-span-2" /><input type="number" value={newService.price} onChange={e=>setNewService({...newService, price: parseFloat(e.target.value)||0})} placeholder="Price £" className="bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /><input type="number" value={newService.duration_minutes} onChange={e=>setNewService({...newService, duration_minutes: parseInt(e.target.value)||60})} placeholder="Mins" className="bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /></div><input value={newService.description} onChange={e=>setNewService({...newService, description: e.target.value})} placeholder="Description" className="w-full mt-3 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm" /><button onClick={addTemplate} className="mt-4 w-full md:w-auto px-8 py-3 bg-yellow-400 text-black rounded-xl font-bold">Add Price Template</button></div>
      {loading ? <p className="text-zinc-500">Loading...</p> : (<div className="space-y-3">{templates.map(t=>(<div key={t.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex justify-between items-center"><div><p className="font-bold">{t.service_name}</p><p className="text-xs text-zinc-500">{t.description} • {t.duration_minutes} mins</p></div><div className="flex items-center gap-3"><div className="flex items-center gap-2 bg-black border border-zinc-700 rounded-xl px-3 py-2"><span className="text-xs">£</span><input type="number" defaultValue={t.price} onBlur={e=>updatePrice(t.id!, parseFloat(e.target.value))} className="bg-transparent w-16 text-sm font-bold" /></div><button onClick={()=>deleteTemplate(t.id!)} className="w-8 h-8 bg-red-500/20 text-red-400 rounded-full text-xs">✕</button></div></div>))}</div>)}
    </div></div>
  );
}
