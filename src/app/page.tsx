"use client"
import React, { useState } from 'react';
import { 
  MapPin, Star, Clock, Search, ShieldCheck, 
  Globe, Wrench, Phone, Zap, 
  ChevronDown, X, Check, Sparkles, Video, MessageCircle,
  Navigation, ArrowRight, Menu, Mic, Volume2
} from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'pa', name: 'Punjabi', flag: '🇵🇰' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'ps', name: 'Pashto', flag: '🇵🇰' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

const services = ['All Services', 'MOT', 'Full Service', 'Brakes', 'Diagnostics', 'Tyres', 'Clutch', 'Engine Repair', 'Bodywork'];

const garages = [
  {
    id: 1,
    name: 'KwikFit Glasgow Central',
    rating: 4.9,
    reviews: 312,
    open: true,
    closesAt: '18:00',
    languages: [languages[0], languages[1], languages[2]],
    services: ['MOT', 'Service', 'Brakes', 'Tyres'],
    distance: '0.3 miles',
    verified: true,
    sponsored: true,
    image: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=600&h=400&fit=crop',
    address: 'Argyle St, G2 8AH',
    priceNote: 'Quote First',
    responseTime: '~2m',
    aiVoice: true,
  },
  {
    id: 2,
    name: 'Punjab Motors Ltd',
    rating: 4.9,
    reviews: 187,
    open: true,
    closesAt: '19:30',
    languages: [languages[0], languages[1], languages[2], languages[6]],
    services: ['Engine Repair', 'Service', 'Diagnostics'],
    distance: '0.8 miles',
    verified: true,
    sponsored: true,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop',
    address: 'Pollokshaws Rd, G41 3RG',
    priceNote: 'Quote First',
    responseTime: '~1m',
    aiVoice: true,
  },
  {
    id: 3,
    name: 'Polish Auto Centre',
    rating: 4.8,
    reviews: 254,
    open: true,
    closesAt: '18:00',
    languages: [languages[0], languages[3], languages[8]],
    services: ['MOT', 'Clutch', 'Brakes', 'Bodywork'],
    distance: '1.2 miles',
    verified: true,
    sponsored: false,
    image: 'https://images.unsplash.com/photo-1632823471565-1ecdf9990772?w=600&h=400&fit=crop',
    address: 'London Rd, G40 1EU',
    priceNote: 'Quote First',
    responseTime: '~4m',
    aiVoice: true,
  },
];

export default function App() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [bookedGarage, setBookedGarage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 selection:bg-yellow-400 selection:text-black antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap'); *{font-family:'Geist',sans-serif} .mono{font-family:'Geist Mono',monospace}`}</style>

      {/* AI Voice Top Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-black text-center py-2 px-4 text-[12px] font-bold flex items-center justify-center gap-2">
        <Volume2 className="h-4 w-4" />
        <span>🔊 AI Voice - Customer ki language me baat! | Customer ki zuban me call, SMS, WhatsApp | 20 Languages Supported</span>
        <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full bg-black text-yellow-400 text-[10px]">NEW</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1280px] px-4 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-yellow-400 grid place-items-center text-black font-bold">AI</div>
            <span className="font-bold text-[18px]">GARAGE</span>
            <span className="ml-2 px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-[10px] mono flex items-center gap-1"><Mic className="h-3 w-3"/>AI VOICE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] mono text-zinc-400 hidden sm:block">20 Languages • Quote First • No Price Shock</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        <div className="rounded-[28px] bg-zinc-900 border border-zinc-800 p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-400/10 rounded-full blur-[80px]" />
          <h1 className="text-[32px] sm:text-[48px] font-bold leading-[0.9] tracking-[-0.03em] relative">Find Trusted Garages <br/><span className="text-zinc-500">in Glasgow</span></h1>
          <p className="mt-4 text-zinc-400 max-w-[600px] relative">AI-Powered • 20 Languages • <span className="text-yellow-400 font-bold">AI Voice in your language</span> • Quote First, Work After Confirm • Parts Choice</p>
          
          {/* Search + AI Voice Badge */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 relative">
            <div className="flex-1 h-12 rounded-full bg-black border border-zinc-800 flex items-center px-4 gap-2">
              <Search className="h-4 w-4 text-zinc-500" />
              <input placeholder="Postcode, e.g. G20" className="bg-transparent outline-none text-sm w-full" />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button onClick={()=>setShowLangDropdown(!showLangDropdown)} className="h-12 px-4 rounded-full bg-black border border-zinc-800 flex items-center gap-2 text-sm">
                  <span>{selectedLang.flag}</span> {selectedLang.name} <ChevronDown className="h-3 w-3"/>
                </button>
                {showLangDropdown && (
                  <div className="absolute top-14 left-0 w-64 max-h-64 overflow-auto rounded-xl bg-zinc-900 border border-zinc-800 p-2 z-20 grid grid-cols-1 gap-1">
                    {languages.map(l=>(
                      <button key={l.code} onClick={()=>{setSelectedLang(l); setShowLangDropdown(false)}} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-sm text-left">
                        <span>{l.flag}</span> {l.name} <span className="text-[10px] text-zinc-500 ml-auto">AI Voice</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="h-12 px-6 rounded-full bg-yellow-400 text-black font-bold text-sm">Search</button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400 text-black text-[11px] font-bold"><Volume2 className="h-3 w-3"/> AI Voice: Urdu, Polish, Punjabi, Arabic... 20 langs</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] mono">No Price Shock</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] mono">Parts: Garage / Customer</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] mono">Quote → Confirm → Work</span>
          </div>
        </div>
      </section>

      {/* Garage Cards */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {garages.map(g=>(
          <div key={g.id} className="rounded-[20px] bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition">
            <div className="relative h-[176px] overflow-hidden bg-zinc-800">
              <img src={g.image} alt={g.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                {g.sponsored && <span className="px-2.5 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-bold mono">SPONSORED</span>}
                <span className="px-2.5 py-1 rounded-full bg-white/90 text-black text-[10px] font-bold mono flex items-center gap-1"><ShieldCheck className="h-3 w-3"/>VERIFIED</span>
              </div>
              {/* AI Voice Badge - NEW */}
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 text-black text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <Mic className="h-3 w-3"/> AI VOICE
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                <span className="px-2 py-1 rounded-full bg-black/70 backdrop-blur border border-white/10 text-white text-[11px] mono">{g.distance}</span>
                <span className="px-2 py-1 rounded-full bg-yellow-400 text-black text-[11px] font-bold mono flex items-center gap-1"><Volume2 className="h-3 w-3"/>AI Voice • {g.languages.length} langs</span>
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold text-[15px]">{g.name}</div>
              <div className="mt-1 flex items-center gap-2 text-[12px]">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"/>{g.rating}</span>
                <span className="text-zinc-500 mono">({g.reviews})</span>
                <span className="text-zinc-400">{g.address}</span>
              </div>

              {/* AI Voice Explanation */}
              <div className="mt-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 p-2.5 flex gap-2">
                <div className="h-6 w-6 rounded-full bg-yellow-400 text-black grid place-items-center shrink-0"><Volume2 className="h-3.5 w-3.5"/></div>
                <div className="text-[11px] leading-[1.3]">
                  <span className="font-bold text-yellow-400">AI Voice Active:</span>
                  <span className="text-zinc-300"> Customer ko uski language me call, SMS, WhatsApp jayega! Urdu → Urdu, Polish → Polish</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.languages.map((l:any)=>(
                  <span key={l.code} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[11px]"><span>{l.flag}</span>{l.name}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={()=>setBookedGarage(g.name)} className="flex-1 h-10 rounded-full bg-yellow-400 text-black font-bold text-[13px]">Book Now - Quote First</button>
                <button className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 grid place-items-center"><Phone className="h-4 w-4"/></button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* For Garage Marketing */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-20">
        <div className="rounded-[24px] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 sm:p-8">
          <h3 className="text-xl font-bold">Garage Owner? Get More Customers with AI Voice Marketing!</h3>
          <p className="text-sm text-zinc-400 mt-2">Free listing vs Boost £99/mo - Top ranking + FB/Insta ads + WhatsApp push in 20 languages + AI Voice calls</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-black border border-zinc-800 p-4">
              <div className="font-bold">Free - £0</div>
              <div className="text-xs text-zinc-500 mt-1">Basic listing, Quote system, 20 languages badge, AI Voice badge</div>
            </div>
            <div className="rounded-xl bg-yellow-400 text-black p-4">
              <div className="font-bold flex items-center gap-2">Marketing Boost - £99/mo <span className="px-2 py-0.5 rounded-full bg-black text-yellow-400 text-[10px]">POPULAR</span></div>
              <div className="text-xs mt-1 font-medium">Top 3 ranking + FB/Insta ads + WhatsApp 500 + AI video + AI Voice calls in customer language</div>
              <div className="mt-2 text-[11px]">🔊 AI Voice: Customer ki language me automatic call!</div>
            </div>
          </div>
        </div>
      </section>

      {bookedGarage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white text-black px-5 h-12 flex items-center gap-3 shadow-2xl text-[13px] font-medium">
          <div className="h-7 w-7 rounded-full bg-black text-white grid place-items-center">✓</div>
          Quote requested from {bookedGarage} - AI will call you in {selectedLang.name}!
          <button onClick={()=>setBookedGarage(null)} className="ml-2 h-6 w-6 rounded-full bg-zinc-100 grid place-items-center"><X className="h-3.5 w-3.5"/></button>
        </div>
      )}
    </div>
  )
}
