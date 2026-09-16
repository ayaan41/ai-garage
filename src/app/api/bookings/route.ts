import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await req.json();
    const { booking_date, time_slot, car_reg, service_type, customer_name, phone } = body;
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }
    const cleanReg = (car_reg || "").toString().toUpperCase().trim();
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
    console.log("INSERT:", payload);
    const { data, error } = await supabase.from("bookings").insert([payload]).select().single();
    if (error) {
      console.log("Insert failed, trying without ref:", error.message);
      delete payload.ref;
      const r2 = await supabase.from("bookings").insert([payload]).select().single();
      if (r2.error) return NextResponse.json({ error: r2.error.message }, { status: 500 });
      return NextResponse.json({ ref: r2.data.booking_ref || r2.data.id, id: r2.data.booking_ref || r2.data.id, booking: r2.data, success: true });
    }
    const finalRef = data.booking_ref || data.ref || data.id;
    return NextResponse.json({ ref: finalRef, id: finalRef, booking: data, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const refParam = searchParams.get("ref") || searchParams.get("id") || searchParams.get("booking_ref");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (refParam) {
      console.log("GET single for:", refParam);
      // Try booking_ref
      let { data } = await supabase.from("bookings").select("*").eq("booking_ref", refParam).maybeSingle();
      if (!data) {
        const r2 = await supabase.from("bookings").select("*").eq("ref", refParam).maybeSingle();
        data = r2.data;
      }
      if (!data) {
        const r3 = await supabase.from("bookings").select("*").eq("id", refParam).maybeSingle();
        data = r3.data;
      }
      if (!data) {
        // Last try: list and find contains
        const r4 = await supabase.from("bookings").select("*").ilike("booking_ref", `%${refParam}%`).limit(1).maybeSingle();
        data = r4.data;
      }
      if (data) return NextResponse.json(data);
      return NextResponse.json({ error: `Not found ${refParam}` }, { status: 404 });
    }

    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}