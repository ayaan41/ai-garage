import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const garageId = body.garageId || "unknown";
    const garageName = body.garageName || "Glasgow Garage";
    const serviceName = body.service || "Full Diagnostics - £50";
    const bookingRef = "GLA-" + Date.now().toString().slice(-6) + "-" + Math.random().toString(36).substring(2,5).toUpperCase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ai-garage-bduwfa7oj-mubeena754-2079s-projects.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: garageName + " - " + serviceName,
              description: "Booking Ref: " + bookingRef,
            },
            unit_amount: 5000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        booking_ref: bookingRef,
        garage_id: garageId,
        garage_name: garageName,
      },
      success_url: baseUrl + "/success?booking_ref=" + bookingRef + "&garage=" + garageId,
      cancel_url: baseUrl + "/book/" + garageId,
    });

    // Instant save to Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await supabase.from("bookings").insert({
      booking_ref: bookingRef,
      garage_id: garageId,
      garage_name: garageName,
      service: serviceName,
      amount: 50,
      status: "pending_payment",
    });

    return NextResponse.json({ url: session.url, bookingRef: bookingRef });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}