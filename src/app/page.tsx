"use client"
import { useState } from "react";
import { supabase } from "../lib/supabase";

const GARAGES = [
  { id: 1, name: "QuickFit Cumbernauld", dist: "0.3 miles", mot: 45, service: 120, time: "Today 3:00 PM" },
  { id: 2, name: "Glasgow MOT Centre", dist: "0.8 miles", mot: 49, service: 135, time: "Tomorrow 9:00 AM" },
  { id: 3, name: "AutoCare G20", dist: "1.2 miles", mot: 42, service: 110, time: "Today 4:30 PM" },
]

export default function Page() {
  const [booked, setBooked] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleBook = async (g: any) => {
    setLoading(true);
    setSelected(g);

    // Real booking Supabase me save
    const { error } = await supabase.from('bookings').insert([{
      car_reg: "SK19 XYZ",
      service_type: "MOT",
      customer_phone: "07xxx 123456",
      garage_name: g.name,
      price: g.mot,
      status: 'pending'
    }]);

    setLoading(false);

    if(!error){
      setBooked(true);
    } else {
      alert("Error: " + error.message);
    }
  }

  if(booked) return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold">Request Sent to {selected.name}!</h1>
      <p className="mt-4">Garage approve karega to tumhe message aayega:</p>
      <p className="mt-2 bg-green-100 p-2 font-bold">"Tumhari booking confirm ho gayi hai - {selected.time}"</p>
      <p className="mt-4 text-sm text-green-600">✅ Real booking Supabase me save ho gayi! Ab Garage Dashboard pe jao.</p>
      <button onClick={()=>setBooked(false)} className="mt-6 bg-black text-white px-6 py-2 rounded">Back</button>
      <a href="/garage" className="ml-2 mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded">Go to Garage →</a>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">AI Garage - Customer LIVE</h1>
      <p className="text-gray-600">Postcode: G20 6 | Price Compare | Call / WhatsApp Book 🔴 LIVE</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {GARAGES.map(g => (
          <div key={g.id} className="border rounded-xl p-4">
            <h3 className="font-bold">{g.name}</h3>
            <p className="text-sm text-gray-500">{g.dist} - {g.time}</p>
            <p className="mt-2">MOT £{g.mot} | Service £{g.service}</p>
            <button disabled={loading} onClick={()=>handleBook(g)} className="mt-4 w-full bg-black text-white py-2 rounded">
              {loading ? "Booking..." : "Book Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}