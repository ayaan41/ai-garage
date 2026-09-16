import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper to create supabase client - inside function to avoid build errors
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url ||!key) {
    throw new Error("Missing Supabase env vars");
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (e: any) {
    return NextResponse.json({ error: "Server config error: " + e.message }, { status: 500 });
  }

  try {
    const body = await req.json();
    console.log("==================== BOOKING REQUEST START ====================");
    console.log("Body received:", JSON.stringify(body, null, 2));

    const {
      garage_id,
      booking_date,
      time_slot,
      car_reg,
      service_type,
      service_types,
      customer_name,
      phone,
      status,
      total_price,
    } = body;

    // Validation
    if (!booking_date) {
      return NextResponse.json({ error: "Missing booking_date" }, { status: 400 });
    }
    if (!car_reg) {
      return NextResponse.json({ error: "Missing car_reg" }, { status: 400 });
    }
    if (!time_slot) {
      return NextResponse.json({ error: "Missing time_slot" }, { status: 400 });
    }

    // Generate unique ref - always unique
    const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomPart2 = Math.random().toString(36).substring(2, 4).toUpperCase();
    const timePart = Date.now().toString().slice(-3);
    const ref = `AG-${randomPart1}${randomPart2}${timePart}`;

    console.log("Generated REF:", ref);

    // Base payload - jo har table me hona chahiye
    const basePayload: any = {
      booking_date: booking_date,
      time_slot: time_slot,
      car_reg: car_reg.toString().toUpperCase().trim(),
      service_type: service_type || (Array.isArray(service_types)? service_types.join(", ") : "General Service"),
      customer_name: customer_name? customer_name.toString().trim() : "Guest User",
      phone: phone? phone.toString().trim() : "0000000000",
      status: status || "pending_quote",
    };

    console.log("Base payload:", basePayload);

    // Attempt 1: Full payload with all possible column names
    let attempt1: any = {
     ...basePayload,
      ref: ref,
      booking_ref: ref,
      vehicle_reg: basePayload.car_reg,
      total_price: total_price || 0,
      service_types: service_types || [service_type],
    };

    // Add garage_id only if looks like UUID (36 chars with dashes)
    if (garage_id && typeof garage_id === "string" && garage_id.length >= 32) {
      attempt1.garage_id = garage_id;
    }

    console.log("Attempt 1 - Full payload with", Object.keys(attempt1).length, "fields");

    let { data, error } = await supabase.from("bookings").insert().select().single();

    // Attempt 2: Without garage_id (most common foreign key fail)
    if (error) {
      console.log("Attempt 1 failed:", error.message, "Code:", error.code);
      if (error.message.toLowerCase().includes("garage_id") || error.message.toLowerCase().includes("foreign key") || error.message.toLowerCase().includes("violates")) {
        console.log("Retrying Attempt 2 - Without garage_id");
        const attempt2 = {...attempt1 };
        delete attempt2.garage_id;
        const res2 = await supabase.from("bookings").insert().select().single();
        data = res2.data;
        error = res2.error;
        console.log("Attempt 2 result:", error? error.message : "SUCCESS");
      }
    }

    // Attempt 3: Without vehicle_reg
    if (error && error.message.toLowerCase().includes("vehicle_reg")) {
      console.log("Retrying Attempt 3 - Without vehicle_reg");
      delete attempt1.vehicle_reg;
      const attempt3 = {...attempt1 };
      delete attempt3.garage_id;
      const res3 = await supabase.from("bookings").insert().select().single();
      data = res3.data;
      error = res3.error;
    }

    // Attempt 4: Without ref and booking_ref both
    if (error && (error.message.toLowerCase().includes("ref") || error.message.toLowerCase().includes("booking_ref"))) {
      console.log("Retrying Attempt 4 - Without ref columns, handling individually");
      // Try without booking_ref first
      if (error.message.includes("booking_ref")) {
        delete attempt1.booking_ref;
        const res = await supabase.from("bookings").insert().select().single();
        data = res.data;
        error = res.error;
      }
      // Then without ref
      if (error && error.message.includes("ref") &&!error.message.includes("booking_ref")) {
        delete attempt1.ref;
        attempt1.booking_ref = ref; // keep one
        const res = await supabase.from("bookings").insert().select().single();
        data = res.data;
        error = res.error;
      }
    }

    // Attempt 5: Minimal - only 7 core columns
    if (error) {
      console.log("Attempt 5 - MINIMAL payload only");
      const minimal: any = {...basePayload };
      const res5 = await supabase.from("bookings").insert([minimal]).select().single();
      data = res5.data;
      error = res5.error;
      console.log("Attempt 5 result:", error? error.message : "SUCCESS - ID: " + data?.id);
    }

    // Attempt 6: Even more minimal - 5 columns only
    if (error) {
      console.log("Attempt 6 - ULTRA MINIMAL");
      const ultraMinimal = {
        booking_date: basePayload.booking_date,
        time_slot: basePayload.time_slot,
        car_reg: basePayload.car_reg,
        service_type: basePayload.service_type,
        status: basePayload.status,
      };
      const res6 = await supabase.from("bookings").insert([ultraMinimal]).select().single();
      data = res6.data;
      error = res6.error;
    }

    if (error) {
      console.error("==================== FINAL FAILURE ====================");
      console.error("All attempts failed. Last error:", error);
      return NextResponse.json(
        {
          error: error.message,
          details: error,
          hint: "Check Supabase table columns - add missing columns via SQL",
          ref_attempted: ref,
        },
        { status: 500 }
      );
    }

    console.log("==================== BOOKING SAVED SUCCESS ====================");
    console.log("Saved data:", data);

    const finalRef = data.ref || data.booking_ref || data.id || ref;

    return NextResponse.json({
      ref: finalRef,
      id: finalRef,
      booking_id: finalRef,
      booking_ref: finalRef,
      booking: data,
      success: true,
      message: "Booking saved successfully",
    });

  } catch (err: any) {
    console.error("==================== API CRASH ====================", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const { data, error } = await supabase
     .from("bookings")
     .select("*")
     .order("created_at", { ascending: false })
     .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}