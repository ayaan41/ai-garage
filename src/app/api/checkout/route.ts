import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { garageId, garageName, service, customerName, customerEmail, customerPhone, carReg, amount } = body;

    // Booking Ref Generate
    const bookingRef = `GLA-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    // Get Dynamic Origin - YEH FIX HAI!
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    
    // Clean origin - agar localhost nahi hai toh production use karo
    const finalOrigin = origin.includes("localhost") 
      ? origin 
      : origin;

    console.log("Origin for redirect:", finalOrigin);
    console.log("Booking Ref:", bookingRef);

    // Save booking as pending in DB (optional - agar table hai)
    try {
      await supabase.from("bookings").insert({
        booking_ref: bookingRef,
        garage_id: garageId,
        garage_name: garageName,
        service: service,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        car_reg: carReg,
        amount: amount,
        status: "pending_payment",
      });
    } catch (e) {
      console.log("Booking insert skipped:", e);
    }

    // Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${service} - ${garageName}`,
              description: `Booking Ref: ${bookingRef} | Car: ${carReg}`,
            },
            unit_amount: Math.round((amount || 50) * 100), // £50 default
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // YEH LINE SAB FIX KAREGI - Dynamic Origin!
      success_url: `${finalOrigin}/success?booking_ref=${bookingRef}&garage=${garageId}`,
      cancel_url: `${finalOrigin}/cancel?booking_ref=${bookingRef}`,
      customer_email: customerEmail,
      metadata: {
        booking_ref: bookingRef,
        garage_id: garageId,
      },
    });

    return NextResponse.json({ url: session.url, bookingRef });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}