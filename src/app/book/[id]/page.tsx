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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);

    return () => clearInterval(timer);
  }, []);

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const isPastTime = (slot: string) => {
    if (!date ||!minDate) return false;
    // Sirf aaj ki date ke liye past disable
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
      alert("Please fill all fields - Date, Time, Car Reg, Service, Name, Phone");
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

      console.log("Sending payload:", payload);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Result:", result);

      if (!res.ok) {
        throw new Error(result.error || "Booking failed");
      }

      const ref = result.ref || result.booking_ref || result.id;
      alert(`Booking success! Ref: ${ref} Car: ${carReg}`);
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
    <div className="min-h-screen bg-black text-white flex justify-center p-4 pb-20">
      <div className="w-full max-w-">
        <h1 className="text- font-bold mt-4">Book a Service</h1>

        <div className="mt-6">
          <label className="text- text-zinc-400 font-medium">Select Date *</label>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white outline-none focus:border-[#FFC600] focus:ring-1 focus:ring-[#FFC600]/30 transition-all"
          />
          <p className="text- text-zinc-500 mt-1.5">📅 Selected: {date? new Date(date).toLocaleDateString('en-GB', {weekday:'short', day:'2-digit', month:'short', year:'numeric'}) : "Select date"} {isToday? "(Today)" : "(Future - All times available)"}</p>
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
                  className={`p-3.5 rounded-xl border text- font-medium transition-all active:scale-[0.97] ${past? "bg-zinc-900/50 text-zinc-600 border-zinc-800/50 cursor-not-allowed opacity-50" : selected? "bg-[#FFC600] text-black border-[#FFC600] font-bold shadow-lg shadow-yellow-500/20" : "bg-[#121212] text-white border-zinc-800 hover:border-zinc-700"}`}>
                  {slot} {past? "✕" : ""}
                </button>
              );
            })}
          </div>

          {isToday? (
            <div className="mt-3 bg-[#1a1a00] border border-yellow-900/40 rounded-xl p-3 flex gap-2.5">
              <span className="text-yellow-500 text-">⚠️</span>
              <div>
                <p className="text- text-zinc-300 font-medium">Past times disabled for today</p>
                <p className="text- text-zinc-500 mt-0.5">Current Glasgow time: {currentTime.toLocaleTimeString('en-GB')} - Only {timeSlots.filter(s=>!isPastTime(s)).join(", ") || "no times"} available</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 bg-green-950/30 border border-green-900/30 rounded-xl p-3 flex gap-2.5">
              <span className="text-green-500 text-">✅</span>
              <div>
                <p className="text- text-green-300 font-medium">All times available</p>
                <p className="text- text-zinc-500 mt-0.5">Future date selected ({new Date(date).toLocaleDateString('en-GB')}) - All 09:00-17:00 slots open</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="text- text-zinc-400 font-medium">Car Registration *</label>
          <input value={carReg} onChange={e => setCarReg(e.target.value.toUpperCase())} placeholder="KM77YHK" className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white uppercase tracking-wider font-bold outline-none focus:border-[#FFC600] focus:ring-1 focus:ring-[#FFC600]/30" />
          <p className="text- text-zinc-500 mt-1.5">Current: <span className="text-white font-bold">{carReg || "KM77YHK"}</span> - Will be saved as uppercase</p>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <label className="text- text-zinc-400 font-medium">Service Type (Multi Select) *</label>
            <span className="bg-[#FFC600] text-black text- px-2.5 py-1 rounded-full font-bold">{selectedServices.length} selected</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {services.map(s => {
              const sel = selectedServices.includes(s);
              return (
                <button key={s} onClick={() => toggleService(s)} className={`p-4 rounded-xl border text-left text- transition-all active:scale-[0.98] ${sel? "bg-[#FFC600] text-black border-[#FFC600] font-bold shadow-md" : "bg-[#121212] text-zinc-400 border-zinc-800 hover:border-zinc-700"}`}>
                  {sel? "✓ " : ""}{s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text- text-zinc-400 font-medium">Your Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="ahmadd" className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white outline-none focus:border-[#FFC600]" />
          </div>
          <div>
            <label className="text- text-zinc-400 font-medium">Phone Number *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09989897677" className="w-full bg-[#121212] border border-zinc-700 rounded-xl p-4 mt-2 text-white outline-none focus:border-[#FFC600]" />
          </div>
        </div>

        <div className="mt-5 bg-[#1a1a00] border border-yellow-900/30 rounded-xl p-4">
          <p className="text-[#FFC600] text- font-bold flex items-center gap-2">💛 No Upfront Payment</p>
          <p className="text-zinc-400 text- mt-1.5 leading-relaxed">
            Selected: <span className="text-white font-bold">{selectedServices.join(", ") || "None"}</span> at <span className="text-white font-bold">{timeSlot || "--:--"}</span> on <span className="text-white font-bold">{date? new Date(date).toLocaleDateString("en-GB") : "--/--/----"}</span><br/>
            Car: <span className="text-[#FFC600] font-bold">{carReg}</span>
          </p>
        </div>

        <button onClick={handleBooking} disabled={loading} className="w-full bg-[#FFC600] hover:bg-[#FFD500] text-black py-4 rounded-xl font-bold mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20">
          {loading? "Booking in progress... ⏳" : `Confirm Booking - ${carReg} at ${timeSlot || "--:--"}`}
        </button>

        <p className="text- text-zinc-600 text-center mt-3 leading-relaxed">By confirming, you agree to our terms. Free cancellation up to 2 hours before.<br/>Date: {date} | Min: {minDate} | Today? {isToday? "YES - past disabled" : "NO - all open"}</p>
      </div>
    </div>
  );
}