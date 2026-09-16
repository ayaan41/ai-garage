import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url ||!key) throw new Error("Missing env");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let supabase;
  try { supabase = getSupabase(); } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.log("BOOKING REQUEST:", body);

    const {
      garage_id, booking_date, time_slot, car_reg,
      service_type, service_types, customer_name, phone, status
    } = body;

    if (!booking_date ||!car_reg) {
      return NextResponse.json({ error: "Missing date or car_reg" }, { status: 400 });
    }

    const ref = `AG-${Math.random().toString(36).substring(2,6).toUpperCase()}${Date.now().toString().slice(-4)}`;

    // FIX: Car reg ko ek hi standard format me save karo - UPPER + TRIM
    const cleanCarReg = car_reg.toString().toUpperCase().replace(/\s+/g, "").trim();
    const formattedCarReg = cleanCarReg.replace(/(.{4})(.*)/, (m: any, p1: string, p2: string) => p1 + (p2? " " + p2 : "")).trim() || cleanCarReg;

    console.log("Original Car Reg:", car_reg, "-> Clean:", cleanCarReg, "-> Formatted:", formattedCarReg, "-> Final Used:", car_reg.toString().toUpperCase().trim());

    const base: any = {
      booking_date: booking_date,
      time_slot: time_slot,
      time: time_slot,
      slot: time_slot,
      car_reg: car_reg.toString().toUpperCase().trim(),
      vehicle_reg: car_reg.toString().toUpperCase().trim(),
      car_registration: car_reg.toString().toUpperCase().trim(),
      registration: car_reg.toString().toUpperCase().trim(),
      service_type: service_type || "Oil Change",
      customer_name: customer_name || "Guest",
      phone: phone || "0000000000",
      status: status || "pending_quote",
    };

    // Sab columns ek saath try
    let payload: any = {
    ...base,
      ref: ref,
      booking_ref: ref,
      total_price: 0,
    };

    if (garage_id && garage_id.length >= 32) payload.garage_id = garage_id;

    console.log("Trying full payload keys:", Object.keys(payload));

    let { data, error } = await supabase.from("bookings").insert([payload]).select().single();

    if (error) {
      console.log("Full failed:", error.message);
      // Retry without garage_id
      delete payload.garage_id;
      const r2 = await supabase.from("bookings").insert([payload]).select().single();
      data = r2.data; error = r2.error;
      console.log("Retry without garage_id:", error? error.message : "OK");
    }

    if (error && error.message.toLowerCase().includes("vehicle_reg")) {
      delete payload.vehicle_reg;
      delete payload.car_registration;
      delete payload.registration;
      const r3 = await supabase.from("bookings").insert([payload]).select().single();
      data = r3.data; error = r3.error;
    }

    if (error && error.message.toLowerCase().includes("ref")) {
      // Minimal fallback - sirf car_reg wala
      const minimal = {
        booking_date: base.booking_date,
        time_slot: base.time_slot,
        car_reg: base.car_reg,
        vehicle_reg: base.car_reg,
        service_type: base.service_type,
        customer_name: base.customer_name,
        phone: base.phone,
        status: base.status,
        ref: ref,
        booking_ref: ref,
      };
      const r4 = await supabase.from("bookings").insert([minimal]).select().single();
      data = r4.data; error = r4.error;
    }

    if (error) {
      console.error("FINAL FAIL:", error);
      return NextResponse.json({ error: error.message, attempted_ref: ref, attempted_car_reg: base.car_reg }, { status: 500 });
    }

    console.log("SAVED SUCCESS - Car Reg:", data.car_reg, "Ref:", data.ref || data.booking_ref);
    const finalRef = data.ref || data.booking_ref || data.id || ref;

    return NextResponse.json({
      ref: finalRef,
      id: finalRef,
      booking_ref: finalRef,
      car_reg: data.car_reg,
      success: true,
      booking: data,
    });

  } catch (err: any) {
    console.error("CRASH:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}