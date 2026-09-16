import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    console.log("Booking request:", body);

    const { garage_id, booking_date, time_slot, car_reg, service_type, service_types, customer_name, phone, status } = body;

    if (!booking_date ||!car_reg) {
      return NextResponse.json({ error: "Missing booking_date or car_reg" }, { status: 400 });
    }

    // Generate ref
    const ref = `AG-${Math.random().toString(36).substring(2,6).toUpperCase()}${Math.random().toString(36).substring(2,4).toUpperCase()}${Date.now().toString().slice(-2)}`;

    // Pehle minimal data se try karenge - jo 100% kaam karega
    // Tumhari table mein alag alag column names ho sakte hain is liye hum 2-3 try karenge
    let insertData: any = {
      ref: ref,
      booking_ref: ref, // dono naam se save taki track dono se mile
      booking_date: booking_date,
      time_slot: time_slot,
      car_reg: car_reg.toUpperCase(),
      vehicle_reg: car_reg.toUpperCase(), // dono naam
      service_type: service_type,
      customer_name: customer_name || "Test User",
      phone: phone || "0000000000",
      status: status || "pending_quote",
      total_price: 0,
    };

    // garage_id agar valid UUID hai to hi add karo
    if (garage_id && garage_id.length > 30) {
      insertData.garage_id = garage_id;
    }

    console.log("Trying insert:", insertData);

    let { data, error } = await supabase.from("bookings").insert([insertData]).select().single();

    // Agar garage_id ki wajah se fail hua to bina garage_id ke try karo
    if (error && error.message.includes("garage_id")) {
      console.log("Retrying without garage_id, error:", error.message);
      delete insertData.garage_id;
      const retry = await supabase.from("bookings").insert([insertData]).select().single();
      data = retry.data;
      error = retry.error;
    }

    // Agar booking_ref column nahi hai to usko hata ke try karo
    if (error && error.message.includes("booking_ref")) {
      console.log("Retrying without booking_ref");
      delete insertData.booking_ref;
      const retry = await supabase.from("bookings").insert([insertData]).select().single();
      data = retry.data;
      error = retry.error;
    }

    // Agar vehicle_reg column nahi hai
    if (error && error.message.includes("vehicle_reg")) {
      console.log("Retrying without vehicle_reg");
      delete insertData.vehicle_reg;
      const retry = await supabase.from("bookings").insert([insertData]).select().single();
      data = retry.data;
      error = retry.error;
    }

    // Agar ref column nahi hai
    if (error && error.message.includes("ref")) {
      console.log("Retrying without ref, using booking_ref only");
      delete insertData.ref;
      insertData.booking_ref = ref;
      const retry = await supabase.from("bookings").insert([insertData]).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("FINAL Supabase error - Booking NOT saved:", error);
      return NextResponse.json({ error: error.message, details: error, ref_attempted: ref }, { status: 500 });
    }

    console.log("Booking SAVED successfully:", data);

    const finalRef = data.ref || data.booking_ref || ref;

    return NextResponse.json({
      ref: finalRef,
      id: finalRef,
      booking_id: finalRef,
      booking_ref: finalRef,
      booking: data,
      success: true,
    });

  } catch (err: any) {
    console.error("API crash:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(20);
  return NextResponse.json(data || []);
}