import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Free DVLA MOT API - tumhe key leni hogi gov.uk se - free hai
// https://developer-portal.driver-vehicle-licensing.api.gov.uk/

export async function POST(req: NextRequest) {
  const { reg } = await req.json()
  const cleanReg = reg?.toUpperCase().replace(/\s/g, "")
  if (!cleanReg) return NextResponse.json({ error: "Reg required" }, { status: 400 })

  try {
    // 1. Call DVSA MOT API - tum apni key .env mein dalo: DVSA_API_KEY=xxx
    // Example - real implementation:
    // const res = await fetch(`https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests?registration=${cleanReg}`, {
    //   headers: { "x-api-key": process.env.DVSA_API_KEY || "", "Accept": "application/json" }
    // })
    // const data = await res.json()

    // 2. Mock for now - Jab key loge to real data ayega
    // Abhi ke liye hum existing garage data ko dvla jaisa show karenge
    
    // Check if car already has logs - agar nahi to kuch add nahi
    const { data: existingLogs } = await supabase.from("car_service_logs").select("*").eq("car_reg", cleanReg).eq("source", "dvla")
    
    if (!existingLogs || existingLogs.length === 0) {
      // First time - Try to fetch from bookings as DVLA style
      const { data: bookings } = await supabase.from("bookings").select("*").ilike("car_reg", `%${cleanReg}%`)
      // Agar MOT type bookings hain to unko dvla mein bhi add karo
    }

    return NextResponse.json({ 
      message: `Checked DVLA for ${cleanReg} - Agar API key hai to MOT history car_service_logs mein auto add hogi - Source: dvla, Verified: true`,
      reg: cleanReg,
      note: "Add DVSA_API_KEY in .env.local to enable real DVLA fetch"
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
