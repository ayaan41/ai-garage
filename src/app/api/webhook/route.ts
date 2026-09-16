import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Important: Node runtime chahiye, Edge nahi
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil" as any,
});

// Supabase Admin Client - Service Role se (RLS bypass)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe-signature header");
    return new Response("No signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET missing in Vercel");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Signature verify
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`✅ Received event: ${event.type}`);

  try {
    // Sirf paid event handle karo
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const bookingRef = session.metadata?.booking_ref;
      const garageId = session.metadata?.garage_id;
      const paymentIntentId = session.payment_intent as string;

      console.log(`💰 Payment success for booking: ${bookingRef}`, {
        garageId,
        paymentIntentId,
        amount: session.amount_total,
      });

      if (!bookingRef) {
        console.error("❌ No booking_ref in metadata");
        return new Response("No booking_ref", { status: 200 });
      }

      // Supabase mein status paid karo
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .update({
          status: "paid",
          stripe_payment_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq("booking_ref", bookingRef)
        .select();

      if (error) {
        console.error("❌ Supabase update failed:", error);
        return new Response(`DB Error: ${error.message}`, { status: 500 });
      }

      console.log(`✅ Booking ${bookingRef} marked as PAID:`, data);
    }

    // Stripe ko 200 OK dena zaroori hai
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("❌ Webhook handler error:", err);
    return new Response(`Handler Error: ${err.message}`, { status: 500 });
  }
}

// GET method for testing (browser mein khologe to pata chalega webhook zinda hai)
export async function GET() {
  return new Response("AI Garage Webhook is Active ✅ - Use POST for Stripe", {
    status: 200,
  });
}