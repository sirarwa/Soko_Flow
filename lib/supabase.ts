import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get authenticated user
export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Types for our database tables
export type Transaction = {
  id: string
  user_id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
  vendor?: string
  customer?: string
  items?: { name: string; quantity: number; price: number }[]
  receipt_url?: string
  created_at: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  type: "income" | "expense"
  icon?: string
}

export type Goal = {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  start_date: string
  end_date: string
  type: "income" | "expense" | "profit"
}

export type UserPreferences = {
  id: string
  user_id: string
  language: string
  currency: string
  dashboard_widgets: string[]
  notifications_enabled: boolean
}
