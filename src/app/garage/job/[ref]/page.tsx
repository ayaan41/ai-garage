"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const allServices = ["MOT","Full Service","Interim Service","Oil Change","Oil Filter","Brake Pads","Brake Discs","Brake Fluid","Brake Caliper","Tyre Change","Puncture Repair","Wheel Balancing","Battery Replacement","Alternator","Starter Motor","Clutch Kit","Timing Belt","Head Gasket","Diagnostics","AC Gas Fill","Exhaust Repair","Suspension","Steering Rack","Coolant Flush"];
const allPartsList = ["Brake Pads","Brake Discs","Oil Filter","Air Filter","Cabin Filter","Fuel Filter","Spark Plug","Timing Belt","Battery","Clutch Kit","Tyre","Wiper Blades","Headlight Bulb","Brake Fluid","Engine Oil 5W30"];

export default function JobSheet() {
  const { ref } = useParams() as any;
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [labourHours, setLabourHours] = useState(1);
  const [labourRate, setLabourRate] = useState(50);
  const [taxiReq, setTaxiReq] = useState(false);
  const [taxiCost, setTaxiCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [sSearch, setSSearch] = useState("");
  const [pSearch, setPSearch] = useState("");
  const [showS, setShowS] = useState(false);
  const [showP, setShowP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
      if(error){ console.error(error); setFetchError(error.message); }
      if(data){
        setBooking(data);
        setServices(data.services || []);
        setParts(data.parts_used || []);
        setLabourHours(data.labour_hours || 1);
        setLabourRate(data.labour_rate || 50);
        setNotes(data.mechanic_notes || "");
        setTaxiReq(data.taxi_required || false);
        setTaxiCost(data.taxi_cost || 0);
      }
    };
    if(ref) fetchBooking();
  }, [ref]);

  const sFiltered = allServices.filter(s => s.toLowerCase().includes(sSearch.toLowerCase()));
  const pFiltered = allPartsList.filter(s => s.toLowerCase().includes(pSearch.toLowerCase()));

  const serviceTotal = services.reduce((a:any,b:any)=>a+(parseFloat(b.price)||0),0);
  const partsTotal = parts.reduce((a:any,b:any)=>a+(parseFloat(b.price)||0),0);
  const labourTotal = labourHours * labourRate;
  const grandTotal = serviceTotal + partsTotal + labourTotal + (taxiReq? taxiCost : 0);

  const save = async (sendSms=false) => {
    setLoading(true);
    try {
      const payload: any = {
        services, parts_used: parts, labour_hours: labourHours, labour_rate: labourRate,
        total_price: grandTotal, mechanic_notes: notes, taxi_required: taxiReq, taxi_cost: taxiCost,
        status: sendSms? "ready" : "in_progress",
        updated_at: new Date().toISOString()
      };
      console.log("Saving:", payload);
      const { data, error } = await supabase.from("bookings").update(payload).eq("booking_ref", ref).select();
      if(error) throw error;
      console.log("Saved OK:", data);

      if(sendSms){
        try {
          await fetch("/api/send-sms", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              phone: booking.phone,
              booking_ref: ref,
              message: `Haji Auto: Your job ${ref} is ready! Total £${grandTotal.toFixed(2)}. Invoice: /invoice/${ref}`
            })
          });
        } catch(e){ console.log("SMS API error (ignore for now):", e); }
      }

      alert(sendSms? `Saved & Ready! Total £${grandTotal.toFixed(2)}` : `Draft Saved! £${grandTotal.toFixed(2)}`);
      if(sendSms) router.push("/garage");
    } catch(e:any){
      alert("Save Error: " + e.message + " - RLS check karo!");
      console.error(e);
    }
    setLoading(false);
  };

  if(fetchError) return <div className="min-h-screen bg-[#0a0a0a] text-white p-10"><p className="text-red-400 font-black">Supabase Error: {fetchError}</p><p className="text- text-white/50 mt-3 bg-[#151515] p-4 rounded-xl border border-white/5">Supabase → SQL Editor mein ye chalao: <br/><code className="text-[#ffcc00]">alter table bookings disable row level security;</code></p></div>;
  if(!booking) return <div className="min-h-screen bg-[#0a0a0a] text-white p-10 flex items-center gap-3"><div className="w-6 h-6 border-2 border-white/10 border-t-[#ffcc00] rounded-full animate-spin"></div> Loading Job {ref}...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w- mx-auto p-5 md:p-8">
        <button onClick={()=>router.push("/garage")} className="inline-flex items-center gap-2 text- font-black tracking-widest uppercase text-white/40 hover:text-white bg-white/5 px-4 py-2 rounded-full border border-white/5 mb-6">← Back to Garage</button>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="flex gap-4">
            <div className="w-2 h-14 bg-[#ffcc00] rounded-full"></div>
            <div>
              <h1 className="text- font-black tracking-tighter leading-none uppercase">Job Sheet - {ref}</h1>
              <p className="text- text-white/50 mt-2 font-medium">{booking.customer_name} | <span className="bg-[#ffcc00] text-black px-2 py-0.5 rounded- font-black tracking-wider ml-1">{booking.vehicle_reg || "No Reg"}</span> | {booking.phone}</p>
            </div>
          </div>
          <div className="bg-[#151515] border border-white/5 rounded- px-5 py-3">
            <p className="text- font-black tracking-widest text-white/30 uppercase">Grand Total</p>
            <p className="text- font-black text-[#ffcc00] leading-none mt-1">£{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl">
          <div className="bg-[#151515] rounded- p-6 border border-white/5">
            <p className="font-black text- tracking-widest uppercase mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full"></span> Services</p>
            <div className="relative">
              <input value={sSearch} onChange={(e)=>{setSSearch(e.target.value); setShowS(true);}} onFocus={()=>setShowS(true)} onBlur={()=>setTimeout(()=>setShowS(false),200)} placeholder="Type e.g. brake, oil..." className="w-full h- px-4 bg-black border border-white/10 rounded- text- font-medium focus:border-[#ffcc00]/50 outline-none" />
              {showS && sSearch && (
                <div className="absolute z-20 w-full mt-2 bg-[#1e1e1e] border border-white/10 rounded- max-h-48 overflow-y-auto shadow-2xl">
                  {sFiltered.map(s => (
                    <div key={s} onClick={()=>{setServices([...services,{name:s, price:0}]); setSSearch(""); setShowS(false);}} className="p-3.5 hover:bg-[#ffcc00] hover:text-black cursor-pointer text- font-medium transition-colors">{s}</div>
                  ))}
                  <div onClick={()=>{setServices([...services,{name:sSearch, price:0}]); setSSearch(""); setShowS(false);}} className="p-3.5 bg-black text-[#ffcc00] cursor-pointer text- font-black">+ Add Custom "{sSearch}"</div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {services.map((s:any,i:number)=>(
                <div key={i} className="flex gap-2 items-center group">
                  <span className="flex-1 bg-black p-3 rounded- text- font-bold border border-white/5 group-hover:border-white/10">{s.name}</span>
                  <div className="relative w-24"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text- text-white/30">£</span><input type="number" value={s.price} onChange={(e)=>{const c=[...services]; c[i].price=e.target.value; setServices(c);}} placeholder="0" className="w-full h- pl-6 pr-2 bg-black border border-white/10 rounded- text- font-black" /></div>
                  <button onClick={()=>setServices(services.filter((_:any,idx:number)=>idx!==i))} className="w-8 h-8 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded- text- font-black">✕</button>
                </div>
              ))}
              {services.length===0 && <p className="text- text-white/20 text-center py-4 font-medium">No services added yet</p>}
            </div>
          </div>

          <div className="bg-[#151515] rounded- p-6 border border-white/5">
            <p className="font-black text- tracking-widest uppercase mb-4 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#00d084] rounded-full"></span> Parts (Linked to your Shop)</p>
            <div className="relative">
              <input value={pSearch} onChange={(e)=>{setPSearch(e.target.value); setShowP(true);}} onFocus={()=>setShowP(true)} onBlur={()=>setTimeout(()=>setShowP(false),200)} placeholder="Type e.g. brake pads..." className="w-full h- px-4 bg-black border border-white/10 rounded- text- font-medium focus:border-[#00d084]/50 outline-none" />
              {showP && pSearch && (
                <div className="absolute z-20 w-full mt-2 bg-[#1e1e1e] border border-white/10 rounded- max-h-48 overflow-y-auto shadow-2xl">
                  {pFiltered.map(s => (
                    <div key={s} onClick={()=>{setParts([...parts,{name:s, price:0}]); setPSearch(""); setShowP(false);}} className="p-3.5 hover:bg-[#00d084] hover:text-black cursor-pointer text- font-medium transition-colors">{s}</div>
                  ))}
                  <div onClick={()=>{setParts([...parts,{name:pSearch, price:0}]); setPSearch(""); setShowP(false);}} className="p-3.5 bg-black text-[#00d084] cursor-pointer text- font-black">+ Add Custom "{pSearch}"</div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {parts.map((s:any,i:number)=>(
                <div key={i} className="flex gap-2 items-center group">
                  <span className="flex-1 bg-black p-3 rounded- text- font-bold border border-white/5 group-hover:border-white/10">{s.name}</span>
                  <div className="relative w-24"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text- text-white/30">£</span><input type="number" value={s.price} onChange={(e)=>{const c=[...parts]; c[i].price=e.target.value; setParts(c);}} placeholder="0" className="w-full h- pl-6 pr-2 bg-black border border-white/10 rounded- text- font-black" /></div>
                  <button onClick={()=>setParts(parts.filter((_:any,idx:number)=>idx!==i))} className="w-8 h-8 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded- text- font-black">✕</button>
                </div>
              ))}
              {parts.length===0 && <p className="text- text-white/20 text-center py-4 font-medium">No parts added yet</p>}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mt-5 bg-[#151515] rounded- p-6 border border-white/5">
          <p className="font-black text- tracking-widest uppercase mb-5 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-white rounded-full"></span> Pricing + Automation</p>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text- font-black tracking-widest uppercase text-white/30 mb-2">Labour Hours</p><input type="number" value={labourHours} onChange={(e)=>setLabourHours(parseFloat(e.target.value)||0)} className="w-full h- px-4 bg-black border border-white/10 rounded- text- font-black" /></div>
            <div><p className="text- font-black tracking-widest uppercase text-white/30 mb-2">Rate £/hr</p><input type="number" value={labourRate} onChange={(e)=>setLabourRate(parseFloat(e.target.value)||0)} className="w-full h- px-4 bg-black border border-white/10 rounded- text- font-black" /></div>
            <div className="flex flex-col justify-end gap-2"><label className="flex items-center gap-2 text- font-bold bg-black border border-white/10 rounded- px-3 h-"><input type="checkbox" checked={taxiReq} onChange={(e)=>setTaxiReq(e.target.checked)} className="accent-[#ffcc00]" />Taxi Required?</label>{taxiReq && <input type="number" value={taxiCost} onChange={(e)=>setTaxiCost(parseFloat(e.target.value)||0)} placeholder="Taxi £" className="w-full h- px-3 bg-black border border-white/10 rounded- text- font-black" />}</div>
          </div>
          <div className="mt-5 bg-black rounded- p-4 text- space-y-2.5 border border-white/5">
            <div className="flex justify-between text-white/60"><span>Services</span><span className="font-bold text-white">£{serviceTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-white/60"><span>Parts</span><span className="font-bold text-white">£{partsTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-white/60"><span>Labour ({labourHours}h × £{labourRate})</span><span className="font-bold text-white">£{labourTotal.toFixed(2)}</span></div>
            {taxiReq && <div className="flex justify-between text-white/60"><span>Taxi</span><span className="font-bold text-white">£{taxiCost.toFixed(2)}</span></div>}
            <div className="flex justify-between font-black text- border-t border-white/10 pt-3 mt-3"><span>Grand Total</span><span className="text-[#ffcc00] text-">£{grandTotal.toFixed(2)}</span></div>
          </div>
          <p className="text- font-black tracking-widest uppercase text-white/30 mt-5 mb-2">Mechanic Notes</p>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Brakes changed, test drive done, oil topped up..." className="w-full p-4 bg-black border border-white/10 rounded- h-24 text- font-medium focus:border-white/20 outline-none"></textarea>
          <button disabled={loading} onClick={()=>save(true)} className="w-full mt-4 h- bg-[#ffcc00] text-black rounded- font-black text- disabled:opacity-50 hover:bg-[#ffd500] transition-all shadow-[0_8px_20px_rgba(255,204,0,0.3)] active:scale-[0.98]">{loading? "Saving..." : "Save & Send to Customer (Auto SMS + Invoice)"}</button>
          <button disabled={loading} onClick={()=>save(false)} className="w-full mt-2 h- bg-white/5 border border-white/10 rounded- text- font-bold disabled:opacity-50 hover:bg-white/10 transition-all">Save Draft Only - Still In Progress</button>
        </div>
      </div>
    </div>
  );
}