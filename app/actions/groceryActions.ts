'use server'

import { createClient } from '@/lib/supabase/server'

// 1. Fetch Products
export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*')
  if (error) console.error(error)
  return data || []
}

// 2. Fetch Shops (NEW)
export async function getShops() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('shops').select('*')
  if (error) console.error(error)
  return data || []
}