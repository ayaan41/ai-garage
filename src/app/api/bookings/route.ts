import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const body = await req.json();
    const genRef = `AG-${Math.random().toString(36).substring(2,5).toUpperCase()}${Date.now().toString().slice(-4)}`;

    // Sirf wahi columns jo har table me hote hain
    const base = {
      booking_date: body.booking_date,
      time_slot: body.time_slot,
      car_reg: body.car_reg?.toUpperCase(),
      service_type: body.service_type,
      customer_name: body.customer_name || "Guest",
      phone: body.phone || "0000000000",
      status: "pending_quote",
    };

    // 4 attempts - pehle ref ke saath, phir bina ref ke
    const attempts = [
      {...base, ref: genRef, booking_ref: genRef },
      {...base, booking_ref: genRef },
      {...base, ref: genRef },
      base,
    ];

    for (let attempt of attempts) {
      const { data, error } = await supabase.from("bookings").insert([attempt]).select().single();
      if (!error && data) {
        const finalRef = data.ref || data.booking_ref || data.id || genRef;
        console.log("BOOKING SAVED:", finalRef);
        return NextResponse.json({ ref: finalRef, id: finalRef, success: true, booking: data });
      }
      console.log("Insert failed:", error?.message);
      // agar column error nahi hai toh yahin rok do
      if (error &&!error.message.toLowerCase().includes("column") &&!error.message.toLowerCase().includes("schema")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Could not save - check table columns" }, { status: 500 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(20);
  return NextResponse.json(data || []);
}