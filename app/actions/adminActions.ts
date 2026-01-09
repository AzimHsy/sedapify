'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- HELPER: CHECK ADMIN PERMISSION ---
// This protects every action in this file
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')
  return user
}

// ==========================================
// 1. DASHBOARD OVERVIEW & STATS
// ==========================================

export async function getDashboardStats() {
  await checkAdmin()
  const supabase = await createClient()

  // Basic Counts
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })

  // Calculate Revenue (Only from 'completed' orders)
  const { data: completedOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: true })

  const totalRevenue = completedOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0

  // Recent Orders (For Dashboard Widget)
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status, users(username)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Prepare Chart Data (Last 7 transactions/days)
  const chartData = completedOrders?.reduce((acc: any[], order) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const existing = acc.find((item: any) => item.date === date)
    
    if (existing) {
      existing.sales += order.total_amount
    } else {
      acc.push({ date, sales: order.total_amount })
    }
    return acc
  }, []).slice(-7) || []

  return {
    orderCount: orderCount || 0,
    userCount: userCount || 0,
    productCount: productCount || 0,
    totalRevenue,
    recentOrders: recentOrders || [],
    chartData
  }
}

// ==========================================
// 2. USER MANAGEMENT (ROLES)
// ==========================================

export async function getAdminUsers() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    
  return data || []
}

export async function updateUserRole(userId: string, newRole: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  // 1. Update the role in users table
  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
  
  if (error) return { error: error.message }

  // 2. Special Logic: If promoting to 'driver', ensure they exist in 'drivers' table
  if (newRole === 'driver') {
    // Upsert ensures we don't crash if they are already a driver
    await supabase.from('drivers').upsert({ id: userId }).select()
  }
  
  revalidatePath('/admin/users')
  return { success: true }
}

// ==========================================
// 3. ORDER OVERSIGHT
// ==========================================

export async function getAdminOrders() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      users (username, email),
      shops (name),
      drivers (id)
    `)
    .order('created_at', { ascending: false })
    
  return orders || []
}

// Admin Power: Force Cancel an order (e.g. disputes/fraud)
export async function adminCancelOrder(orderId: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    
  revalidatePath('/admin/orders')
}

// ==========================================
// 4. CONTENT MODERATION (RECIPES & VIDEOS)
// ==========================================

export async function getAdminRecipes() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('recipes')
    .select('*, users(username, email)')
    .order('created_at', { ascending: false })
    
  return data || []
}

export async function deleteRecipe(recipeId: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId)
  if (error) console.error("Delete Recipe Error:", error)

  revalidatePath('/admin/recipes')
}

export async function getAdminVideos() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('cooking_videos')
    .select('*, users(username, email), recipes(title)')
    .order('created_at', { ascending: false })
    
  return data || []
}

export async function deleteVideo(videoId: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  await supabase.from('cooking_videos').delete().eq('id', videoId)
  revalidatePath('/admin/videos')
}

// ==========================================
// 5. INVENTORY MODERATION (PRODUCTS)
// ==========================================

// Note: Admins do NOT add/edit products (Merchants do that).
// Admins only delete illegal/bad products.

export async function deleteProduct(productId: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  await supabase.from('products').delete().eq('id', productId)
  revalidatePath('/admin/products')
}

// ==========================================
// 6. ANALYTICS
// ==========================================

export async function getCategoryStats() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase.from('products').select('category')
  
  // Aggregate counts
  const counts: Record<string, number> = {}
  data?.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1
  })

  // Format for Recharts
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}