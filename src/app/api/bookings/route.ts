import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url ||!key) throw new Error("Missing env");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await req.json();
    console.log("BODY:", body);

    const { booking_date, time_slot, car_reg, service_type, customer_name, phone } = body;

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty body received - frontend not sending data" }, { status: 400 });
    }

    const cleanReg = (car_reg || "").toString().toUpperCase().trim();
    if (!cleanReg) return NextResponse.json({ error: "car_reg empty" }, { status: 400 });

    const ref = `AG-${Math.random().toString(36).substring(2,6).toUpperCase()}${Date.now().toString().slice(-4)}`;

    const payload: any = {
      booking_date: booking_date,
      time_slot: time_slot,
      car_reg: cleanReg,
      service_type: service_type || "Oil Change",
      customer_name: customer_name || "Guest",
      phone: phone || "0",
      status: "pending_quote",
      booking_ref: ref,
      ref: ref,
    };

    console.log("INSERTING:", payload);

    const { data, error } = await supabase.from("bookings").insert([payload]).select().single();

    if (error) {
      console.log("Insert error:", error.message);
      // Fallback - remove ref if column not exists
      if (error.message.toLowerCase().includes("ref")) {
        delete payload.ref;
        const r2 = await supabase.from("bookings").insert([payload]).select().single();
        if (!r2.error) {
          return NextResponse.json({ ref: r2.data.booking_ref || r2.data.id, id: r2.data.booking_ref || r2.data.id, booking: r2.data, success: true });
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const finalRef = data.booking_ref || data.ref || data.id;
    return NextResponse.json({ ref: finalRef, id: finalRef, booking_ref: finalRef, success: true, booking: data });

  } catch (e: any) {
    console.error("CRASH", e);
    return NextResponse.json({ error: "Empty or invalid json - " + e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}