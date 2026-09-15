// TEMP - Webex down hai is liye mock
export async function POST(req: Request) {
  const body = await req.json();
  console.log("BOOKING SMS (MOCK - Webex down):", body);
  
  // Tracking link generate karo
  return Response.json({ 
    status: "queued_mock",
    message: "Webex dashboard down hai, is liye SMS mock pe hai. Booking saved hai!",
    phone: body.phone,
    tracking: `https://ai-garage-tan.vercel.app/track/${body.bookingId}`
  });
}