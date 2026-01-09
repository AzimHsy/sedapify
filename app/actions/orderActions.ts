'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. FETCH ORDERS
export async function getOrders() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  console.log("👤 Current User ID:", user?.id)

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (quantity, products (name, price, image_url)),
      users (username, email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("❌ Fetch Error:", error.message)
    return []
  }

  return orders || []
}

// 2. UPDATE STATUS (This was missing!)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // Refresh pages to show new status immediately
  revalidatePath('/merchant/dashboard')
  revalidatePath('/driver/dashboard')
  revalidatePath(`/order/${orderId}`)
  
  return { success: true }
}

// 3. DRIVER: ACCEPT JOB (With "Busy" Check)
export async function acceptJob(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  // Check if driver is already busy
  const { data: activeJob } = await supabase
    .from('orders')
    .select('id')
    .eq('driver_id', user.id)
    .not('status', 'in', '("completed","cancelled")')
    .single()

  if (activeJob) {
    return { error: "You must complete your current delivery first!" }
  }

  // Assign Driver
  const { error } = await supabase
    .from('orders')
    .update({ 
        status: 'driver_assigned', 
        driver_id: user.id 
    })
    .eq('id', orderId)

  if (error) return { error: error.message }
  
  revalidatePath('/driver/dashboard')
  return { success: true }
}

// 4. FETCH CUSTOMER ORDERS (Explicitly filter by user_id)
export async function getCustomerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        products (name, price, image_url)
      ),
      shops (name)
    `)
    .eq('user_id', user.id) // <--- STRICT FILTER: Only my own orders
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Fetch My Orders Error:", error.message)
    return []
  }

  return orders || []
}