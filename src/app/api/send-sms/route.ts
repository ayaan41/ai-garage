import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone, garageName, bookingId } = await req.json();

    const senderId = process.env.WEBEX_SENDER_ID || 'AIGarage';
    const token = process.env.WEBEX_INTERACT_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'WEBEX_INTERACT_TOKEN missing in env' }, { status: 500 });
    }

    const trackingLink = `https://ai-garage.vercel.app/track/${bookingId || 'demo123'}`;
    const message_body = `Your booking at ${garageName || 'AIGarage'} is confirmed. Track here: ${trackingLink}`;

    const payload = {
      from: senderId,
      message_body,
      to: [
        {
          phone: [phone],
        }
      ]
    };

    const res = await fetch('https://api.webexinteract.com/v1/sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
