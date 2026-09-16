import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2024-06-20" 
});

// FIX: Service role use karo - anon nahi!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingRef = session.metadata?.booking_ref;
    
    console.log("Webhook - Paid booking:", bookingRef);

    if (bookingRef) {
      const { error } = await supabaseAdmin.from("bookings").update({
        status: "paid",
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email || session.customer_email || "",
      }).eq("booking_ref", bookingRef);

      if (error) {
        console.error("DB Update failed:", error);
      } else {
        console.log("Booking updated to PAID:", bookingRef);
      }
    }
  }
  
  return NextResponse.json({ received: true });
}