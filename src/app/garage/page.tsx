"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Booking = {
  id: string
  booking_ref: string
  customer_name: string
  customer_phone: string
  car_reg: string
  service_type: string
  description: string
  booking_date: string
  booking_time: string
  status: string
  preferred_language: string
  created_at: string
}

const statusOptions = [
  { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-500', next: 'in_progress', nextLabel: 'Start Work 🔧' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-yellow-500 text-black', next: 'ready', nextLabel: 'Mark Ready 🎉' },
  { key: 'ready', label: 'Ready for Collection', color: 'bg-green-500', next: 'completed', nextLabel: 'Complete ✅' },
  { key: 'completed', label: 'Completed', color: 'bg-zinc-600', next: null, nextLabel: null },
]

const languageNames: any = { en: 'English', ur: 'Urdu', pa: 'Punjabi', pl: 'Polish', ro: 'Romanian', ar: 'Arabic', hi: 'Hindi' }

export default function GarageOwnerPanel() {
  const [garages, setGarages] = useState<any[]>([])
  const [selectedGarageId, setSelectedGarageId] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(()=>{ fetchGarages() }, [])
  useEffect(()=>{ if(selectedGarageId) fetchBookings() }, [selectedGarageId])

  const fetchGarages = async () => {
    const { data } = await supabase.from('garages').select('*').order('name')
    if(data) {
      setGarages(data)
      if(data.length>0) setSelectedGarageId(data[0].id)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    let query = supabase.from('bookings').select('*').eq('garage_id', selectedGarageId).order('booking_date', {ascending:false}).order('created_at', {ascending:false})
    if(filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    if(data) setBookings(data as any)
    setLoading(false)
  }

  useEffect(()=>{ if(selectedGarageId) fetchBookings() }, [filter])

  const updateStatus = async (booking: Booking, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', booking.id)
    if(error){ alert(error.message); return }

    // Simulate SMS in owner's language + English
    const messages: any = {
      in_progress: {
        en: `AI GARAGE - ${booking.booking_ref}: Work Started on ${booking.car_reg} at ${garages.find(g=>g.id===selectedGarageId)?.name}. We'll notify when ready.`,
        ur: `AI GARAGE - ${booking.booking_ref}: ${booking.car_reg} پر کام شروع ہو گیا ہے۔ تیار ہونے پر اطلاع دیں گے۔`,
      },
      ready: {
        en: `AI GARAGE - ${booking.booking_ref}: Your car ${booking.car_reg} is READY FOR COLLECTION! 🎉 Please collect from ${garages.find(g=>g.id===selectedGarageId)?.name}. Payment at collection.`,
        ur: `AI GARAGE - ${booking.booking_ref}: آپ کی گاڑی ${booking.car_reg} تیار ہے! 🎉 براہ کرم ${garages.find(g=>g.id===selectedGarageId)?.name} سے لے جائیں۔`,
      },
      completed: {
        en: `AI GARAGE - ${booking.booking_ref}: Thank you! ${booking.car_reg} completed. Please leave a review! ⭐`,
        ur: `AI GARAGE - ${booking.booking_ref}: شکریہ! ${booking.car_reg} مکمل۔ ریویو دیں! ⭐`,
      }
    }

    const lang = booking.preferred_language || 'en'
    const msg = messages[newStatus]?.[lang] || messages[newStatus]?.['en'] || `Status updated to ${newStatus}`
    
    console.log(`=== SMS TO CUSTOMER ${booking.customer_phone} ===`)
    console.log(msg)
    console.log(`Also English version will be sent`)
    console.log('=====================================')
    
    alert(`✅ Status updated to ${newStatus.toUpperCase()}!\n\nSMS would be sent to ${booking.customer_phone} in ${languageNames[lang]} + English:\n\n${msg}`)
    
    fetchBookings()
  }

  const selectedGarage = garages.find(g=>g.id===selectedGarageId)

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap'); *{font-family:Geist,sans-serif}`}</style>
      <div className="bg-[#facc15] text-black text-center py-2 px-4 text-xs font-bold">🔧 GARAGE OWNER PANEL - Manage Bookings - Auto SMS in Customer Language + English</div>
      <header className="border-b border-zinc-800 p-4"><div className="max-w-6xl mx-auto flex justify-between items-center"><a href="/" className="flex items-center gap-2"><div className="h-8 w-8 bg-[#facc15] rounded-lg grid place-items-center text-black font-bold">AI</div><span className="font-bold">GARAGE OWNER</span></a><select value={selectedGarageId} onChange={e=>setSelectedGarageId(e.target.value)} className="h-10 px-4 rounded-full bg-zinc-900 border border-zinc-800 text-sm max-w-[200px]">{garages.map(g=><option key={g.id} value={g.id}>{g.name} - {g.postcode}</option>)}</select></div></header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {selectedGarage && <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4 mb-6 flex justify-between items-center"><div><div className="font-bold">{selectedGarage.name}</div><div className="text-xs text-zinc-500">{selectedGarage.address} • {selectedGarage.phone} • {bookings.length} Bookings</div></div><div className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full">Today: {new Date().toLocaleDateString('en-GB')}</div></div>}

        <div className="flex gap-2 mb-6 overflow-auto">
          {[
            {key:'all', label:`All (${bookings.length})`},
            {key:'confirmed', label:'Confirmed'},
            {key:'in_progress', label:'In Progress'},
            {key:'ready', label:'Ready'},
            {key:'completed', label:'Completed'},
          ].map(f=><button key={f.key} onClick={()=>setFilter(f.key)} className={`h-9 px-4 rounded-full text-xs font-medium border whitespace-nowrap ${filter===f.key ? 'bg-[#facc15] text-black border-[#facc15] font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>{f.label}</button>)}
        </div>

        {loading ? <div className="text-center py-20 text-zinc-500">Loading bookings...</div> : bookings.length===0 ? <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-[20px]"><div className="text-3xl mb-2">📭</div><div className="font-semibold">No bookings</div><div className="text-xs text-zinc-500 mt-1">Bookings will appear here when customers book via website/app</div></div> : (
          <div className="grid gap-3">
            {bookings.map(b=>{
              const statusInfo = statusOptions.find(s=>s.key===b.status) || statusOptions[0]
              return (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4 sm:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><span className="font-bold tracking-wider text-sm">{b.booking_ref}</span><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusInfo.color} text-white`}>{b.status.toUpperCase()}</span><span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full">{languageNames[b.preferred_language] || b.preferred_language}</span></div>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><div className="text-[10px] text-zinc-500 uppercase">Customer</div><div className="font-medium mt-0.5">{b.customer_name}</div><div className="text-zinc-400">{b.customer_phone}</div></div>
                        <div><div className="text-[10px] text-zinc-500 uppercase">Car</div><div className="font-medium mt-0.5">{b.car_reg}</div><div className="text-zinc-400">{b.service_type}</div></div>
                        <div><div className="text-[10px] text-zinc-500 uppercase">Drop Off</div><div className="font-medium mt-0.5">{b.booking_date}</div><div className="text-zinc-400">at {b.booking_time?.slice(0,5)}</div></div>
                        <div><div className="text-[10px] text-zinc-500 uppercase">Note</div><div className="text-zinc-300 mt-0.5 line-clamp-2">{b.description || 'No note'}</div></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {statusInfo.next && <button onClick={()=>updateStatus(b, statusInfo.next!)} className="h-10 px-5 rounded-full bg-[#facc15] text-black font-bold text-xs whitespace-nowrap hover:bg-yellow-400">{statusInfo.nextLabel}</button>}
                      <a href={`/track/${b.booking_ref}`} target="_blank" className="h-9 px-4 rounded-full bg-zinc-800 border border-zinc-700 grid place-items-center text-xs font-medium">View Tracking</a>
                      <a href={`tel:${b.customer_phone}`} className="h-9 px-4 rounded-full bg-white text-black grid place-items-center text-xs font-bold">📞 Call</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-[20px] p-4">
          <h4 className="font-bold text-sm">How it works - Owner Flow:</h4>
          <div className="mt-3 grid sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-black border border-zinc-800 rounded-xl p-3"><div className="font-bold">1. Customer Books</div><div className="text-zinc-500 mt-1">Via website/app → SMS in their language + English + Tracking link</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl p-3"><div className="font-bold">2. You Click "Start Work"</div><div className="text-zinc-500 mt-1">Customer gets SMS: "Work Started" in his language + English</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl p-3"><div className="font-bold">3. You Click "Mark Ready"</div><div className="text-zinc-500 mt-1">Customer gets SMS: "Car Ready! 🎉" in his language + English</div></div>
            <div className="bg-black border border-zinc-800 rounded-xl p-3"><div className="font-bold">4. Complete</div><div className="text-zinc-500 mt-1">Customer gets thank you + review request</div></div>
          </div>
        </div>
      </main>
    </div>
  )
}
