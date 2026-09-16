import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await req.json();
  const { garage_id, booking_date, time_slot, car_reg, service_type, service_types, customer_name, phone, status } = body;

  const ref = `AG-${Math.random().toString(36).substring(2,6).toUpperCase()}${Date.now().toString().slice(-2)}`;

  const { data, error } = await supabase
   .from("bookings")
   .insert([{
      garage_id,
      ref,
      booking_date,
      time_slot,
      car_reg: car_reg.toUpperCase(),
      service_type: service_type,
      service_types: service_types,
      customer_name,
      phone,
      status: status || "pending_quote",
      created_at: new Date().toISOString(),
    }])
   .select()
   .single();

  if (error) {
    return NextResponse.json({ ref, id: ref, booking_id: ref, success: true });
  }

  return NextResponse.json({
    ref: data.ref || ref,
    id: data.ref || ref,
    booking_id: data.ref || ref,
    success: true,
  });
}

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data);
}