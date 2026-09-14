import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const getMessage = (lang: string, data: any) => {
  const noteText = data.note ? `\nNote: ${data.note}` : ''
  const messages: any = {
    en: `AI GARAGE - Booking Confirmed! Ref: ${data.ref}\nGarage: ${data.garage}\nService: ${data.service}${noteText}\nCar: ${data.car}\nDate: ${data.date} at ${data.time}\nAddress: ${data.address}\nTrack: ai-garage.co.uk/track/${data.ref}`,
    ur: `AI GARAGE - بکنگ کنفرم! Ref: ${data.ref}\nGarage: ${data.garage}\nService: ${data.service}${noteText}\nCar: ${data.car}\nتاريخ: ${data.date} وقت: ${data.time}\n\nآپ کی بکنگ کنفرم ہو گئی! گاڑی ${data.date} کو ${data.time} پر ${data.garage} پر لائیں۔\nRef: ${data.ref}`,
    pa: `AI GARAGE - ਬੁਕਿੰਗ ਕਨਫਰਮ! Ref: ${data.ref}\nGarage: ${data.garage}\nService: ${data.service}${noteText}\nCar: ${data.car}\nDate: ${data.date} at ${data.time}\n\nਤੁਹਾਡੀ ਬੁਕਿੰਗ ਕਨਫਰਮ! ਗੱਡੀ ${data.date} ਨੂੰ ${data.time} ਵਜੇ ${data.garage} ਤੇ ਲਿਆਓ।\nRef: ${data.ref}`,
    pl: `AI GARAGE - Rezerwacja Potwierdzona! Ref: ${data.ref}\nWarsztat: ${data.garage}\nUsługa: ${data.service}${noteText}\nAuto: ${data.car}\nData: ${data.date} o ${data.time}\n\nBooking Confirmed - Drop ${data.date} at ${data.time}`,
  }
  return messages[lang] || messages['en']
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { garage_id, customer_name, customer_phone, car_reg, service_type, description, preferred_language, booking_date, booking_time } = body

    if (!garage_id || !customer_name || !customer_phone || !car_reg) {
      return NextResponse.json({ error: 'Missing fields - Name, Phone, Car Reg required' }, { status: 400 })
    }

    const { data: garage } = await supabase.from('garages').select('*').eq('id', garage_id).single()

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        garage_id,
        customer_name,
        customer_phone,
        car_reg: car_reg.toUpperCase(),
        service_type: service_type || 'MOT',
        description: description || '',
        preferred_language: preferred_language || 'en',
        booking_date,
        booking_time,
        status: 'confirmed',
        source: 'website'
      })
      .select()
      .single()

    if (error) {
      console.error('Booking error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const smsData = {
      ref: booking.booking_ref,
      garage: garage?.name || 'Garage',
      address: garage?.address || '',
      service: service_type,
      car: car_reg.toUpperCase(),
      date: booking_date,
      time: booking_time,
      note: description || ''
    }

    const smsText = getMessage(preferred_language || 'en', smsData)

    console.log('=== BOOKING CONFIRMED ===')
    console.log('Ref:', booking.booking_ref)
    console.log('Garage:', garage?.name)
    console.log('Service:', service_type)
    console.log('Note:', description)
    console.log('SMS to', customer_phone, ':')
    console.log(smsText)
    console.log('========================')

    return NextResponse.json({
      success: true,
      booking_ref: booking.booking_ref,
      message: smsText,
      garage: garage?.name
    })

  } catch (e: any) {
    console.error('API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Bookings API - POST to create booking with note' })
}
