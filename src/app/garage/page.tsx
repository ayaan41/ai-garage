"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(()=>{ init(); }, []);
  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if(!session){ window.location.href="/garage/login"; return; }
    setUserEmail(session.user.email || "");
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if(data) setBookings(data);
  };

  const updateStatus = async (id:string, status:string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(b=>b.map(x=>x.id===id?{...x,status}:x));
  };

  const filtered = bookings.filter(b=>{
    if(filter==="all") return true;
    return b.status===filter;
  });

  return (
    <div className="dash">
      <div className="bg"><div className="flow"></div></div>
      <aside className="side">
        <div className="s-logo">AI GARAGE</div>
        <div className="s-email">{userEmail}</div>
        <nav className="s-nav">
          <a className="active">● Bookings</a>
          <a>○ Analytics</a>
          <a>○ Customers</a>
          <a>○ Settings</a>
        </nav>
        <button onClick={async()=>{await supabase.auth.signOut(); window.location.href="/garage/login";}} className="logout">Logout</button>
      </aside>

      <main className="main">
        <header className="top">
          <div><h1>Bookings</h1><p>{filtered.length} active requests</p></div>
          <div className="filters">
            {["all","pending","confirmed","completed"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={filter===f?"f-active":"f"}>{f}</button>
            ))}
          </div>
        </header>

        <div className="stats">
          <div className="stat"><span>{bookings.filter(b=>b.status==="pending").length}</span><label>Pending</label></div>
          <div className="stat gold"><span>£{bookings.length*75}</span><label>Est. Revenue</label></div>
          <div className="stat"><span>{bookings.length}</span><label>Total</label></div>
        </div>

        <div className="grid">
          {filtered.map(b=>(
            <div key={b.id} className="card">
              <div className="c-top"><span className="reg">{b.reg_number}</span><span className={`status ${b.status}`}>{b.status}</span></div>
              <h3>{b.make} {b.model} • {b.service_type}</h3>
              <p>{b.customer_name} • {b.customer_phone}</p>
              <p className="meta">{b.garage_name} • {new Date(b.created_at).toLocaleDateString()}</p>
              <div className="actions">
                <button onClick={()=>updateStatus(b.id,"confirmed")} className="a-gold">Confirm</button>
                <button onClick={()=>updateStatus(b.id,"completed")} className="a-dark">Complete</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        .dash { min-height: 100vh; background: #050505; display: flex; position: relative; }
        .bg { position: fixed; inset: 0; z-index: 0; }
        .flow { position: absolute; inset: -50%; background: radial-gradient(ellipse at 20% 0%, rgba(250,204,21,0.12) 0%, transparent 50%), linear-gradient(180deg, #050505 0%, #0a0a0a 100%); }
        .side { width: 260px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.08); padding: 24px; position: relative; z-index: 1; display: flex; flex-direction: column; }
        .s-logo { font-weight: 900; color: #fff; letter-spacing: 1px; }
        .s-email { color: #facc15; font-size: 11px; margin-top: 6px; font-weight: 700; }
        .s-nav { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
        .s-nav a { color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 600; cursor: pointer; }
        .s-nav a.active { color: #fff; }
        .logout { margin-top: auto; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 10px; cursor: pointer; }
        .main { flex: 1; padding: 24px 32px; position: relative; z-index: 1; overflow-y: auto; }
        .top { display: flex; justify-content: space-between; align-items: flex-end; }
        .top h1 { color: #fff; font-size: 28px; font-weight: 900; margin: 0; }
        .top p { color: rgba(255,255,255,0.5); font-size: 13px; margin: 4px 0 0; }
        .filters { display: flex; gap: 8px; }
        .f, .f-active { padding: 8px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .f-active { background: #facc15; color: #000; border-color: #facc15; }
        .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin: 20px 0; }
        .stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px 20px; }
        .stat.gold { background: linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.05)); border-color: rgba(250,204,21,0.3); }
        .stat span { color: #fff; font-size: 22px; font-weight: 900; display: block; } .stat.gold span{ color: #facc15; }
        .stat label { color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 14px; }
        .card { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 18px; transition: all 0.3s; }
        .card:hover { transform: translateY(-2px); border-color: rgba(250,204,21,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .c-top { display: flex; justify-content: space-between; align-items: center; }
        .reg { background: #facc15; color: #000; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 13px; }
        .status { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 10px; letter-spacing: 1px; }
        .status.pending{ background: rgba(250,204,21,0.2); color: #facc15; } .status.confirmed{ background: rgba(34,197,94,0.2); color: #22c55e; } .status.completed{ background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
        .card h3 { color: #fff; font-size: 14px; font-weight: 700; margin: 12px 0 4px; }
        .card p { color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; }
        .card .meta { font-size: 10px; margin-top: 6px; opacity: 0.7; }
        .actions { display: flex; gap: 8px; margin-top: 12px; }
        .a-gold { flex: 1; background: #facc15; color: #000; border: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; }
        .a-dark { flex: 1; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 10px; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; }
        @media(max-width: 900px){ .side{ display:none; } .main{ padding: 20px; } .grid{ grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
