"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function GarageLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login'|'signup'>('login')

  const handleAuth = async (e:any) => {
    e.preventDefault()
    setLoading(true)
    
    if(mode==='signup'){
      const { data, error } = await supabase.auth.signUp({ email, password })
      if(error){ alert(error.message); setLoading(false); return }
      
      // Check if garage owner exists
      const { data: owner } = await supabase.from('garage_owners').select('*').eq('email', email).single()
      if(!owner){
        alert('Signup done but email not linked to any garage! Contact admin to link your garage. Your email: '+email)
      } else {
        alert('Account created! Now login.')
        setMode('login')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if(error){ alert(error.message); setLoading(false); return }
      router.push('/garage')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white grid place-items-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap'); *{font-family:Geist,sans-serif}`}</style>
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[24px] p-8">
        <div className="flex items-center gap-2 mb-6"><div className="h-10 w-10 bg-[#facc15] rounded-xl grid place-items-center text-black font-bold text-lg">AI</div><div><div className="font-bold">GARAGE OWNER LOGIN</div><div className="text-xs text-zinc-500">Secure access - Only your bookings</div></div></div>

        <div className="flex gap-2 mb-6 bg-black border border-zinc-800 rounded-full p-1">
          <button onClick={()=>setMode('login')} className={`flex-1 h-9 rounded-full text-sm font-bold ${mode==='login' ? 'bg-[#facc15] text-black' : 'text-zinc-500'}`}>Login</button>
          <button onClick={()=>setMode('signup')} className={`flex-1 h-9 rounded-full text-sm font-bold ${mode==='signup' ? 'bg-[#facc15] text-black' : 'text-zinc-500'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div><label className="text-[10px] text-zinc-500 uppercase tracking-wider">Garage Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="owner@haji-autocenter.co.uk" className="mt-1 w-full h-12 px-4 rounded-xl bg-black border border-zinc-800 text-sm outline-none focus:border-[#facc15]"/></div>
          <div><label className="text-[10px] text-zinc-500 uppercase tracking-wider">Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full h-12 px-4 rounded-xl bg-black border border-zinc-800 text-sm outline-none focus:border-[#facc15]"/></div>
          <button disabled={loading} className="w-full h-12 rounded-full bg-[#facc15] text-black font-bold text-sm hover:bg-yellow-400 disabled:opacity-50">{loading ? 'Please wait...' : mode==='login' ? 'Login to Garage Panel →' : 'Create Account →'}</button>
        </form>

        <div className="mt-6 bg-black border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
          <div className="font-bold text-white text-[11px] mb-1">🔒 How secure login works:</div>
          <div>• Each garage has 1 email linked (e.g. haji auto center → owner@gmail.com)</div>
          <div>• Only that email can see & update that garage's bookings</div>
          <div>• Customers still track without login via /track/REF</div>
          <div className="mt-2 text-zinc-500">For demo: First Sign Up with your email, then admin will link garage.</div>
        </div>

        <div className="mt-4 text-center"><a href="/" className="text-xs text-zinc-500 hover:text-zinc-300">← Back to Home</a></div>
      </div>
    </div>
  )
}
