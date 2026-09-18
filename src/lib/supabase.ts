import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Garage Booking
export type BookingTab = "New" | "Pending" | "Approved" | "Workshop" | "Ready"

export interface Booking {
  id: string
  reg: string
  car: string
  year: string
  customer: string
  area: string
  phone: string
  arrival: string
  pickup: string
  duration: string
  tab: BookingTab
  time_ago: string
  work: string[] // JSON array
  detail: string
  ai: string
  match: string
  price: string
  parts: string
  supplier: string
  created_at?: string
  updated_at?: string
}
