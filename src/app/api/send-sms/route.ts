export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("MOCK SMS - Webex down, booking saved:", body);
    
    return Response.json({ 
      status: "queued_mock",
      message: "SMS Mock - Booking saved! Webex dashboard is down.",
      phone: body.phone,
      garageName: body.garageName,
      tracking: `https://ai-garage-tan.vercel.app/track/${body.bookingId || 'demo'}`,
      note: "Real SMS will work when Webex token is fixed"
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}