import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone, garageName, bookingId, booking_ref, newStatus } = await req.json();

    // tumhara system booking_ref use karta hai, is liye wahi lenge
    const ref = booking_ref || bookingId || 'demo123';
    const trackingLink = `https://ai-garage-tan.vercel.app/track/${ref}`;

    let message_body = `Your booking at ${garageName || 'AIGarage'} is confirmed. Track here: ${trackingLink}`;
    if(newStatus) message_body = `Update for ${ref}: Status is now ${newStatus}. Track: ${trackingLink} - ${garageName}`;

    // Webex try karo agar token sahi hai to
    const webexToken = process.env.WEBEX_INTERACT_TOKEN?.trim();
    const senderId = (process.env.WEBEX_SENDER_ID || 'AIGarage').trim();

    if(webexToken &&!webexToken.startsWith('sk_live') && webexToken.length > 20) {
      try {
        const res = await fetch('https://api.webexinteract.com/v1/sms/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'key': webexToken, 'Authorization': webexToken },
          body: JSON.stringify({ from: senderId, message_body, to: [{ phone: [phone] }] }),
        });
        const text = await res.text();
        let data: any; try{ data = JSON.parse(text);}catch{ data={raw:text} }
        if(res.ok) return NextResponse.json({...data, tracking: trackingLink, real_sms: true});
      } catch(e){ console.log('Webex failed', e); }
    }

    // Fallback - jab tak Webex down hai ya token galat hai
    console.log('MOCK SMS:', { phone, message_body, ref });
    return NextResponse.json({
      status: "queued_mock",
      message: "Webex dashboard down hai, is liye SMS mock pe hai. Booking saved hai!",
      phone,
      tracking: trackingLink,
      booking_ref: ref,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}