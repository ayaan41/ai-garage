"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const garageId = params.id as string;

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [carReg, setCarReg] = useState("KM77YHK");
  const [selectedServices, setSelectedServices] = useState<string[]>(["Oil Change"]);
  const [name, setName] = useState("ahmadd");
  const [phone, setPhone] = useState("09989897677");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setMinDate(todayStr);

    // Default kal ki date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);

    return () => clearInterval(timer);
  }, []);

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const getQuickDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const label = i === 0? "Today" : i === 1? "Tomorrow" : d.toLocaleDateString('en-GB', {weekday:'short'});
      const display = d.toLocaleDateString('en-GB', {day:'2-digit', month:'short'});
      dates.push({ iso, label, display, full: d });
    }
    return dates;
  };

  const quickDates = getQuickDates();

  const isPastTime = (slot: string) => {
    if (!date ||!minDate) return false;
    if (date!== minDate) return false;
    const [h, m] = slot.split(":").map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    return slotDate <= currentTime;
  };

  const isToday = date === minDate;

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s)? prev.filter(x => x!== s) : [...prev, s]);
  };

  const handleBooking = async () => {
    if (!date ||!timeSlot ||!carReg || selectedServices.length === 0 ||!name ||!phone) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        garage_id: garageId,
        booking_date: date,
        time_slot: timeSlot,
        car_reg: carReg.toUpperCase().trim(),
        service_type: selectedServices.join(", "),
        service_types: selectedServices,
        customer_name: name.trim(),
        phone: phone.trim(),
        status: "pending_quote",
      };
      console.log("Sending:", payload);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("Result:", result);
      if (!res.ok) throw new Error(result.error || "Booking failed");
      const ref = result.ref || result.booking_ref || result.id;
      alert(`Booking success! Ref: ${ref}`);
      router.push(`/track/${ref}`);
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const services = ["MOT", "Full Service", "Interim Service", "Brake Check", "Engine Diagnostics", "Oil Change"];

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4 pb-24">
      <div className="w-full max-w-">
        <h1 className="text- font-bold mt-4">Book a Service</h1>

        <div className="mt-6">
          <label className="text- text-zinc-400 font-medium">Select Date *</label>

          {/* QUICK DATE BUTTONS - Jaise pehle the */}
          <div className="grid grid-cols-5 gap-2 mt-3">
            {quickDates.map(qd => {
              const selected = date === qd.iso;
              return (
                <button
                  key={qd.iso}
                  onClick={() => setDate(qd.iso)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-[0.96] ${selected? "bg-[#FFC600] text-black border-[#FFC600] font-bold shadow-lg" : "bg-[#121212] text-white border-zinc-800 hover:border-zinc-600"}`}
                >
                  <span className="text- font-bold">{qd.label}</span>
                  <span className="text-">{qd.display}</span>
                </button>
              );
            })}
          </div>

          {/* Calendar input bhi rahega */}
          <div className="mt-3 relative">
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 text-white outline-none focus:border-[#FFC600] focus:ring-1 focus:ring-[#FFC600]/30 transition-all"
            />
          </div>

          <div className="mt-2 bg-[#121212] border border-zinc-800 rounded-lg p-2.5">
            <p className="text- text-white font-medium">📅 Selected: {date? new Date(date).toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'long', year:'numeric'}) : "No date"} {isToday? "(Today)" : "(Future - All times available)"}</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="text- text-zinc-400 font-medium">Select Time *</label>
          <div className="grid grid-cols-3 gap-2.5 mt-2">
            {timeSlots.map(slot => {
              const past = isPastTime(slot);
              const selected = timeSlot === slot;
              return (
                <button
                  key={slot}
                  disabled={past}
                  onClick={() =>!past && setTimeSlot(slot)}
                  className={`p-3.5 rounded-xl border text- font-medium transition-all active:scale-[0.97] ${past? "bg-zinc-900/50 text-zinc-600 border-zinc-800/50 cursor-not-allowed opacity-50" : selected? "bg-[#FFC600] text-black border-[#FFC600] font-bold shadow-lg" : "bg-[#121212] text-white border-zinc-800 hover:border-zinc-700"}`}
                >
                  {slot} {past? "✕" : ""}
                </button>
              );
            })}
          </div>

          {isToday? (
            <div className="mt-3 bg-[#1a1a00] border border-yellow-900/40 rounded-xl p-3 flex gap-2.5">
              <span className="text-yellow-500">⚠️</span>
              <div>
                <p className="text- text-zinc-300 font-medium">Past times disabled for today</p>
                <p className="text- text-zinc-500">Current: {currentTime.toLocaleTimeString('en-GB')} - Future only</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 bg-green-950/30 border border-green-900/30 rounded-xl p-3 flex gap-2.5">
              <span className="text-green-500">✅</span>
              <div>
                <p className="text- text-green-300 font-medium">All times available</p>
                <p className="text- text-zinc-500">Future date {date? new Date(date).toLocaleDateString('en-GB') : ""} - All 09:00-17:00 open</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="text- text-zinc-400 font-medium">Car Registration *</label>
          <input value={carReg} onChange={e => setCarReg(e.target.value.toUpperCase())} className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white uppercase font-bold tracking-wider outline-none focus:border-[#FFC600]" />
          <p className="text- text-zinc-500 mt-1.5">Current: <span className="text-white font-bold">{carReg}</span> - Saved as uppercase</p>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <label className="text- text-zinc-400 font-medium">Service Type *</label>
            <span className="bg-[#FFC600] text-black text- px-2.5 py-1 rounded-full font-bold">{selectedServices.length} selected</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {services.map(s => {
              const sel = selectedServices.includes(s);
              return (
                <button key={s} onClick={() => toggleService(s)} className={`p-4 rounded-xl border text-left text- transition-all ${sel? "bg-[#FFC600] text-black border-[#FFC600] font-bold" : "bg-[#121212] text-zinc-400 border-zinc-800"}`}>
                  {sel? "✓ " : ""}{s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text- text-zinc-400 font-medium">Your Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white outline-none focus:border-[#FFC600]" />
          </div>
          <div>
            <label className="text- text-zinc-400 font-medium">Phone *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white outline-none focus:border-[#FFC600]" />
          </div>
        </div>

        <div className="mt-5 bg-[#1a1a00] border border-yellow-900/30 rounded-xl p-4">
          <p className="text-[#FFC600] text- font-bold">💛 No Upfront Payment</p>
          <p className="text-zinc-400 text- mt-1.5">
            Selected: <span className="text-white font-bold">{selectedServices.join(", ") || "None"}</span> at <span className="text-white font-bold">{timeSlot || "--:--"}</span> on <span className="text-white font-bold">{date? new Date(date).toLocaleDateString("en-GB") : "--"}</span><br/>
            Car: <span className="text-[#FFC600] font-bold">{carReg}</span>
          </p>
        </div>

        <button onClick={handleBooking} disabled={loading} className="w-full bg-[#FFC600] hover:bg-[#FFD500] text-black py-4 rounded-xl font-bold mt-6 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg">
          {loading? "Booking in progress... ⏳" : `Confirm Booking - ${carReg} at ${timeSlot || "--:--"}`}
        </button>
      </div>
    </div>
  );
}