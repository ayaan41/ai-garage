"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Garage = { id: string; name: string; address: string; phone: string; languages: string[]; services: string[]; verified: boolean; sponsored: boolean; rating: number; review_count: number; postcode: string }

const languageFlags: any = { en: '🇬🇧', ur: '🇵🇰', pa: '🇵🇰', pl: '🇵🇱', ro: '🇷🇴', ar: '🇸🇦', hi: '🇮🇳', bn: '🇧🇩', lt: '🇱🇹', lv: '🇱🇻', tr: '🇹🇷', it: '🇮🇹', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', pt: '🇵🇹', so: '🇸🇴', gu: '🇮🇳', ps: '🇵🇰', zh: '🇨🇳' }
const languageNames: any = { en: 'English', ur: 'Urdu', pa: 'Punjabi', pl: 'Polish', ro: 'Romanian', ar: 'Arabic', hi: 'Hindi', bn: 'Bengali', lt: 'Lithuanian', lv: 'Latvian', tr: 'Turkish', it: 'Italian', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese', so: 'Somali', gu: 'Gujarati', ps: 'Pashto', zh: 'Chinese' }

const allTimeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']

export default function HomePage() {
  const [garages, setGarages] = useState<Garage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGarage, setSelectedGarage] = useState<Garage|null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingLang, setBookingLang] = useState('en')
  const [form, setForm] = useState({ name: '', phone: '', car_reg: '', service: 'MOT', note: '' })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState('10:00')
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const getNext14Days = () => {
    const days = []
    for (let i=0;i<14;i++){ const d=new Date(); d.setDate(d.getDate()+i); days.push({ date:d.toISOString().split('T')[0], day:d.getDate(), month:d.toLocaleString('en',{month:'short'}), weekday:d.toLocaleString('en',{weekday:'short'}), isToday:i===0, isWeekend:d.getDay()===0||d.getDay()===6 }) }
    return days
  }
  const next14Days = getNext14Days()

  useEffect(()=>{ fetchGarages() }, [])
  useEffect(()=>{ if(selectedGarage && selectedDate) fetchBookedSlots() }, [selectedGarage, selectedDate])

  const fetchGarages = async () => {
    setLoading(true)
    const { data } = await supabase.from('garages').select('*').eq('verified', true).order('sponsored',{ascending:false})
    if(data) setGarages(data)
    setLoading(false)
  }

  const fetchBookedSlots = async () => {
    if(!selectedGarage) return
    setLoadingSlots(true)
    const { data } = await supabase.from('bookings').select('booking_time').eq('garage_id', selectedGarage.id).eq('booking_date', selectedDate).neq('status','cancelled')
    if(data){ setBookedSlots(data.map((b:any)=>b.booking_time.slice(0,5))) }
    setLoadingSlots(false)
  }

  const handleBooking = async () => {
    if(!selectedGarage) return
    if(!form.name || !form.phone || !form.car_reg){ alert('Please fill Name, Phone, Car Reg'); return }
    setSubmitting(true)
    try{
      const res = await fetch('/api/bookings', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          garage_id:selectedGarage.id, customer_name:form.name, customer_phone:form.phone,
          car_reg:form.car_reg, service_type:form.service, description:form.note,
          preferred_language:bookingLang, booking_date:selectedDate, booking_time:selectedTime
        })
      })
      const data = await res.json()
      if(data.success){ setBookingSuccess(data); setShowBooking(false); setForm({name:'',phone:'',car_reg:'',service:'MOT',note:''}); setBookedSlots([...bookedSlots, selectedTime]) }
      else alert('Error: '+data.error)
    }catch(e:any){ alert('Error: '+e.message) }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap'); *{font-family:Geist,sans-serif}`}</style>
      <div className="bg-[#facc15] text-black text-center py-2 px-4 text-xs font-bold">🎤 AI Voice: Customer speaks Urdu? AI replies Urdu | Polish? AI replies Polish | SMS + WhatsApp in customer's language + English</div>
      <header className="border-b border-zinc-800 p-4"><div className="max-w-6xl mx-auto flex justify-between items-center"><div className="flex items-center gap-2"><div className="h-8 w-8 bg-[#facc15] rounded-lg grid place-items-center text-black font-bold">AI</div><span className="font-bold text-lg">GARAGE</span><span className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full text-zinc-400">AI VOICE • 20 Languages</span></div><div className="text-xs text-zinc-500">Glasgow • {garages.length} Garages</div></div></header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-6 sm:p-10 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Find Trusted Garages<br/><span className="text-zinc-500">in Glasgow</span></h1>
          <p className="mt-3 text-zinc-400 text-sm max-w-2xl">Real garages from Supabase • Book via Website/App → SMS & WhatsApp confirmation in your language + English • Calls? AI answers in your language</p>
          <div className="mt-6 flex gap-2"><select value={bookingLang} onChange={e=>setBookingLang(e.target.value)} className="h-12 px-4 rounded-full bg-black border border-zinc-800 text-sm">{Object.keys(languageNames).map(code=>(<option key={code} value={code}>{languageFlags[code]} {languageNames[code]} - I speak this</option>))}</select></div>
        </div>

        {loading ? <div className="text-center py-20 text-zinc-500">Loading...</div> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {garages.map(g=>(
              <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4">
                {g.sponsored && <span className="text-[10px] font-bold bg-[#facc15] text-black px-2 py-1 rounded-full">SPONSORED</span>}
                <div className="font-semibold mt-2">{g.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{g.address} • {g.postcode} • ⭐ {g.rating} ({g.review_count})</div>
                <div className="flex gap-1 mt-2 flex-wrap">{(g.languages||['en']).map((lang:any)=>(<span key={lang} className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full">{languageFlags[lang]} {languageNames[lang]||lang}</span>))}</div>
                <div className="mt-3 p-2 bg-zinc-800/50 border border-zinc-800 rounded-xl text-[11px] text-zinc-300">🎤 AI Voice Active - Calls in customer language → SMS/WhatsApp in that language + English</div>
                <button onClick={()=>{setSelectedGarage(g); setSelectedDate(new Date().toISOString().split('T')[0]); setShowBooking(true)}} className="mt-3 w-full h-10 rounded-full bg-[#facc15] text-black font-bold text-sm">Book Now - SMS in {languageNames[bookingLang]}</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showBooking && selectedGarage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 grid place-items-center p-4 overflow-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] w-full max-w-lg p-6 my-8">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Book at {selectedGarage.name}</h3><button onClick={()=>setShowBooking(false)} className="h-8 w-8 rounded-full bg-zinc-800 grid place-items-center">✕</button></div>
            
            <div className="space-y-4">
              <div className="p-3 bg-[#facc15]/10 border border-[#facc15]/20 rounded-xl text-xs"><div className="font-bold text-[#facc15]">You will receive:</div><div className="text-zinc-300 mt-1">✓ SMS + WhatsApp in {languageNames[bookingLang]} + English<br/>✓ Booking Ref + Drop time<br/>✓ Track link</div></div>

              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Your Name *" className="w-full h-11 px-4 rounded-full bg-black border border-zinc-800 text-sm" />
              <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone (+447... or 07...) *" className="w-full h-11 px-4 rounded-full bg-black border border-zinc-800 text-sm" />
              <input value={form.car_reg} onChange={e=>setForm({...form, car_reg:e.target.value})} placeholder="Car Reg - KM66YKM *" className="w-full h-11 px-4 rounded-full bg-black border border-zinc-800 text-sm uppercase" />
              
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Service Type *</label>
                <select value={form.service} onChange={e=>setForm({...form, service:e.target.value})} className="w-full h-11 px-4 rounded-full bg-black border border-zinc-800 text-sm">
                  <option>MOT</option><option>Service</option><option>Brakes</option><option>Engine Repair</option><option>Diagnostics</option><option>Clutch</option><option>Tyres</option><option>Full Service</option><option>Other</option>
                </select>
              </div>

              {/* NEW - Customer Note */}
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">What do you want to get done? - Note (Optional)</label>
                <textarea value={form.note} onChange={e=>setForm({...form, note:e.target.value})} placeholder="Example: Brake pads making noise, need MOT + service, engine light on, clutch slipping etc... Write in your own language - Urdu, Punjabi, Polish, English any language!" className="w-full min-h-[80px] p-3 rounded-2xl bg-black border border-zinc-800 text-sm resize-none" rows={3}></textarea>
                <div className="text-[10px] text-zinc-500 mt-1">💡 You can write in any language - {languageNames[bookingLang]} - AI will understand!</div>
              </div>

              <select value={bookingLang} onChange={e=>setBookingLang(e.target.value)} className="w-full h-11 px-4 rounded-full bg-black border border-zinc-800 text-sm">
                {Object.keys(languageNames).map(code=>(<option key={code} value={code}>{languageFlags[code]} {languageNames[code]} - My Language</option>))}
              </select>

              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Select Date - Today is {new Date().toLocaleDateString('en-GB')} - Calendar</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {next14Days.map(d=>(
                    <button key={d.date} onClick={()=>setSelectedDate(d.date)} className={`p-2 rounded-xl text-center border text-xs ${selectedDate===d.date ? 'bg-[#facc15] text-black border-[#facc15] font-bold' : d.isWeekend ? 'bg-zinc-800/50 border-zinc-800 text-zinc-500' : 'bg-black border-zinc-800 hover:border-zinc-700'}`}>
                      <div className="text-[10px]">{d.weekday}</div><div className="text-sm font-bold">{d.day}</div><div className="text-[9px]">{d.month}</div>{d.isToday && <div className="text-[8px] mt-0.5 bg-[#facc15] text-black px-1 rounded-full">TODAY</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-2 block flex justify-between"><span>Available Times for {selectedDate} {selectedDate===new Date().toISOString().split('T')[0] && '(Today)'}</span>{loadingSlots && <span className="text-[#facc15]">Checking...</span>}</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-auto p-1">
                  {allTimeSlots.map(time=>{
                    const isBooked=bookedSlots.includes(time); const isSelected=selectedTime===time; const hour=parseInt(time.split(':')[0]); const isPast=selectedDate===new Date().toISOString().split('T')[0] && hour < new Date().getHours(); const disabled=isBooked||isPast;
                    return <button key={time} onClick={()=>!disabled && setSelectedTime(time)} disabled={disabled} className={`h-10 rounded-full text-xs font-medium border ${isSelected ? 'bg-[#facc15] text-black border-[#facc15] font-bold' : disabled ? 'bg-zinc-900 border-zinc-800 text-zinc-600 line-through cursor-not-allowed' : 'bg-black border-zinc-800 hover:border-zinc-600 text-white'}`}>{time} {isBooked ? '✕' : isPast ? '✕' : '○'}</button>
                  })}
                </div>
                <div className="flex gap-3 mt-2 text-[10px] text-zinc-500"><span>🟡 Selected</span><span>○ Available</span><span>✕ Booked/Past</span></div>
              </div>

              <button onClick={handleBooking} disabled={submitting || bookedSlots.includes(selectedTime)} className="w-full h-12 rounded-full bg-[#facc15] text-black font-bold disabled:opacity-50">{submitting ? 'Booking...' : `Confirm - ${selectedDate} at ${selectedTime} - SMS in ${languageNames[bookingLang]} + English`}</button>
            </div>
          </div>
        </div>
      )}

      {bookingSuccess && (<div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-4 rounded-2xl shadow-2xl max-w-md w-[90%] z-50"><div className="font-bold">✅ Booking Confirmed! Ref: {bookingSuccess.booking_ref}</div><div className="text-xs mt-2 whitespace-pre-wrap">{bookingSuccess.message}</div><button onClick={()=>setBookingSuccess(null)} className="mt-3 w-full h-10 rounded-full bg-black text-white font-bold text-sm">Close</button></div>)}
    </div>
  )
}
