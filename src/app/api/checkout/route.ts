import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY missing" }, { status: 500 });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase keys missing" }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-06-20" as any,
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { garageId, garageName, service, customerName, customerEmail, customerPhone, carReg, amount } = body;

    const bookingRef = `GLA-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    const finalOrigin = process.env.NEXT_PUBLIC_URL || req.headers.get("origin") || req.nextUrl.origin;

    const { error: dbError } = await supabaseAdmin.from("bookings").insert({
      booking_ref: bookingRef,
      garage_id: garageId,
      garage_name: garageName,
      service: service,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      phone: customerPhone,
      vehicle_reg: carReg,
      car_reg: carReg,
      amount: amount || 50,
      total_price: amount || 50,
      status: "pending_payment",
    });

    if (dbError) console.error("DB Error:", dbError);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "gbp",
          product_data: {
            name: `${service} - ${garageName}`,
            description: `Ref: ${bookingRef} | Car: ${carReg}`,
          },
          unit_amount: Math.round((amount || 50) * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${finalOrigin}/track/${bookingRef}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${finalOrigin}/cancel?booking_ref=${bookingRef}`,
      customer_email: customerEmail,
      metadata: { booking_ref: bookingRef, garage_id: garageId || "" },
    });

    return NextResponse.json({ url: session.url, bookingRef });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
