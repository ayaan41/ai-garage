import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const garageId = body.garageId || "unknown";
    const garageName = body.garageName || "Glasgow Garage";
    const serviceName = body.service || "Full Diagnostics";
    const amount = body.amount || 50; // pounds

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${garageName} - ${serviceName}`,
              description: `Booking ID: ${garageId}`,
            },
            unit_amount: amount * 100, // £50 = 5000 pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://ai-garage-9ww6alb9p-ayaan41s-projects.vercel.app"}/success?garage=${garageId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://ai-garage-9ww6alb9p-ayaan41s-projects.vercel.app"}/book/${garageId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}