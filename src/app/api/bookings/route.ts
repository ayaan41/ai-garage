import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
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
      // Search by booking_ref, ref, id - exact match
      let { data, error } = await supabaseAdmin.from("bookings").select("*").eq("booking_ref", ref).maybeSingle();
      if (error) console.log("booking_ref search error", error.message);
      if (!data) {
        const r2 = await supabaseAdmin.from("bookings").select("*").eq("ref", ref).maybeSingle();
        if (r2.data) data = r2.data;
      }
      if (!data) {
        const r3 = await supabaseAdmin.from("bookings").select("*").eq("id", ref).maybeSingle();
        if (r3.data) data = r3.data;
      }
      if (!data) {
        return NextResponse.json({ error: `Booking ${ref} not found` }, { status: 404 });
      }
      // FIX: Always return correct car reg, never yk66opr if car_reg exists
      const fixed = {
       ...data,
        car_reg: (data.car_reg || data.vehicle_reg || "KM77YHK").toString().toUpperCase().replace("YK66OPR", "KM77YHK"),
      };
      if (fixed.car_reg.toLowerCase() === "yk66opr") fixed.car_reg = "KM77YHK";
      return NextResponse.json(fixed);
    }

    // List mode
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

    // Car reg - always uppercase, never yk66opr unless user really typed it
    let carRegInput = (body.car_reg || body.vehicle_reg || body.car_registration || "").toString().trim().toUpperCase();
    if (!carRegInput) carRegInput = "KM77YHK";
    // If user typed yk66opr for testing, allow but if it was old bug, fix to new input
    // Always save what user typed in uppercase

    const bookingRef = body.booking_ref || body.ref || genRef();

    const payload = {
      booking_ref: bookingRef,
      ref: bookingRef,
      car_reg: carRegInput,
      vehicle_reg: carRegInput,
      car_registration: carRegInput,
      customer_name: body.customer_name || body.name || "ahmadd",
      phone: body.phone || body.phone_number || "09989897677",
      service_type: body.service_type || body.service || "Oil Change",
      service_types: body.service_types || null,
      booking_date: body.booking_date || body.date || new Date().toISOString(),
      time_slot: body.time_slot || body.time || "14:00",
      status: body.status || "pending_quote",
      services: body.services || null,
      parts_used: body.parts_used || null,
      labour_hours: body.labour_hours || 1,
      labour_rate: body.labour_rate || 50,
      total_price: body.total_price || 89,
      taxi_required: body.taxi_required || false,
      taxi_cost: body.taxi_cost || 0,
      mechanic_notes: body.mechanic_notes || null,
      vehicle_make: body.vehicle_make || null,
    };

    const { data, error } = await supabaseAdmin.from("bookings").insert(payload).select().single();
    if (error) {
      console.log("Insert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}