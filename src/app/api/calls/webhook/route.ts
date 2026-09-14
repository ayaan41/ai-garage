import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This webhook handles incoming calls forwarded from garage's old number
// Garage number -> *21* -> Twilio Number -> This Webhook -> AI Voice (Retell/Vapi) -> Booking

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string // Customer phone
    const to = formData.get('To') as string // Twilio number (garage's forwarded number)
    const callStatus = formData.get('CallStatus') as string

    console.log('Incoming call:', { callSid, from, to, callStatus })

    // 1. Find which garage this Twilio number belongs to
    // You need a mapping table: twilio_numbers -> garage_id
    // For now, use first garage as example
    const { data: garage } = await supabase
      .from('garages')
      .select('*')
      .eq('ai_voice_enabled', true)
      .limit(1)
      .single()

    // 2. Log call
    const { data: callLog } = await supabase
      .from('call_logs')
      .insert({
        garage_id: garage?.id,
        customer_phone: from,
        customer_language: 'en', // Will be detected by AI
        status: 'handled_by_ai',
        transcript: `Call started - SID: ${callSid}`
      })
      .select()
      .single()

    // 3. TwiML Response - Connect to AI Voice Agent (Retell AI / Vapi)
    // Option A: Using Retell AI
    const retellAgentId = process.env.RETELL_AGENT_ID
    
    // Option B: Using Vapi
    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID

    // For now, simple TwiML that says AI will handle and connects to Retell
    // Replace with your AI provider's TwiML

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-GB">Hello, you have reached ${garage?.name || 'AI Garage'}. Our AI assistant will help you in your language. Please wait.</Say>
  <Connect>
    <Stream url="wss://api.retellai.com/audio-websocket/${retellAgentId}" />
  </Connect>
  <!-- Fallback if Retell fails -->
  <Say>Sorry, our AI assistant is busy. Please book online at ai-garage dot co dot uk. You will receive SMS confirmation in your language.</Say>
  <Hangup/>
</Response>`

    // For Vapi alternative:
    // const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    // <Response>
    //   <Connect>
    //     <Stream url="wss://api.vapi.ai/twilio/${vapiAssistantId}" />
    //   </Connect>
    // </Response>`

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

// For handling AI call completion - when AI finishes booking
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { call_id, customer_phone, detected_language, transcript, booking_data, intent } = body

    // 1. Update call log with language and transcript
    await supabase
      .from('call_logs')
      .update({
        detected_language: detected_language,
        transcript: transcript,
        intent: intent,
        customer_language: detected_language
      })
      .eq('id', call_id)

    // 2. If AI created a booking, link it
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

      // 3. Send SMS/WhatsApp in detected language + English
      // Call the bookings API internally or send directly via Twilio
      // (Same template logic as bookings route)

      return NextResponse.json({ success: true, booking })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
