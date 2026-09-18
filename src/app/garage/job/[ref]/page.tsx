"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function GarageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/bookings/${jobId}`);
        const data = await res.json();
        const b = data.booking || data;
        setJob(b);
        if (b?.quote_price) setPrice(b.quote_price);
        if (b?.quote_notes) setNotes(b.quote_notes);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  const sendQuote = async () => {
    if (!price) { alert("Enter price"); return; }
    setSending(true);
    try {
      const res = await fetch(`/api/bookings/${jobId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_price: price, quote_notes: notes, status: "quote_sent" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");
      alert("Quote sent! SMS auto - Customer will approve");
      router.push("/garage");
    } catch (e: any) { alert(e.message); }
    setSending(false);
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${jobId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setJob({...job, status: newStatus });
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="min-h-screen bg-[#050507] text-white p-8"><div className="glass rounded- p-8 text-center text-white/30">Loading job... Aurora visible...</div></div>;

  return (
    <div className="min-h-screen text-white flex justify-center p-4 pb-24">
      <div className="w-full max-w-">
        <div className="mt-6 glass rounded- px-5 py-3 flex justify-between items-center">
          <button onClick={() => router.back()} className="text- font-bold glass px-3 py-1 rounded-full">← Back</button>
          <div className="text- font-black tracking-widest">JOB • {jobId.slice(0,8)}</div>
          <div className="text- bg-[#FFC61C]/20 text-[#FFC61C] px-2 py-1 rounded-full font-black border border-[#FFC61C]/20">{job?.status?.toUpperCase()}</div>
        </div>

        <div className="mt-6 glass rounded- p-5">
          <div className="text- text-white/30 font-black tracking-widest uppercase">Customer Details</div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between"><span className="text- text-white/40">Car Reg</span><span className="text- font-black tracking-wider">{job?.car_reg}</span></div>
            <div className="flex justify-between"><span className="text- text-white/40">Service</span><span className="text- font-bold">{job?.service_type}</span></div>
            <div className="flex justify-between"><span className="text- text-white/40">Date/Time</span><span className="text- font-bold">{job?.booking_date} at {job?.time_slot}</span></div>
            <div className="flex justify-between"><span className="text- text-white/40">Name</span><span className="text- font-bold">{job?.customer_name}</span></div>
            <div className="flex justify-between"><span className="text- text-white/40">Phone</span><span className="text- font-bold text-[#FFC61C]">{job?.phone}</span></div>
          </div>
        </div>

        <div className="mt-6 glass rounded- p-5 border border-[#FFC61C]/10">
          <div className="text- text-[#FFC61C] font-black tracking-widest uppercase">💷 Send Quote • Real Prices • UK 10k Logic</div>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="£ Price e.g. 120" className="w-full glass-input rounded- p-4 mt-3 text-white font-black text- outline-none" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes: UK 10k oil, verified parts, 12 months warranty..." className="w-full glass-input rounded- p-4 mt-3 text-white text- outline-none h- resize-none" />
          <button onClick={sendQuote} disabled={sending} className="w-full bg-[#FFC61C] text-black h- rounded- font-black text- mt-3 shadow-[0_0_20px_rgba(255,198,28,0.4)] disabled:opacity-50">
            {sending? "Sending... SMS auto" : `Send Quote - £${price || "0"}`}
          </button>
          <p className="text- text-white/30 mt-2 text-center">Quote ke baad customer ko SMS auto - No upfront payment</p>
        </div>

        <div className="mt-6 glass rounded- p-5">
          <div className="text- text-white/40 font-black tracking-widest uppercase">Update Status • 90% Automated</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { id: "approved", label: "✅ Approved" },
              { id: "in_progress", label: "🔧 In Progress" },
              { id: "completed", label: "🏁 Completed" },
              { id: "collected", label: "🚗 Collected" },
            ].map(s => (
              <button key={s.id} onClick={() => updateStatus(s.id)} className={`p-3 rounded- border text- font-bold ${job?.status === s.id? "bg-[#FFC61C] text-black border-[#FFC61C]" : "glass text-white/50 hover:!bg-white/[0.05]"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 glass rounded- p-3 text-center text- text-white/20 font-bold tracking-widest uppercase">
          Ultra Clear 1.5% • Aurora 900px blur 130px • Gears visible • Glass blur 52px
        </div>
      </div>
    </div>
  );
}