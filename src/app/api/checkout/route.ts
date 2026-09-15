import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
export async function POST(req: NextRequest) {
  const { amount, booking_ref, garage_name } = await req.json();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "gbp", product_data: { name: `${garage_name} - Service ${booking_ref}` }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ai-garage-tan.vercel.app"}/track/${booking_ref}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ai-garage-tan.vercel.app"}/track/${booking_ref}?payment=cancelled`,
    metadata: { booking_ref, garage_name }
  });
  return NextResponse.json({ url: session.url });
}
