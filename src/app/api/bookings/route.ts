import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url ||!key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (e: any) {
    return NextResponse.json({ error: "Config error: " + e.message }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.log("========== BOOKING REQUEST ==========", body);

    const { booking_date, time_slot, car_reg, service_type, customer_name, phone } = body;

    if (!booking_date ||!car_reg ||!time_slot) {
      return NextResponse.json({ error: "Missing booking_date or car_reg or time_slot" }, { status: 400 });
    }

    const ref = `AG-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;
    const cleanReg = car_reg.toString().toUpperCase().trim();

    console.log("Clean Reg:", cleanReg, "Ref:", ref);

    // CORE - ONLY columns that exist in your table
    const corePayload: any = {
      booking_date: booking_date,
      time_slot: time_slot,
      car_reg: cleanReg,
      service_type: service_type || "Oil Change",
      customer_name: customer_name || "ahmadd",
      phone: phone || "09989897677",
      status: "pending_quote",
    };

    // Attempt 1: with ref + booking_ref
    let payload1: any = {...corePayload, ref: ref, booking_ref: ref };
    console.log("Attempt 1 keys:", Object.keys(payload1));

    let { data, error } = await supabase.from("bookings").insert().select().single();

    if (error) {
      console.log("Attempt 1 FAILED:", error.message);

      // If ref columns don't exist, try only core
      if (error.message.toLowerCase().includes("ref") || error.message.toLowerCase().includes("car_registration") || error.message.toLowerCase().includes("vehicle_reg")) {
        console.log("Attempt 2: core only without extra cols");
        const payload2: any = {...corePayload, booking_ref: ref };
        const r2 = await supabase.from("bookings").insert().select().single();
        data = r2.data;
        error = r2.error;
        console.log("Attempt 2 result:", error? error.message : "SUCCESS");

        if (error) {
          console.log("Attempt 3: absolute core only");
          const r3 = await supabase.from("bookings").insert([corePayload]).select().single();
          data = r3.data;
          error = r3.error;
          console.log("Attempt 3 result:", error? error.message : "SUCCESS ID " + data?.id);
        }
      }

      if (error && error.message.toLowerCase().includes("time_slot")) {
        console.log("time_slot column missing, trying time");
        const payloadTime: any = {
          booking_date: corePayload.booking_date,
          time: time_slot,
          car_reg: cleanReg,
          service_type: corePayload.service_type,
          customer_name: corePayload.customer_name,
          phone: corePayload.phone,
          status: corePayload.status,
          booking_ref: ref,
        };
        const rTime = await supabase.from("bookings").insert([payloadTime]).select().single();
        data = rTime.data;
        error = rTime.error;
      }
    }

    if (error) {
      console.error("FINAL FAIL:", error);
      return NextResponse.json({
        error: error.message,
        hint: "Go to Supabase SQL Editor and run: ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_ref TEXT; ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ref TEXT; ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_slot TEXT;",
        attempted_ref: ref,
        attempted_car: cleanReg,
      }, { status: 500 });
    }

    console.log("SAVED:", data);
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

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}