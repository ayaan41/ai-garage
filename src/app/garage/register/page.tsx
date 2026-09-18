"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Plan = { id: string; name: string; price: string; per: string; desc: string; popular?: boolean };

const PLANS: Plan[] = [
  { id: "payg", name: "Pay As You Go", price: "£29", per: "/job", desc: "No monthly fee" },
  { id: "monthly", name: "Pro Monthly", price: "£149", per: "/month", desc: "Unlimited bookings - Most popular", popular: true },
  { id: "scale", name: "Scale", price: "£299", per: "/month", desc: "For large teams" },
];

const PAY_METHODS = [
  { id: "card", label: "💳 Card" },
  { id: "apple", label: "🍎 Apple Pay" },
  { id: "google", label: "G Pay" },
];

export default function GarageRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("monthly");
  const [payMethod, setPayMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", pass: "" });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", holder: "" });

  const selectedPlan = PLANS.find(p => p.id === plan)!;

  const validateStep1 = () => {
    const e: Record<string,string> = {};
    if(!form.name.trim()) e.name="Required";
    if(!/^\S+@\S+\.\S+$/.test(form.email)) e.email="Valid email required";
    if(!form.phone.trim()) e.phone="Required";
    if(form.pass.length < 8) e.pass="Min 8 chars";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validatePay = () => {
    if(payMethod !== "card") return true;
    const e: Record<string,string> = {};
    if(card.number.replace(/\s/g,"").length < 16) e.number="16-digit required";
    if(!card.expiry.includes("/")) e.expiry="MM/YY";
    if(card.cvc.length < 3) e.cvc="Required";
    if(!card.holder.trim()) e.holder="Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const createAccount = () => {
    if(!validatePay()) return;
    setLoading(true);
    
    setTimeout(() => {
      if(card.number.includes("0002")){
        setErrors({payment:"Card declined - Try 4242 4242 4242 4242"});
        setLoading(false);
        return;
      }
      
      const accounts = JSON.parse(localStorage.getItem("garage_accounts") || "[]");
      if(accounts.some((a:any)=> a.email.toLowerCase()===form.email.toLowerCase())){
        setErrors({payment:"Email already exists - Please login"});
        setLoading(false);
        return;
      }

      const newAcc = {
        id: `GRG-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone.trim(),
        password: form.pass,
        plan, payMethod,
        createdAt: new Date().toISOString(),
        jobs: []
      };

      localStorage.setItem("garage_accounts", JSON.stringify([...accounts, newAcc]));
      localStorage.setItem("garage_user", JSON.stringify(newAcc));
      localStorage.setItem("garage_email", newAcc.email);
      
      setLoading(false);
      router.push("/garage");
    }, 1200);
  };

  // Reusable styles - Baad me problem nahi hogi
  const inputStyle = (hasError?: string) => ({
    width:"100%", height:"44px", borderRadius:"10px", background:"#1C1C1F",
    border:`1px solid ${hasError?"#ef4444":"rgba(255,255,255,0.08)"}`,
    color:"white", padding:"0 14px", fontSize:"14px", outline:"none"
  } as const);

  const labelStyle = { color:"#A1A1AA", fontSize:"10px", fontWeight:600, letterSpacing:"0.5px", marginBottom:"6px" } as const;

  return (
    <div style={{minHeight:"100vh", background:"#09090B", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"}}>
      <div style={{width:"100%", maxWidth:"460px"}}>
        {/* Header */}
        <div style={{textAlign:"center", marginBottom:"24px"}}>
          <Link href="/" style={{display:"inline-flex", alignItems:"center", gap:"10px", textDecoration:"none"}}>
            <div style={{width:"32px", height:"32px", borderRadius:"10px", background:"white", color:"black", display:"grid", placeItems:"center", fontWeight:900}}>AI</div>
            <span style={{color:"white", fontWeight:600}}>GarageOS</span>
          </Link>
          <h1 style={{color:"white", fontSize:"22px", fontWeight:600, marginTop:"20px"}}>
            {step===1 ? "Create your garage account" : step===2 ? "Choose your payment plan" : "Secure payment"}
          </h1>
          <div style={{display:"flex", gap:"6px", justifyContent:"center", marginTop:"14px"}}>
            {[1,2,3].map(s=> <div key={s} style={{height:"3px", width:"32px", borderRadius:"10px", background: step>=s ? "white" : "rgba(255,255,255,0.12)"}} />)}
          </div>
          <div style={{color:"#52525B", fontSize:"10px", marginTop:"8px", letterSpacing:"1px", fontWeight:600}}>STEP {step} OF 3</div>
        </div>

        {/* Main Card - Same as screen */}
        <div style={{background:"#141415", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"22px"}}>
          {step===1 && (
            <>
              <div style={{marginBottom:"12px"}}>
                <div style={labelStyle}>GARAGE NAME *</div>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Elite Auto Care" style={inputStyle(errors.name)} />
                {errors.name && <div style={{color:"#ef4444", fontSize:"11px", marginTop:"4px"}}>{errors.name}</div>}
              </div>
              <div style={{marginBottom:"12px"}}>
                <div style={labelStyle}>WORK EMAIL * (LOGIN ID)</div>
                <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="workshop@company.com" style={inputStyle(errors.email)} />
                {errors.email && <div style={{color:"#ef4444", fontSize:"11px", marginTop:"4px"}}>{errors.email}</div>}
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px"}}>
                <div>
                  <div style={labelStyle}>PHONE * (LOGIN)</div>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="07xxx xxxxxx" style={inputStyle(errors.phone)} />
                  {errors.phone && <div style={{color:"#ef4444", fontSize:"11px", marginTop:"4px"}}>{errors.phone}</div>}
                </div>
                <div>
                  <div style={labelStyle}>PASSWORD *</div>
                  <input type="password" value={form.pass} onChange={e=>setForm({...form,pass:e.target.value})} placeholder="Min 8 chars" style={inputStyle(errors.pass)} />
                  {errors.pass && <div style={{color:"#ef4444", fontSize:"11px", marginTop:"4px"}}>{errors.pass}</div>}
                </div>
              </div>
              <button onClick={()=> validateStep1() && setStep(2)} style={{width:"100%", height:"44px", borderRadius:"10px", background:"white", color:"black", fontWeight:600, border:"none", cursor:"pointer"}}>Continue to payment plans →</button>
            </>
          )}

          {step===2 && (
            <>
              {PLANS.map(p=>{
                const active = plan===p.id;
                return (
                  <div key={p.id} onClick={()=>setPlan(p.id)} style={{border:`1px solid ${active?"white":"rgba(255,255,255,0.08)"}`, background: active?"#1C1C1F":"#0F0F10", borderRadius:"12px", padding:"14px", marginBottom:"10px", cursor:"pointer"}}>
                    <div style={{display:"flex", justifyContent:"space-between"}}>
                      <div style={{display:"flex", gap:"10px"}}>
                        <div style={{width:"18px", height:"18px", borderRadius:"50%", border:`1.5px solid ${active?"white":"rgba(255,255,255,0.2)"}`, display:"grid", placeItems:"center"}}>{active && <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"white"}}/>}</div>
                        <div>
                          <div style={{color:"white", fontWeight:600, fontSize:"13.5px"}}>{p.name} {p.popular && <span style={{fontSize:"9px", background:"white", color:"black", padding:"2px 6px", borderRadius:"10px", marginLeft:"6px"}}>POPULAR</span>}</div>
                          <div style={{color:"#71717A", fontSize:"11px", marginTop:"2px"}}>{p.desc}</div>
                        </div>
                      </div>
                      <div style={{color:"white", fontWeight:700}}>{p.price}<span style={{fontSize:"11px", color:"#71717A"}}>{p.per}</span></div>
                    </div>
                  </div>
                );
              })}
              <div style={{display:"flex", gap:"10px", marginTop:"6px"}}>
                <button onClick={()=>setStep(1)} style={{height:"44px", padding:"0 18px", borderRadius:"10px", background:"#1C1C1F", border:"1px solid rgba(255,255,255,0.1)", color:"white"}}>Back</button>
                <button onClick={()=>setStep(3)} style={{flex:1, height:"44px", borderRadius:"10px", background:"white", color:"black", fontWeight:600, border:"none"}}>Continue to payment →</button>
              </div>
            </>
          )}

          {step===3 && (
            <>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginBottom:"14px"}}>
                {PAY_METHODS.map(m=>(
                  <div key={m.id} onClick={()=>setPayMethod(m.id)} style={{height:"40px", borderRadius:"10px", border:`1px solid ${payMethod===m.id?"white":"rgba(255,255,255,0.08)"}`, background: payMethod===m.id?"#1C1C1F":"#0F0F10", display:"grid", placeItems:"center", color:"white", fontSize:"12px", cursor:"pointer"}}>{m.label}</div>
                ))}
              </div>

              {payMethod==="card" && (
                <>
                  <div style={{marginBottom:"10px"}}><div style={labelStyle}>CARD NUMBER *</div><input value={card.number} onChange={e=>setCard({...card, number:e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim()})} placeholder="4242 4242 4242 4242" maxLength={19} style={inputStyle(errors.number)} /></div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px"}}>
                    <div><div style={labelStyle}>EXPIRY MM/YY *</div><input value={card.expiry} onChange={e=>{let v=e.target.value.replace(/\D/g,""); if(v.length>=2) v=v.slice(0,2)+"/"+v.slice(2,4); setCard({...card,expiry:v})}} placeholder="12/28" maxLength={5} style={inputStyle(errors.expiry)} /></div>
                    <div><div style={labelStyle}>CVC *</div><input value={card.cvc} onChange={e=>setCard({...card,cvc:e.target.value.replace(/\D/g,"")})} placeholder="123" style={inputStyle(errors.cvc)} /></div>
                  </div>
                  <div style={{marginBottom:"14px"}}><div style={labelStyle}>CARD HOLDER NAME *</div><input value={card.holder} onChange={e=>setCard({...card,holder:e.target.value})} placeholder="Name on card" style={inputStyle(errors.holder)} /></div>
                </>
              )}

              {errors.payment && <div style={{background:"rgba(239,68,68,0.1)", border:"1px solid #ef4444", color:"#ef4444", padding:"10px", borderRadius:"10px", fontSize:"12px", marginBottom:"12px"}}>{errors.payment}</div>}

              <div style={{background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"12px", marginBottom:"14px", fontSize:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><span style={{color:"#A1A1AA"}}>Garage:</span><span style={{color:"white"}}>{form.name}</span></div>
                <div style={{display:"flex", justifyContent:"space-between", marginTop:"4px"}}><span style={{color:"#A1A1AA"}}>Plan:</span><span style={{color:"white", fontWeight:700}}>{selectedPlan.price}{selectedPlan.per}</span></div>
              </div>

              <div style={{display:"flex", gap:"10px"}}>
                <button onClick={()=>setStep(2)} style={{height:"44px", padding:"0 18px", borderRadius:"10px", background:"#1C1C1F", border:"1px solid rgba(255,255,255,0.1)", color:"white"}}>Back</button>
                <button onClick={createAccount} disabled={loading} style={{flex:1, height:"44px", borderRadius:"10px", background:"white", color:"black", fontWeight:600, border:"none", opacity:loading?0.6:1}}>{loading?"Processing...":`Pay & Create • ${selectedPlan.price}`}</button>
              </div>
            </>
          )}
        </div>

        <div style={{textAlign:"center", marginTop:"16px", fontSize:"12px", color:"#52525B"}}>
          Already have account? <Link href="/garage/login" style={{color:"#A1A1AA", textDecoration:"underline"}}>Login with Email / Phone</Link>
        </div>
      </div>
    </div>
  );
}