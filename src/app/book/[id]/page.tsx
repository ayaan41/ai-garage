"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const garageId = params.id as string;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [carReg, setCarReg] = useState("");
  const [service, setService] = useState("Full Service");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const timeSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  const services = ["MOT","Full Service","Interim Service","Brake Check","Engine Diagnostics","Oil Change"];

  const isPast = (date: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    return date < today;
  };
  const isSunday = (date: Date) => date.getDay() === 0;
  const isToday = (date: Date) => new Date().toDateString() === date.toDateString();
  const isSelected = (date: Date) => selectedDate?.toDateString() === date.toDateString();

  const handleBooking = async () => {
    if (!selectedDate ||!carReg ||!name ||!phone) {
      alert("Please fill all fields + select date");
      return;
    }
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
          service_type: service,
          customer_name: name,
          phone: phone,
          status: "pending_quote",
        }),
      });
      const data = await res.json();
      router.push(`/track/${data.ref || data.id}`);
    } catch (e) {
      alert("Booking failed");
    }
    setLoading(false);
  };

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w-">
        <div className="mb-6 pt-4">
          <h1 className="text- font-bold">Book haji auto center</h1>
          <p className="text-zinc-400 text-">g40 • Verified • MOT & Service</p>
        </div>
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text- text-zinc-400">Select Date (Calendar)</label>
              <div className="flex gap-2 items-center">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1))} className="w-7 h-7 rounded-full bg-zinc-800">‹</button>
                <span className="text-sm font-medium">{currentMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1))} className="w-7 h-7 rounded-full bg-zinc-800">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text- text-zinc-500 mb-2 text-center">
              <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                if (!d) return <div key={i} />;
                const disabled = isPast(d) || isSunday(d);
                return (
                  <button key={i} disabled={disabled} onClick={() => setSelectedDate(d)}
                    className={`h-10 rounded-xl text- font-medium
                      ${disabled? "bg-zinc-900 text-zinc-600 line-through" : ""}
                      ${!disabled && isSelected(d)? "bg-[#FFC600] text-black scale-105" : ""}
                      ${!disabled &&!isSelected(d) && isToday(d)? "bg-zinc-800 border border-[#FFC600] text-white" : ""}
                      ${!disabled &&!isSelected(d) &&!isToday(d)? "bg-[#1E1E1E] hover:bg-zinc-700 text-white" : ""}`}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text- text-zinc-400 mb-2 block">Time Slot</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} className={`py-2.5 rounded-xl text-sm font-medium border ${selectedTime===t? "bg-white text-black border-white" : "bg-black border-zinc-700 text-zinc-300"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text- text-zinc-400">Car Registration</label>
            <input value={carReg} onChange={e=>setCarReg(e.target.value)} placeholder="AB12 CDE" className="w-full mt-1.5 bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text- uppercase outline-none focus:border-[#FFC600]" />
          </div>
          <div>
            <label className="text- text-zinc-400">Service Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {services.map(s => (
                <button key={s} onClick={()=>setService(s)} className={`py-3 rounded-xl text- font-medium border text-left px-3 ${service===s? "bg-[#FFC600] text-black border-[#FFC600]" : "bg-black border-zinc-800 text-zinc-300"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-" />
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-" />
          </div>
          <div className="bg-[#FFC600]/10 border border-[#FFC600]/20 rounded-xl p-3.5">
            <p className="text-[#FFC600] text- font-bold">No Upfront Payment</p>
            <p className="text-zinc-400 text- mt-1">Garage will inspect & quote. You pay after approval.</p>
          </div>
          <button onClick={handleBooking} disabled={loading} className="w-full bg-[#FFC600] text-black font-bold py-4 rounded-xl text-">
            {loading? "Booking..." : "Confirm Booking - Get Ref (Free)"}
          </button>
        </div>
      </div>
    </div>
  );
}