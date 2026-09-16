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
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const timeSlots = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
  const services = ["MOT","Full Service","Interim Service","Brake Check","Engine Diagnostics","Oil Change"];

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d < today;
  };

  const isSunday = (date: Date) => date.getDay() === 0;
  const isToday = (date: Date) => new Date().toDateString() === date.toDateString();
  const isSelectedDate = (date: Date) => selectedDate?.toDateString() === date.toDateString();

  const isTimeSlotPast = (timeStr: string, date: Date | null) => {
    if (!date) return false;
    if (!isToday(date)) return false;
    const [h, m] = timeStr.split(":").map(Number);
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    return slotTime.getTime() <= now.getTime();
  };

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s)? prev.filter(x => x!== s) : [...prev, s]);
  };

  const handleBooking = async () => {
    if (!selectedDate ||!carReg ||!name ||!phone) {
      alert("Please fill all fields + select date");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Select at least one service");
      return;
    }
    if (isTimeSlotPast(selectedTime, selectedDate)) {
      alert(`Time ${selectedTime} has already passed. Please select future time. Current time: ${now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}`);
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
          service_type: selectedServices.join(", "),
          service_types: selectedServices,
          customer_name: name,
          phone: phone,
          status: "pending_quote",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Supabase Error: " + (data.error || "Failed to save"));
        setLoading(false);
        return;
      }

      if (!data.ref &&!data.id) {
        alert("Booking failed - no ref returned: " + JSON.stringify(data));
        setLoading(false);
        return;
      }

      router.push(`/track/${data.ref || data.id}`);

    } catch (e) {
      alert("Booking failed - Network error");
    }
    setLoading(false);
  };

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w-">
        <div className="mb-6 pt-4">
          <h1 className="text- font-bold leading-tight">Book haji auto center</h1>
          <p className="text-zinc-400 text- mt-1">g40 • Verified • MOT & Service • {now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text- text-zinc-400 font-medium">Select Date (Calendar)</label>
              <div className="flex gap-2 items-center">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1))} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center">‹</button>
                <span className="text-sm font-medium min-w- text-center">{currentMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1))} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center">›</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text- text-zinc-500 mb-3 text-center font-medium">
              <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} />;
                const disabled = isPast(d) || isSunday(d);
                const selected = isSelectedDate(d);
                const today = isToday(d);
                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => setSelectedDate(d)}
                    className={`
                      h-11 rounded-xl text- font-medium transition-all
                      ${disabled? "bg-zinc-900 text-zinc-600 line-through cursor-not-allowed opacity-50" : ""}
                      ${!disabled && selected? "bg-[#FFC600] text-black scale-105 shadow-lg shadow-yellow-500/20 font-bold" : ""}
                      ${!disabled &&!selected && today? "bg-zinc-800 border border-[#FFC600] text-white" : ""}
                      ${!disabled &&!selected &&!today? "bg-[#1E1E1E] hover:bg-zinc-700 text-white hover:scale-105" : ""}
                    `}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text- text-zinc-400 font-medium">Time Slot</label>
              {selectedDate && isToday(selectedDate) && <span className="text- text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">Now: {now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>}
            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {timeSlots.map(t => {
                const past = isTimeSlotPast(t, selectedDate);
                const active = selectedTime === t;
                return (
                  <button
                    key={t}
                    disabled={past}
                    onClick={() => setSelectedTime(t)}
                    className={`
                      py-3 rounded-xl text-sm font-medium border transition-all relative
                      ${past? "bg-zinc-900 text-zinc-600 border-zinc-800 line-through cursor-not-allowed opacity-60" : ""}
                      ${!past && active? "bg-white text-black border-white shadow-lg scale-105 font-bold" : ""}
                      ${!past &&!active? "bg-black border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900" : ""}
                    `}
                  >
                    {t} {past && <span className="text- ml-0.5">✕</span>}
                  </button>
                );
              })}
            </div>

            {selectedDate && isToday(selectedDate) && (
              <p className="text- text-zinc-500 mt-3 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                ⚠️ Past times are disabled automatically. Current Glasgow time: {now.toLocaleTimeString('en-GB')} - Only future slots can be booked today.
              </p>
            )}
          </div>

          <div>
            <label className="text- text-zinc-400 font-medium">Car Registration</label>
            <input
              value={carReg}
              onChange={e=>setCarReg(e.target.value)}
              placeholder="AB12 CDE"
              className="w-full mt-2 bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text- uppercase outline-none focus:border-[#FFC600] focus:ring-1 focus:ring-[#FFC600] transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text- text-zinc-400 font-medium">Service Type (Multi Select)</label>
              <span className="text- text-[#FFC600] bg-[#FFC600]/10 border border-[#FFC600]/20 px-2.5 py-1 rounded-full font-bold">{selectedServices.length} selected</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              {services.map(s => {
                const active = selectedServices.includes(s);
                return (
                  <button
                    key={s}
                    onClick={()=>toggleService(s)}
                    className={`
                      py-3.5 rounded-xl text- font-medium border text-left px-3.5 transition-all
                      ${active? "bg-[#FFC600] text-black border-[#FFC600] shadow-md font-bold scale-[0.98]" : "bg-black border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"}
                    `}
                  >
                    {active? "✓ " : ""}{s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text- text-zinc-500">Your Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="w-full mt-1 bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text- outline-none focus:border-zinc-600" />
            </div>
            <div>
              <label className="text- text-zinc-500">Phone Number</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="w-full mt-1 bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text- outline-none focus:border-zinc-600" />
            </div>
          </div>

          <div className="bg-[#FFC600]/10 border border-[#FFC600]/20 rounded-xl p-4">
            <p className="text-[#FFC600] text- font-bold flex items-center gap-2">💛 No Upfront Payment</p>
            <p className="text-zinc-400 text- mt-1.5 leading-relaxed">Selected: <span className="text-white font-medium">{selectedServices.join(", ") || "None"}</span> at <span className="text-white">{selectedTime}</span> on <span className="text-white">{selectedDate?.toLocaleDateString('en-GB')}</span></p>
          </div>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full bg-[#FFC600] hover:bg-[#FFD500] text-black font-bold py-4 rounded-xl text- disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.98]"
          >
            {loading? "Booking in progress..." : `Confirm Booking - ${selectedServices.length} Services (Free)`}
          </button>

          <p className="text- text-zinc-600 text-center">By confirming, you agree to our terms. Free cancellation up to 2 hours before.</p>
        </div>
      </div>
    </div>
  );
}