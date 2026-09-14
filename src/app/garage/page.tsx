"use client"
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Booking = {
  id: string;
  car_reg: string;
  service_type: string;
  customer_phone: string;
  garage_name?: string;
  price: number;
  status: string;
}

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*').eq('status','pending').order('created_at',{ascending:false});
    if(data) setBookings(data);
    setLoading(false);
  }

  const approve = async (id: string) => {
    const b = bookings.find(x => x.id === id);
    await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
    alert(`✅ Booking Approved!\nCustomer ${b?.customer_phone}`);
    setBookings(bookings.filter(x => x.id !== id));
  }

  const reject = async (id: string) => {
    await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
    setBookings(bookings.filter(x => x.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Garage Dashboard - LIVE</h1>
      <p className="text-gray-600 mt-2">Real bookings from Supabase 🔴</p>
      <button onClick={fetchBookings} className="mt-4 px-4 py-1 border rounded">🔄 Refresh</button>
      <div className="mt-8 space-y-4">
        {loading ? <p>Loading...</p> : bookings.length === 0 ? <p className="text-green-600 font-bold">Koi pending nahi - SK19 XYZ approved ho gayi? Nayi booking insert karo!</p> :
        bookings.map(b => (
          <div key={b.id} className="border rounded-xl p-4 flex justify-between items-center">
            <div><p className="font-bold">{b.car_reg} - {b.service_type} - £{b.price}</p><p className="text-sm text-gray-500">{b.customer_phone}</p></div>
            <div className="flex gap-2"><button onClick={()=>reject(b.id)} className="px-4 py-2 border rounded">Reject</button><button onClick={()=>approve(b.id)} className="px-6 py-2 bg-green-600 text-white rounded">Approve</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}