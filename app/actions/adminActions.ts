'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- HELPER: CHECK ADMIN PERMISSION ---
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

// --- ORDER MANAGEMENT ---

export async function getAdminOrders() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      users (username, email),
      shops (name)
    `)
    .order('created_at', { ascending: false })
    
  return orders || []
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    
  revalidatePath('/admin/orders')
}

// --- PRODUCT / INVENTORY MANAGEMENT ---

export async function addProduct(formData: FormData) {
  await checkAdmin()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const unit = formData.get('unit') as string
  const shop_id = formData.get('shop_id') as string
  const imageFile = formData.get('image') as File

  let image_url = null

  // Upload Image
  if (imageFile && imageFile.size > 0) {
    const filename = `product-${Date.now()}`
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filename, imageFile)
      
    if (!uploadError) {
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(filename)
      image_url = data.publicUrl
    }
  }

  const { error } = await supabase.from('products').insert({
    name, price, category, unit, shop_id, image_url
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProduct(formData: FormData) {
  await checkAdmin()
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const unit = formData.get('unit') as string
  const shop_id = formData.get('shop_id') as string
  const imageFile = formData.get('image') as File
  const currentImageUrl = formData.get('current_image_url') as string

  let image_url = currentImageUrl

  if (imageFile && imageFile.size > 0) {
    const filename = `product-${Date.now()}`
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filename, imageFile)
      
    if (!uploadError) {
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(filename)
      image_url = data.publicUrl
    }
  }

  const { error } = await supabase
    .from('products')
    .update({ name, price, category, unit, shop_id, image_url })
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  await checkAdmin()
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', productId)
  revalidatePath('/admin/products')
}

// --- DASHBOARD STATS ---

export async function getDashboardStats() {
  await checkAdmin()
  const supabase = await createClient()

  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })

  // Revenue (Paid + Delivered)
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .in('status', ['paid', 'delivered']) 
    .order('created_at', { ascending: true })

  const totalRevenue = paidOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0

  // Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status, users(username)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Chart Data
  const chartData = paidOrders?.reduce((acc: any[], order) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const existing = acc.find(item => item.date === date)
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

// --- RECIPES ---

export async function getAdminRecipes() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('recipes')
    .select('*, users(username, email)')
    .order('created_at', { ascending: false })
    
  return data || []
}

// --- VIDEOS ---

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

// --- USERS ---

export async function getAdminUsers() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    
  return data || []
}

// --- ANALYTICS ---

export async function getCategoryStats() {
  await checkAdmin()
  const supabase = await createClient()
  
  const { data } = await supabase.from('products').select('category')
  
  const counts: Record<string, number> = {}
  data?.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1
  })

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
} 

// --- ADMIN DELETE RECIPE (NEW) ---

export async function deleteRecipe(recipeId: string) {
  await checkAdmin()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId)

  if (error) console.error("Delete Error:", error)
  revalidatePath('/admin/recipes')
}