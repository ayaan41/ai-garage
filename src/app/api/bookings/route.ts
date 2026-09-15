import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// GET - Admin ke liye saari bookings
export async function GET() {
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(data || []);
}

// POST - Tumhara purana booking + SMS wala code (Safe)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { garage, service_type, car_reg, booking_date, booking_time, description, preferred_language, customer_phone, booking } = body;

    // Booking Ref banao agar nahi hai
    const booking_ref = booking?.booking_ref || "GLA-" + Date.now().toString().slice(-6) + "-" + Math.random().toString(36).substring(2,5).toUpperCase();

    // Supabase mein save karo
    await supabase.from("bookings").insert({
      booking_ref: booking_ref,
      garage_id: garage?.id || body.garageId,
      garage_name: garage?.name || body.garageName || "Glasgow Garage",
      service: service_type || body.service || "Full Diagnostics",
      amount: 50,
      status: "paid",
    });

    const smsData = {
      ref: booking_ref,
      garage: garage?.name || 'Garage',
      address: garage?.address || '',
      service: service_type,
      car: car_reg?.toUpperCase() || '',
      date: booking_date,
      time: booking_time,
      note: description || '',
    };

    // Yahan tumhara getMessage function hoga
    const smsText = `Booking Confirmed! Ref: ${booking_ref}, Garage: ${smsData.garage}, Service: ${smsData.service}, Car: ${smsData.car}`;

    console.log('=== BOOKING CONFIRMED ===');
    console.log('Ref:', booking_ref);
    console.log('Garage:', garage?.name);
    console.log('SMS to', customer_phone, ':', smsText);
    console.log('==========================');

    return NextResponse.json({
      success: true,
      booking_ref: booking_ref,
      message: smsText,
      garage: garage?.name
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}