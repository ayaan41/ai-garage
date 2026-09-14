"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [garage, setGarage] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(()=>{
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if(!session){
      router.push('/garage/login')
      return
    }
    setUser(session.user)
    
    // Find garage linked to this email
    const { data: owner, error: ownerError } = await supabase.from('garage_owners').select('*, garages(*)').eq('email', session.user.email).single()
    
    if(ownerError || !owner){
      console.error('No garage linked:', ownerError)
      alert(`Your email ${session.user.email} is not linked to any garage! Contact admin.\n\nSQL me run karo:\nINSERT INTO garage_owners (garage_id, email) SELECT id, '${session.user.email}' FROM garages WHERE name ILIKE '%haji%' LIMIT 1`)
      // For demo, fallback to first garage
      const { data: garages } = await supabase.from('garages').select('*').limit(1)
      if(garages && garages[0]){
        setGarage(garages[0])
        fetchBookings(garages[0].id)
      }
      setLoading(false)
      return
    }
    
    setGarage(owner.garages)
    fetchBookings(owner.garage_id)
  }

  const fetchBookings = async (garageId: string) => {
    setLoading(true)
    let query = supabase.from('bookings').select('*').eq('garage_id', garageId).order('booking_date', {ascending:false}).order('created_at', {ascending:false})
    if(filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    if(data) setBookings(data as any)
    setLoading(false)
  }

  useEffect(()=>{ if(garage) fetchBookings(garage.id) }, [filter])

  const updateStatus = async (booking: Booking, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', booking.id)
    if(error){ alert(error.message); return }

    const messages: any = {
      in_progress: {
        en: `AI GARAGE - ${booking.booking_ref}: Work Started on ${booking.car_reg}. We'll notify when ready.`,
        ur: `AI GARAGE - ${booking.booking_ref}: ${booking.car_reg} پر کام شروع ہو گیا۔`,
      },
      ready: {
        en: `AI GARAGE - ${booking.booking_ref}: Your car ${booking.car_reg} is READY FOR COLLECTION! 🎉 Please collect from ${garage?.name}.`,
        ur: `AI GARAGE - ${booking.booking_ref}: آپ کی گاڑی ${booking.car_reg} تیار ہے! 🎉`,
      },
      completed: {
        en: `AI GARAGE - ${booking.booking_ref}: Thank you! ${booking.car_reg} completed.`,
        ur: `AI GARAGE - ${booking.booking_ref}: شکریہ! ${booking.car_reg} مکمل۔`,
      }
    }

    const lang = booking.preferred_language || 'en'
    const msg = messages[newStatus]?.[lang] || messages[newStatus]?.['en']
    
    alert(`✅ ${newStatus.toUpperCase()}!\n\nSMS to ${booking.customer_phone} (${languageNames[lang]}+EN):\n${msg}`)
    
    if(garage) fetchBookings(garage.id)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/garage/login')
  }

  if(loading && !garage){
    return <div className="min-h-screen bg-[#08080a] text-white grid place-items-center"><div className="text-zinc-500">Loading your garage...</div></div>
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap'); *{font-family:Geist,sans-serif}`}</style>
      <div className="bg-[#facc15] text-black text-center py-2 px-4 text-xs font-bold">🔒 Secure - Logged in as {user?.email} - {garage?.name}</div>
      <header className="border-b border-zinc-800 p-4"><div className="max-w-6xl mx-auto flex justify-between items-center"><div className="flex items-center gap-3"><div className="h-8 w-8 bg-[#facc15] rounded-lg grid place-items-center text-black font-bold">AI</div><div><div className="font-bold text-sm">{garage?.name} - Owner Panel</div><div className="text-[11px] text-zinc-500">{user?.email} • {garage?.address}</div></div></div><button onClick={logout} className="h-9 px-4 rounded-full bg-zinc-800 border border-zinc-700 text-xs">Logout</button></div></header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4 mb-6 flex justify-between items-center"><div><div className="font-bold">{garage?.name}</div><div className="text-xs text-zinc-500">{garage?.postcode} • {garage?.phone} • {bookings.length} Bookings - Secure Owner Only</div></div><div className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full">🔒 Logged In</div></div>

        <div className="flex gap-2 mb-6 overflow-auto">
          {[
            {key:'all', label:`All (${bookings.length})`},
            {key:'confirmed', label:'Confirmed'},
            {key:'in_progress', label:'In Progress'},
            {key:'ready', label:'Ready'},
            {key:'completed', label:'Completed'},
          ].map(f=><button key={f.key} onClick={()=>setFilter(f.key)} className={`h-9 px-4 rounded-full text-xs font-medium border whitespace-nowrap ${filter===f.key ? 'bg-[#facc15] text-black border-[#facc15] font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>{f.label}</button>)}
        </div>

        {loading ? <div className="text-center py-20 text-zinc-500">Loading bookings...</div> : bookings.length===0 ? <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-[20px]"><div className="text-3xl mb-2">📭</div><div className="font-semibold">No bookings for your garage</div><div className="text-xs text-zinc-500 mt-1">Only bookings for {garage?.name} appear here - Secure!</div></div> : (
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
      </main>
    </div>
  )
}
