"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const garageId = params.id as string;

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("15:00");
  const [carReg, setCarReg] = useState("KM77YHK");
  const [selectedServices, setSelectedServices] = useState<string[]>(["Oil Change"]);
  const [name, setName] = useState("ahmadd");
  const [phone, setPhone] = useState("09989897677");
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const getDays = () => {
    const y = currentMonth.getFullYear(), m = currentMonth.getMonth();
    const first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
    const arr: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(y, m, d));
    return arr;
  };

  const timeSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  const services = ["MOT","Full Service","Interim Service","Brake Check","Engine Diagnostics","Oil Change"];

  const isPast = (d: Date) => { const a = new Date(); a.setHours(0,0,0,0); const b = new Date(d); b.setHours(0,0,0,0); return b < a; };
  const isToday = (d: Date) => new Date().toDateString() === d.toDateString();
  const isSelected = (d: Date) => selectedDate?.toDateString() === d.toDateString();

  const isTimePast = (timeStr: string, date: Date | null) => {
    if (!date ||!isToday(date)) return false;
    const [h, m] = timeStr.split(":").map(Number);
    const slot = new Date(); slot.setHours(h, m, 0, 0);
    return slot.getTime() <= now.getTime();
  };

  const toggle = (s: string) => setSelectedServices(p => p.includes(s)? p.filter(x => x!== s) : [...p, s]);

  const handleBooking = async () => {
    if (!selectedDate ||!carReg ||!name ||!phone) { alert("Fill all fields"); return; }
    if (selectedServices.length === 0) { alert("Select service"); return; }
    if (isTimePast(selectedTime, selectedDate)) { alert(`Time ${selectedTime} has passed. Current: ${now.toLocaleTimeString()}`); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garage_id: garageId,
          booking_date: selectedDate.toISOString().split("T")[0],
          time_slot: selectedTime,
          car_reg: carReg.toUpperCase(),
          service_type: selectedServices.join(", "),
          customer_name: name,
          phone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert("Error: " + (data.error || "Failed")); setLoading(false); return; }
      if (!data.ref &&!data.id) { alert("Booking failed - no ref"); setLoading(false); return; }
      router.push(`/track/${data.ref || data.id}`);
    } catch { alert("Network error"); }
    setLoading(false);
  };

  const days = getDays();

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w-">
        <div className="mb-6 pt-4">
          <h1 className="text- font-bold">Book haji auto center</h1>
          <p className="text-zinc-400 text-">g40 • Verified • {now.toLocaleTimeString('en-GB')}</p>
        </div>
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text- text-zinc-400">Select Date</label>
              <div className="flex gap-2 items-center">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="w-7 h-7 rounded-full bg-zinc-800">‹</button>
                <span className="text-sm">{currentMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="w-7 h-7 rounded-full bg-zinc-800">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text- text-zinc-500 mb-2 text-center"><div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div></div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                if (!d) return <div key={i} />;
                const disabled = isPast(d) || d.getDay() === 0;
                return <button key={i} disabled={disabled} onClick={() => setSelectedDate(d)} className={`h-10 rounded-xl text- font-medium ${disabled? "bg-zinc-900 text-zinc-600 line-through" : ""} ${!disabled && isSelected(d)? "bg-[#FFC600] text-black" : ""} ${!disabled &&!isSelected(d) && isToday(d)? "bg-zinc-800 border border-[#FFC600]" : ""} ${!disabled &&!isSelected(d) &&!isToday(d)? "bg-[#1E1E1E]" : ""}`}>{d.getDate()}</button>;
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between"><label className="text- text-zinc-400">Time Slot</label><span className="text- text-zinc-500">Now: {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {timeSlots.map(t => {
                const past = isTimePast(t, selectedDate);
                return <button key={t} disabled={past} onClick={() => setSelectedTime(t)} className={`py-2.5 rounded-xl text-sm font-medium border ${past? "bg-zinc-900 text-zinc-600 border-zinc-800 line-through cursor-not-allowed" : selectedTime === t? "bg-white text-black" : "bg-black border-zinc-700"}`}>{t}</button>;
              })}
            </div>
          </div>

          <input value={carReg} onChange={e => setCarReg(e.target.value)} placeholder="Car Reg" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 uppercase" />

          <div>
            <div className="flex justify-between"><label className="text- text-zinc-400">Service (Multi)</label><span className="text- text-[#FFC600]">{selectedServices.length} selected</span></div>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {services.map(s => <button key={s} onClick={() => toggle(s)} className={`py-3 rounded-xl text- border text-left px-3 ${selectedServices.includes(s)? "bg-[#FFC600] text-black border-[#FFC600]" : "bg-black border-zinc-800"}`}>{selectedServices.includes(s)? "✓ " : ""}{s}</button>)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-" />
          </div>

          <button onClick={handleBooking} disabled={loading} className="w-full bg-[#FFC600] text-black font-bold py-4 rounded-xl">{loading? "Booking..." : `Confirm ${selectedServices.length} Services`}</button>
        </div>
      </div>
    </div>
  );
}