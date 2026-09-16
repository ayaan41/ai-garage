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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);
    return () => clearInterval(timer);
  }, []);

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const isPastTime = (slot: string) => {
    if (!date) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    if (date!== todayStr) return false;
    const [h, m] = slot.split(":").map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    return slotDate <= currentTime;
  };

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
      alert(`Booking success! Ref: ${ref}`);
      router.push(`/track/${ref}`);

    } catch (e: any) {
      console.error(e);
      alert(`Supabase Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const services = ["MOT", "Full Service", "Interim Service", "Brake Check", "Engine Diagnostics", "Oil Change"];

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w-">
        <h1 className="text- font-bold mt-4">Book a Service</h1>

        <div className="mt-6">
          <label className="text- text-zinc-400">Select Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#121212] border border-zinc-800 rounded-xl p-4 mt-2 text-white" />
        </div>

        <div className="mt-4">
          <label className="text- text-zinc-400">Select Time</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {timeSlots.map(slot => {
              const past = isPastTime(slot);
              const selected = timeSlot === slot;
              return (
                <button key={slot} disabled={past} onClick={() =>!past && setTimeSlot(slot)} className={`p-3 rounded-xl border text- font-medium ${past? "bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed" : selected? "bg-[#FFC600] text-black border-[#FFC600] font-bold" : "bg-[#121212] text-white border-zinc-800"}`}>
                  {slot} {past? "✕" : ""}
                </button>
              );
            })}
          </div>
          <div className="mt-2 bg-[#1a1a00] border border-yellow-900/30 rounded-lg p-2 flex gap-2">
            <span className="text-yellow-500 text-">⚠️</span>
            <p className="text- text-zinc-400">Past times are disabled automatically. Current Glasgow time: {currentTime.toLocaleTimeString()} - Only future times selectable for today</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text- text-zinc-400">Car Registration</label>
          <input value={carReg} onChange={e => setCarReg(e.target.value.toUpperCase())} placeholder="KM77YHK" className="w-full bg-[#121212] border border-zinc-800 rounded-xl p-4 mt-2 text-white uppercase" />
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <label className="text- text-zinc-400">Service Type (Multi Select)</label>
            <span className="bg-[#FFC600]/20 text-[#FFC600] text- px-2 py-1 rounded-full font-bold">{selectedServices.length} selected</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {services.map(s => {
              const sel = selectedServices.includes(s);
              return (
                <button key={s} onClick={() => toggleService(s)} className={`p-4 rounded-xl border text-left text- ${sel? "bg-[#FFC600] text-black border-[#FFC600] font-bold" : "bg-[#121212] text-zinc-400 border-zinc-800"}`}>
                  {sel? "✓ " : ""}{s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text- text-zinc-400">Your Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#121212] border border-zinc-800 rounded-xl p-4 mt-2 text-white" />
          </div>
          <div>
            <label className="text- text-zinc-400">Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#121212] border border-zinc-800 rounded-xl p-4 mt-2 text-white" />
          </div>
        </div>

        <div className="mt-4 bg-[#1a1a00] border border-yellow-900/30 rounded-xl p-4">
          <p className="text-[#FFC600] text- font-bold">💛 No Upfront Payment</p>
          <p className="text-zinc-500 text- mt-1">Selected: {selectedServices.join(", ")} at {timeSlot || "--:--"} on {date? new Date(date).toLocaleDateString("en-GB") : "--/--/----"}</p>
        </div>

        <button onClick={handleBooking} disabled={loading} className="w-full bg-[#FFC600] text-black py-4 rounded-xl font-bold mt-6 disabled:opacity-50">
          {loading? "Booking in progress..." : "Confirm Booking - KM77YHK"}
        </button>

        <p className="text- text-zinc-600 text-center mt-3">By confirming, you agree to our terms. Free cancellation up to 2 hours before.</p>
      </div>
    </div>
  );
}