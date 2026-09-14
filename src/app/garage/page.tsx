"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function GarageDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [garage, setGarage] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/garage/login"; return; }
    
    // Get garage profile from garages table
    const { data: gData } = await supabase.from("garages").select("*").eq("email", session.user.email).single();
    if (gData) setGarage(gData);

    // Fetch ONLY this garage's bookings
    const { data: bData } = await supabase
      .from("bookings")
      .select("*")
      .or(`garage_email.eq.${session.user.email},garage_name.eq.${gData?.name || "none"}`)
      .order("created_at", { ascending: false });

    if (bData) setBookings(bData);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const filtered = bookings.filter(b => filter === "all" ? true : b.status === filter);

  if (loading) return <div style={{ background: "#080808", minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff" }}>Loading your garage...</div>;

  return (
    <div className="dash">
      <aside className="side">
        <div className="brand"><div className="dot" />AI GARAGE</div>
        <div className="gInfo">
          <b>{garage?.name || "Garage"}</b>
          <span>{garage?.email}</span>
          <span style={{ color: "#facc15" }}>{garage?.address}</span>
        </div>
        <div className="stats-mini">
          <div><b>{bookings.length}</b><span>Total Bookings</span></div>
          <div><b>{bookings.filter(b=>b.status==="pending").length}</b><span>Pending</span></div>
        </div>
        <button className="logout" onClick={async()=>{await supabase.auth.signOut(); window.location.href="/garage/login";}}>Logout</button>
      </aside>

      <main className="main">
        <header>
          <div><h1>Bookings for {garage?.name}</h1><p>Only your garage bookings - private & secure</p></div>
          <div className="filters">
            {["all","pending","confirmed","completed"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={filter===f?"on":""}>{f} ({f==="all"?bookings.length:bookings.filter(b=>b.status===f).length})</button>
            ))}
          </div>
        </header>

        {filtered.length===0 ? (
          <div className="empty">
            <h3>No bookings yet for {garage?.name}</h3>
            <p>When customer selects your garage on main site, it will appear here automatically.</p>
            <a href="/" target="_blank">View Main Site →</a>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(b=>(
              <div key={b.id} className="card">
                <div className="top"><span className="reg">{b.reg_number}</span><span className={`st ${b.status}`}>{b.status}</span></div>
                <h3>{b.make || "Vehicle"} • {b.service_type}</h3>
                <p className="cust">{b.customer_name} • {b.customer_phone}</p>
                <p className="meta">{new Date(b.created_at).toLocaleString()}</p>
                <div className="acts">
                  {b.status==="pending" && <button onClick={()=>updateStatus(b.id,"confirmed")} className="gold">✓ Confirm Booking</button>}
                  {b.status==="confirmed" && <button onClick={()=>updateStatus(b.id,"completed")} className="white">✓ Mark Completed</button>}
                  <a href={`tel:${b.customer_phone}`} className="call">📞 Call</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=Inter:wght@400;700&display=swap');
        .dash { min-height: 100vh; background: #080808; display: flex; font-family: Inter, sans-serif; }
        .side { width: 300px; background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.08); padding: 24px; display: flex; flex-direction: column; }
        .brand { display: flex; align-items: center; gap: 10px; font-family: Syne, sans-serif; font-weight: 800; color: #fff; }
        .dot { width: 10px; height: 10px; background: #facc15; border-radius: 50%; box-shadow: 0 0 16px #facc15; }
        .gInfo { margin-top: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; }
        .gInfo b { color: #fff; display: block; font-size: 14px; } .gInfo span { color: rgba(255,255,255,0.5); font-size: 11px; display: block; margin-top: 2px; }
        .stats-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
        .stats-mini div { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px; text-align: center; }
        .stats-mini b { color: #facc15; font-size: 20px; display: block; } .stats-mini span { color: rgba(255,255,255,0.5); font-size: 10px; text-transform: uppercase; }
        .logout { margin-top: auto; background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 12px; border-radius: 12px; cursor: pointer; }
        .main { flex: 1; padding: 24px 28px; overflow-y: auto; }
        header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        header h1 { color: #fff; font-family: Syne, sans-serif; font-size: 22px; margin: 0; } header p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0 0; }
        .filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .filters button { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; cursor: pointer; text-transform: uppercase; }
        .filters button.on { background: #facc15; color: #000; border-color: #facc15; }
        .empty { margin-top: 60px; text-align: center; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.12); border-radius: 20px; padding: 40px; }
        .empty h3 { color: #fff; margin: 0; } .empty p { color: rgba(255,255,255,0.5); font-size: 13px; } .empty a { color: #facc15; font-weight: 800; text-decoration: none; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 12px; margin-top: 20px; }
        .card { background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 16px; }
        .top { display: flex; justify-content: space-between; }
        .reg { background: #facc15; color: #000; padding: 4px 10px; border-radius: 6px; font-weight: 900; font-size: 13px; }
        .st { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 10px; }
        .st.pending{ background: rgba(250,204,21,0.2); color: #facc15; } .st.confirmed{ background: rgba(34,197,94,0.2); color: #22c55e; } .st.completed{ background: rgba(255,255,255,0.1); color: #fff; }
        .card h3 { color: #fff; font-size: 14px; margin: 10px 0 4px; } .cust { color: rgba(255,255,255,0.7); font-size: 13px; margin: 0; font-weight: 700; } .meta { color: rgba(255,255,255,0.4); font-size: 11px; margin: 4px 0 0; }
        .acts { display: flex; gap: 8px; margin-top: 12px; }
        .gold { flex: 1; background: #facc15; color: #000; border: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; }
        .white { flex: 1; background: #fff; color: #000; border: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; }
        .call { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 12px; text-decoration: none; }
      `}</style>
    </div>
  );
}
