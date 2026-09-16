import { NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// This webhook handles incoming calls forwarded from garage's old number
// Garage number -> *21* -> Twilio Number -> This Webhook -> AI Voice (Retell/Vapi) -> Booking

export async function POST(req: Request) {
  try {
    // FIX: Client andar banao - build crash khatam
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase keys missing');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>System config error. Please book online.</Say><Hangup/></Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    const formData = await req.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string

    console.log('Incoming call:', { callSid, from, to, callStatus })

    const { data: garage } = await supabase
      .from('garages')
      .select('*')
      .eq('ai_voice_enabled', true)
      .limit(1)
      .single()

    const { data: callLog } = await supabase
      .from('call_logs')
      .insert({
        garage_id: garage?.id,
        customer_phone: from,
        customer_language: 'en',
        status: 'handled_by_ai',
        transcript: `Call started - SID: ${callSid}`
      })
      .select()
      .single()

    const retellAgentId = process.env.RETELL_AGENT_ID

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-GB">Hello, you have reached ${garage?.name || 'AI Garage'}. Our AI assistant will help you in your language. Please wait.</Say>
  <Connect>
    <Stream url="wss://api.retellai.com/audio-websocket/${retellAgentId}" />
  </Connect>
  <Say>Sorry, our AI assistant is busy. Please book online at ai-garage dot co dot uk. You will receive SMS confirmation in your language.</Say>
  <Hangup/>
</Response>`

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error: any) {
    console.error('Call webhook error:', error)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, system error. Please book online.</Say>
  <Hangup/>
</Response>`
    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}

export async function PUT(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase keys missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    const body = await req.json()
    const { call_id, customer_phone, detected_language, transcript, booking_data, intent } = body

    await supabase
      .from('call_logs')
      .update({
        detected_language: detected_language,
        transcript: transcript,
        intent: intent,
        customer_language: detected_language
      })
      .eq('id', call_id)

    if (booking_data) {
      const { data: garage } = await supabase
        .from('garages')
        .select('*')
        .limit(1)
        .single()

      const { data: booking } = await supabase
        .from('bookings')
        .insert({
          garage_id: garage?.id,
          customer_name: booking_data.customer_name || 'Call Customer',
          customer_phone: customer_phone,
          car_reg: booking_data.car_reg,
          service_type: booking_data.service_type || 'General',
          description: transcript,
          preferred_language: detected_language,
          booking_date: booking_data.date,
          booking_time: booking_data.time,
          source: 'ai_call',
          status: 'confirmed',
          ai_transcript: transcript
        })
        .select()
        .single()

      return NextResponse.json({ success: true, booking })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}