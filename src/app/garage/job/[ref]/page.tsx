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
        // AAPKA PEHLE WALA SMS API - same use hoga
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

  if(fetchError) return <div className="min-h-screen bg-black text-white p-10"><p className="text-red-400">Supabase Error: {fetchError}</p><p className="text-sm text-zinc-400 mt-2">Supabase → SQL Editor mein ye chalao: <br/><code>alter table bookings disable row level security;</code></p></div>;
  if(!booking) return <div className="min-h-screen bg-black text-white p-10">Loading Job {ref}...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <button onClick={()=>router.push("/garage")} className="text-zinc-400 text-sm mb-4">← Back</button>
      <h1 className="text-2xl font-black">Job Sheet - {ref}</h1>
      <p className="text-zinc-500 text-sm mb-6">{booking.customer_name} | {booking.vehicle_reg || "No Reg"}</p>

      <div className="grid md:grid-cols-2 gap-4 max-w-5xl">
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <p className="font-bold mb-3">Services</p>
          <div className="relative">
            <input value={sSearch} onChange={(e)=>{setSSearch(e.target.value); setShowS(true);}} onFocus={()=>setShowS(true)} onBlur={()=>setTimeout(()=>setShowS(false),200)} placeholder="Type e.g. bra..." className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-sm" />
            {showS && sSearch && (
              <div className="absolute z-20 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl max-h-48 overflow-y-auto">
                {sFiltered.map(s => (
                  <div key={s} onClick={()=>{setServices([...services,{name:s, price:0}]); setSSearch(""); setShowS(false);}} className="p-3 hover:bg-yellow-400 hover:text-black cursor-pointer text-sm">{s}</div>
                ))}
                <div onClick={()=>{setServices([...services,{name:sSearch, price:0}]); setSSearch(""); setShowS(false);}} className="p-3 bg-black text-yellow-400 cursor-pointer text-sm">+ Add Custom "{sSearch}"</div>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {services.map((s:any,i:number)=>(
              <div key={i} className="flex gap-2 items-center">
                <span className="flex-1 bg-black p-2 rounded-lg text-sm border border-zinc-800">{s.name}</span>
                <input type="number" value={s.price} onChange={(e)=>{const c=[...services]; c[i].price=e.target.value; setServices(c);}} placeholder="£" className="w-20 p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                <button onClick={()=>setServices(services.filter((_:any,idx:number)=>idx!==i))} className="text-red-400 text-sm">X</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <p className="font-bold mb-3">Parts (Linked to your Shop)</p>
          <div className="relative">
            <input value={pSearch} onChange={(e)=>{setPSearch(e.target.value); setShowP(true);}} onFocus={()=>setShowP(true)} onBlur={()=>setTimeout(()=>setShowP(false),200)} placeholder="Type e.g. brake..." className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-sm" />
            {showP && pSearch && (
              <div className="absolute z-20 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl max-h-48 overflow-y-auto">
                {pFiltered.map(s => (
                  <div key={s} onClick={()=>{setParts([...parts,{name:s, price:0}]); setPSearch(""); setShowP(false);}} className="p-3 hover:bg-yellow-400 hover:text-black cursor-pointer text-sm">{s}</div>
                ))}
                <div onClick={()=>{setParts([...parts,{name:pSearch, price:0}]); setPSearch(""); setShowP(false);}} className="p-3 bg-black text-yellow-400 cursor-pointer text-sm">+ Add Custom "{pSearch}"</div>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {parts.map((s:any,i:number)=>(
              <div key={i} className="flex gap-2 items-center">
                <span className="flex-1 bg-black p-2 rounded-lg text-sm border border-zinc-800">{s.name}</span>
                <input type="number" value={s.price} onChange={(e)=>{const c=[...parts]; c[i].price=e.target.value; setParts(c);}} placeholder="£" className="w-20 p-2 bg-black border border-zinc-700 rounded-lg text-sm" />
                <button onClick={()=>setParts(parts.filter((_:any,idx:number)=>idx!==i))} className="text-red-400 text-sm">X</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mt-4 bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
        <p className="font-bold mb-4">Pricing + Automation</p>
        <div className="grid grid-cols-3 gap-3">
          <div><p className="text-xs text-zinc-500 mb-1">Labour Hours</p><input type="number" value={labourHours} onChange={(e)=>setLabourHours(parseFloat(e.target.value)||0)} className="w-full p-3 bg-black border border-zinc-700 rounded-xl" /></div>
          <div><p className="text-xs text-zinc-500 mb-1">Rate £/hr</p><input type="number" value={labourRate} onChange={(e)=>setLabourRate(parseFloat(e.target.value)||0)} className="w-full p-3 bg-black border border-zinc-700 rounded-xl" /></div>
          <div className="flex flex-col justify-end gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxiReq} onChange={(e)=>setTaxiReq(e.target.checked)} />Taxi Required?</label>{taxiReq && <input type="number" value={taxiCost} onChange={(e)=>setTaxiCost(parseFloat(e.target.value)||0)} placeholder="Taxi £" className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-sm" />}</div>
        </div>
        <div className="mt-4 bg-black rounded-xl p-4 text-sm space-y-2 border border-zinc-800">
          <div className="flex justify-between"><span>Services</span><span>£{serviceTotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Parts</span><span>£{partsTotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Labour ({labourHours}h × £{labourRate})</span><span>£{labourTotal.toFixed(2)}</span></div>
          {taxiReq && <div className="flex justify-between"><span>Taxi</span><span>£{taxiCost.toFixed(2)}</span></div>}
          <div className="flex justify-between font-black text-base border-t border-zinc-700 pt-2"><span>Grand Total</span><span className="text-yellow-400">£{grandTotal.toFixed(2)}</span></div>
        </div>
        <p className="text-xs text-zinc-500 mt-3">Mechanic Notes</p>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Brakes changed, test drive done..." className="w-full mt-1 p-3 bg-black border border-zinc-700 rounded-xl h-20 text-sm"></textarea>
        <button disabled={loading} onClick={()=>save(true)} className="w-full mt-4 py-4 bg-yellow-400 text-black rounded-xl font-black disabled:opacity-50">{loading? "Saving..." : "Save & Send to Customer (Auto SMS + Invoice)"}</button>
        <button disabled={loading} onClick={()=>save(false)} className="w-full mt-2 py-3 bg-zinc-800 rounded-xl text-sm disabled:opacity-50">Save Draft Only</button>
      </div>
    </div>
  );
}