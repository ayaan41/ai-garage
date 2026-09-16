import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = "";
  for (let i = 0; i < 8; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
  return `AG-${r}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref") || searchParams.get("booking_ref") || searchParams.get("id");
  const limit = searchParams.get("limit");
  try {
    if (ref) {
      let { data } = await supabaseAdmin.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
      if (!data) {
        const r2 = await supabaseAdmin.from("bookings").select("*").eq("ref", ref).maybeSingle();
        if (r2.data) data = r2.data;
      }
      if (!data) {
        const r3 = await supabaseAdmin.from("bookings").select("*").eq("id", ref).maybeSingle();
        if (r3.data) data = r3.data;
      }
      if (!data) return NextResponse.json({ error: `Booking ${ref} not found` }, { status: 404 });
      return NextResponse.json(data);
    }
    const lim = limit? parseInt(limit) : 100;
    const { data, error } = await supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false }).limit(lim);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Empty json" }, { status: 400 });

    let carRegInput = (body.car_reg || body.vehicle_reg || "").toString().trim().toUpperCase();
    if (!carRegInput) carRegInput = "KM77YHK";

    const bookingRef = body.booking_ref || body.ref || genRef();

    // SIRF YE COLUMNS - car_registration HATA DIYA - YAHI ERROR THA!
    const payload: any = {
      booking_ref: bookingRef,
      ref: bookingRef,
      car_reg: carRegInput,
      vehicle_reg: carRegInput,
      customer_name: body.customer_name || body.name || "ahmadd",
      phone: body.phone || "09989897677",
      service_type: body.service_type || body.service || "Oil Change",
      booking_date: body.booking_date || body.date || new Date().toISOString(),
      time_slot: body.time_slot || body.time || "09:00",
      status: body.status || "pending_quote",
    };

    // Optional fields sirf agar bheje gaye hon
    if (body.services) payload.services = body.services;
    if (body.parts_used) payload.parts_used = body.parts_used;
    if (body.labour_hours) payload.labour_hours = body.labour_hours;
    if (body.labour_rate) payload.labour_rate = body.labour_rate;
    if (body.total_price) payload.total_price = body.total_price;
    if (body.taxi_required !== undefined) payload.taxi_required = body.taxi_required;
    if (body.taxi_cost) payload.taxi_cost = body.taxi_cost;
    if (body.vehicle_make) payload.vehicle_make = body.vehicle_make;

    const { data, error } = await supabaseAdmin.from("bookings").insert(payload).select().single();
    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("POST crash:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}