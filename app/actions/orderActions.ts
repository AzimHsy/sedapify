'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// ==========================================
// 1. SHARED / INTERNAL HELPERS
// ==========================================

// Helper: Check for ALL expired pending orders (Global Cleanup)
// This runs whenever anyone (Merchant/Driver/Admin) checks the list
async function cancelAllExpiredOrders() {
  const supabase = await createClient()
  
  // 1 Minutes Expiry Time
  const oneMinutesAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString()

  // Cancel ANY order that is 'pending' AND older than 1 minutes
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('status', 'pending')
    .lt('created_at', oneMinutesAgo)

  if (error) console.error("Auto-Cancel Error:", error)
}

// ==========================================
// 2. MERCHANT & DRIVER ACTIONS
// ==========================================

export async function getOrders() {
  const supabase = await createClient()
  
  // 1. RUN CLEANUP FIRST (The Fix)
  // Before showing the list to the Merchant/Driver, kill any old pending orders
  await cancelAllExpiredOrders()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (quantity, products (name, price, image_url)),
      users (username, email),
      shops (name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("❌ Fetch Error:", error.message)
    return []
  }

  return orders || []
}

// ... (Keep updateOrderStatus and acceptJob EXACTLY the same as before) ...
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/merchant/dashboard')
  revalidatePath('/driver/dashboard')
  revalidatePath(`/order/${orderId}`)
  return { success: true }
}

export async function acceptJob(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: activeJob } = await supabase
    .from('orders')
    .select('id')
    .eq('driver_id', user.id)
    .not('status', 'in', '("completed","cancelled")')
    .single()

  if (activeJob) return { error: "You must complete your current delivery first!" }

  const { error } = await supabase.from('orders').update({ status: 'driver_assigned', driver_id: user.id }).eq('id', orderId)
  if (error) return { error: error.message }
  
  revalidatePath('/driver/dashboard')
  return { success: true }
}

// ==========================================
// 3. CUSTOMER ACTIONS
// ==========================================

export async function getCustomerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // Run cleanup here too
  await cancelAllExpiredOrders()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (quantity, products (name, price, image_url)),
      shops (name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []

  return orders || []
}

// 5. RESUME PAYMENT (Fixed: Uses Admin to save Session ID)
export async function payForOrderAction(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Fetch Order (Standard Client - checks ownership)
  const { data: order } = await supabase
    .from('orders')
    .select('created_at, shop_id, order_items(quantity, products(name, price, image_url))')
    .eq('id', orderId)
    .single()

  if (!order) return { error: "Order not found" }

  // 2. Expiry Check
  const createdAt = new Date(order.created_at).getTime()
  const now = Date.now()
  const diffInMinutes = (now - createdAt) / 1000 / 60

  if (diffInMinutes > 5) {
    // Admin Client to force cancel
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    return { error: "Order expired. Please create a new order." }
  }

  // 3. Create Stripe Session
  const line_items = order.order_items.map((item: any) => ({
    price_data: {
      currency: "myr",
      product_data: {
        name: item.products.name,
        images: item.products.image_url ? [item.products.image_url] : [],
      },
      unit_amount: Math.round(item.products.price * 100),
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/groceries/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
      metadata: {
        userId: user.id,
        shopId: order.shop_id,
      }
    });

    // 4. CRITICAL FIX: Use Admin Client to save the new Session ID
    // This bypasses RLS rules that might block 'UPDATE'
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)

    if (updateError) {
        console.error("Failed to save session ID:", updateError)
        return { error: "Database error" }
    }

    return { url: session.url }

  } catch (err: any) {
    console.error("Stripe Error:", err)
    return { error: "Payment initialization failed" }
  }
}

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function verifyPayment(sessionId: string) {
  if (!sessionId) return { error: "No session ID" }
  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status === 'paid') {
      await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('stripe_session_id', sessionId).eq('status', 'pending')
      return { success: true }
    }
    return { error: "Payment not completed" }
  } catch (err: any) {
    return { error: err.message }
  }
}

// === NEW ACTION: FORCE EXPIRY ===
export async function expireOrderNow(orderId: string) {
  // Use Admin Client to bypass RLS and ensure cancellation happens regardless of who calls it
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('status', 'pending') // Only cancel if still pending

  if (error) {
    console.error("Expiry Error:", error)
    return { error: error.message }
  }

  // Refresh all relevant paths immediately
  revalidatePath('/orders')
  revalidatePath('/merchant/dashboard')
  revalidatePath('/admin/orders')
  revalidatePath(`/order/${orderId}`)
  
  return { success: true }
}

