"use client"
import { useState } from "react";
import { supabase } from "../lib/supabase";

const GARAGES = [
  { id: 1, name: "QuickFit Cumbernauld", dist: "0.3 miles", mot: 45, service: 120, time: "Today 3:00 PM", phone: "447123456789" },
  { id: 2, name: "Glasgow MOT Centre", dist: "0.8 miles", mot: 49, service: 135, time: "Tomorrow 9:00 AM", phone: "447123456789" },
  { id: 3, name: "AutoCare G20", dist: "1.2 miles", mot: 42, service: 110, time: "Today 4:30 PM", phone: "447123456789" },
]

export default function Page() {
  const [booked, setBooked] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", carReg: "", service: "MOT", date: "" });

  const openBook = (g: any) => {
    setSelected(g);
    setShowModal(true);
    setForm({ name: "", phone: "", carReg: "", service: "MOT", date: g.time });
  }

  const handleWhatsApp = () => {
    const price = form.service === "MOT" ? selected.mot : form.service === "Service" ? selected.service : selected.mot + selected.service;
    const msg = `Hi ${selected.name}! 👋%0A%0AI want to book *${form.service}*%0A%0A🚗 Car: ${form.carReg || "SK19 XYZ"}%0A👤 Name: ${form.name || "Customer"}%0A📅 When: ${form.date || selected.time}%0A💷 Price: £${price}%0A%0APostcode: G20 6`;
    window.open(`https://wa.me/${selected.phone}?text=${msg}`, "_blank");
  }

  const handleConfirm = async () => {
    if(!form.name || !form.phone || !form.carReg){
      alert("Please fill Name, Phone, Car Reg");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('bookings').insert([{
      garage_name: selected.name,
      customer_name: form.name,
      customer_phone: form.phone,
      car_reg: form.carReg,
      service_type: form.service,
      booking_time: form.date,
      price: form.service === "MOT" ? selected.mot : form.service === "Service" ? selected.service : selected.mot + selected.service,
      status: 'pending'
    }]);

    setLoading(false);
    if(!error){
      setShowModal(false);
      setBooked(true);
    } else {
      alert("Error: " + error.message);
    }
  }

  if(booked) return (
    <div className="p-10 text-center max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">Request Sent to {selected.name}!</h1>
      <p className="mt-4">Garage approve karega to tumhe message aayega:</p>
      <p className="mt-2 bg-green-100 p-3 font-bold rounded">“Tumhari booking confirm ho gayi hai - {selected.time}”</p>
      <p className="mt-4 text-sm text-green-600">✅ Real booking Supabase me save ho gayi! Ab Garage Dashboard pe jao.</p>
      <div className="flex gap-2 justify-center mt-6">
        <button onClick={()=>setBooked(false)} className="bg-black text-white px-6 py-2 rounded">Back</button>
        <a href="/garage" className="bg-green-600 text-white px-6 py-2 rounded">Go to Garage →</a>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">AI Garage - Customer LIVE</h1>
      <p className="text-gray-600">Postcode: G20 6 | Price Compare | Call / WhatsApp Book 🔴 LIVE</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {GARAGES.map(g => (
          <div key={g.id} className="border rounded-xl p-4 bg-white">
            <h3 className="font-bold">{g.name}</h3>
            <p className="text-sm text-gray-500">{g.dist} - {g.time}</p>
            <p className="mt-2">MOT £{g.mot} | Service £{g.service}</p>
            <button onClick={()=>openBook(g)} className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-800">
              Book Now
            </button>
          </div>
        ))}
      </div>

      {/* DUAL BOOKING MODAL */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[24px] w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-gray-500 mt-1">MOT £{selected.mot} | Service £{selected.service} • {selected.dist}</p>
              </div>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 text-2xl">×</button>
            </div>

            {/* Form Fields - Shared for both options */}
            <div className="mt-5 space-y-3">
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Your Name" className="w-full border rounded-lg px-3 py-2.5 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="Phone (07...)" className="w-full border rounded-lg px-3 py-2.5 text-sm" />
                <input value={form.carReg} onChange={e=>setForm({...form, carReg: e.target.value.toUpperCase()})} placeholder="Car Reg (SK19...)" className="w-full border rounded-lg px-3 py-2.5 text-sm uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.service} onChange={e=>setForm({...form, service: e.target.value})} className="w-full border rounded-lg px-3 py-2.5 text-sm">
                  <option>MOT</option>
                  <option>Service</option>
                  <option>MOT + Service</option>
                </select>
                <input value={form.date} onChange={e=>setForm({...form, date: e.target.value})} placeholder={selected.time} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>

            {/* Option 1 - Fast WhatsApp */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-bold text-green-700">⚡ FAST • 30 SEC • RECOMMENDED ON MOBILE</p>
              <button onClick={handleWhatsApp} className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm">
                Book via WhatsApp Fast ⚡
              </button>
              <p className="text-[11px] text-green-700 mt-2 text-center">Direct message to garage - instant reply</p>
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-xs bg-black text-white px-3 py-1 rounded-full">OR</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>

            {/* Option 2 - Pro System Booking */}
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700">🔒 PRO • SAVE TO SYSTEM • TRACKING</p>
              <button disabled={loading} onClick={handleConfirm} className="mt-3 w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                {loading ? "Saving..." : "Confirm Booking - Save to System"}
              </button>
              <p className="text-[11px] text-gray-500 mt-2 text-center">Saved in Supabase → Garage dashboard pe jayega</p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
