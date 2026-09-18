import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_id, reg, phone, tab, garage_name } = body;

    // Log notification
    console.log(`[AI GARAGE NOTIFY] ${reg} • ${booking_id} • ${tab} • ${garage_name} • ${phone}`);

    // Mock WhatsApp send - In production integrate Twilio / WhatsApp Business API
    const message = 
      tab === "Ready" 
        ? `AI GARAGE: ${reg} Ready for Collection at ${garage_name}. Booking ${booking_id}. Invoice: /invoice/${booking_id} • Track: /track/${booking_id} • Pay direct at garage.`
        : tab === "Collected"
        ? `AI GARAGE: ${reg} Collected • ${booking_id} • Payment confirmed • Invoice /invoice/${booking_id} • Feedback ★★★★★ • Thank you!`
        : `AI GARAGE: ${reg} • ${booking_id} • Status ${tab} • ${garage_name} • Track /track/${booking_id}`;

    // Update booking notify_status in Supabase
    try {
      await supabase.from("bookings").update({ 
        notify_status: `WhatsApp sent ${tab} ${new Date().toISOString()}`,
      }).eq("id", booking_id);
    } catch(e) {
      console.log("Supabase notify update skipped", e);
    }

    // In production, call Twilio/WhatsApp API here
    // await fetch(`https://api.twilio.com/...`, { method: "POST", body: JSON.stringify({ To: phone, Body: message }) })

    return NextResponse.json({ 
      success: true, 
      message: "Notification sent",
      details: message,
      booking_id,
      reg,
      tab,
      whatsapp_mock: `Would send to ${phone}: ${message}`,
      invoice_url: `/invoice/${booking_id}`,
      track_url: `/track/${booking_id}`
    });
  } catch (error) {
    console.error("Notify error", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
