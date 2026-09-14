"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TrackPage() {
  const params = useParams()
  const ref = params.ref as string
  
  const [booking, setBooking] = useState<any>(null)
  const [garage, setGarage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if(ref) fetchBooking()
  }, [ref])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const bookingRef = ref?.toString().toUpperCase()
      console.log('Fetching booking:', bookingRef)
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_ref', bookingRef)
        .single()

      if (bookingError || !bookingData) {
        console.error('Booking error:', bookingError)
        setError('Booking not found - Check reference: ' + bookingRef)
        setLoading(false)
        return
      }

      setBooking(bookingData)

      const { data: garageData } = await supabase
        .from('garages')
        .select('*')
        .eq('id', bookingData.garage_id)
        .single()

      if (garageData) setGarage(garageData)
    } catch(e:any){
      setError(e.message)
    }
    setLoading(false)
  }

  const getStatusStep = (status: string) => {
    const steps = ['confirmed', 'in_progress', 'ready', 'completed']
    return steps.indexOf(status)
  }

  const statusConfig: any = {
    pending: { label: 'Pending', color: 'bg-zinc-600', emoji: '⏳' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-500', emoji: '✅' },
    in_progress: { label: 'In Progress - Work Started', color: 'bg-yellow-500', emoji: '🔧' },
    ready: { label: 'Ready for Collection!', color: 'bg-green-500', emoji: '🎉' },
    completed: { label: 'Completed', color: 'bg-green-600', emoji: '✅' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', emoji: '❌' }
  }

  const languageNames: any = { en: 'English', ur: 'Urdu', pa: 'Punjabi', pl: 'Polish', ro: 'Romanian', ar: 'Arabic' }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white grid place-items-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-zinc-700 border-t-[#facc15] rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-zinc-500 text-sm">Loading booking {ref}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white grid place-items-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="font-bold">Booking Not Found</h2>
          <p className="text-sm text-zinc-500 mt-2">{error}</p>
          <p className="text-xs text-zinc-600 mt-3">Check Supabase bookings table - booking_ref column</p>
          <a href="/" className="mt-4 inline-block h-10 px-6 rounded-full bg-[#facc15] text-black font-bold text-sm grid place-items-center">Go Home</a>
        </div>
      </div>
    )
  }

  const currentStep = getStatusStep(booking.status)
  const status = statusConfig[booking.status] || statusConfig['confirmed']

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap'); *{font-family:Geist,sans-serif}`}</style>
      <div className="bg-[#facc15] text-black text-center py-2 px-4 text-xs font-bold">Track Your Booking - No Login Needed</div>
      <header className="border-b border-zinc-800 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center gap-2"><div className="h-8 w-8 bg-[#facc15] rounded-lg grid place-items-center text-black font-bold">AI</div><span className="font-bold">GARAGE</span></a>
          <span className="text-xs text-zinc-500">Tracking: {booking.booking_ref}</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-6">
          <div className="flex justify-between items-start">
            <div><div className="text-xs text-zinc-500">Booking Ref</div><div className="font-bold text-xl tracking-wider">{booking.booking_ref}</div><div className="text-xs text-zinc-400 mt-1">{booking.car_reg} • {booking.service_type}</div></div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${status.color} flex items-center gap-1.5`}><span>{status.emoji}</span> {status.label}</div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-black border border-zinc-800 rounded-xl p-3"><div className="text-[10px] text-zinc-500 uppercase">Garage</div><div className="font-semibold mt-1">{garage?.name}</div><div className="text-xs text-zinc-400 mt-1">{garage?.address}</div><div className="text-xs text-zinc-500 mt-1">{garage?.phone}</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl p-3"><div className="text-[10px] text-zinc-500 uppercase">Drop Off</div><div className="font-semibold mt-1">{booking.booking_date}</div><div className="text-xs text-zinc-400 mt-1">at {booking.booking_time?.slice(0,5)}</div><div className="text-[10px] text-zinc-500 mt-2">Language: {languageNames[booking.preferred_language] || booking.preferred_language}</div></div>
          </div>
          {booking.description && (<div className="mt-4 bg-black border border-zinc-800 rounded-xl p-3"><div className="text-[10px] text-zinc-500 uppercase">Customer Note</div><div className="text-sm mt-1 text-zinc-300">{booking.description}</div></div>)}
        </div>
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-[24px] p-6">
          <h3 className="font-bold mb-4">Booking Progress</h3>
          <div className="space-y-0">
            {[
              { key: 'confirmed', title: 'Booking Confirmed', desc: `Your booking for ${booking.booking_date} at ${booking.booking_time?.slice(0,5)} is confirmed. Drop your car at ${garage?.name}.`, time: booking.created_at },
              { key: 'in_progress', title: 'Work Started - Car in Garage', desc: 'Mechanic has started work.', time: '' },
              { key: 'ready', title: 'Ready for Collection! 🎉', desc: 'Your car is ready! Please collect.', time: '' },
              { key: 'completed', title: 'Completed - Thank You!', desc: 'Job completed.', time: '' }
            ].map((step, idx) => {
              const isCompleted = currentStep >= idx; const isCurrent = currentStep === idx; const isFuture = currentStep < idx;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center"><div className={`h-8 w-8 rounded-full grid place-items-center text-sm border-2 ${isCompleted ? 'bg-[#facc15] border-[#facc15] text-black' : isCurrent ? 'bg-zinc-800 border-[#facc15] text-[#facc15]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{isCompleted ? '✓' : idx + 1}</div>{idx < 3 && <div className={`w-0.5 h-12 ${isCompleted ? 'bg-[#facc15]' : 'bg-zinc-800'}`}></div>}</div>
                  <div className={`pb-8 ${isFuture ? 'opacity-50' : ''}`}><div className={`font-semibold text-sm ${isCurrent ? 'text-[#facc15]' : isCompleted ? 'text-white' : 'text-zinc-500'}`}>{step.title} {isCurrent && <span className="text-[10px] bg-[#facc15] text-black px-2 py-0.5 rounded-full ml-2">CURRENT</span>}</div><div className="text-xs text-zinc-400 mt-1 max-w-md">{step.desc}</div></div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <a href={`tel:${garage?.phone}`} className="h-12 rounded-full bg-white text-black font-bold grid place-items-center text-sm">📞 Call Garage</a>
          <a href={`https://wa.me/${garage?.phone?.replace(/\D/g,'')}?text=Hi, my booking ref is ${booking.booking_ref} for ${booking.car_reg}`} target="_blank" className="h-12 rounded-full bg-[#25D366] text-white font-bold grid place-items-center text-sm">💬 WhatsApp</a>
        </div>
      </main>
    </div>
  )
}
