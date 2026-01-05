'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// CHECK ADMIN PERMISSION
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

// --- ORDERS ---

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

// --- PRODUCTS ---

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
      .from('recipe-images') // Re-using existing bucket for simplicity
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

export async function deleteProduct(productId: string) {
  await checkAdmin()
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', productId)
  revalidatePath('/admin/products')
}

export async function getDashboardStats() {
  await checkAdmin()
  const supabase = await createClient()

  // 1. Basic Counts
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })

  // 2. Revenue
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .in('status', ['paid', 'delivered'])
    .order('created_at', { ascending: true })

  const totalRevenue = paidOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0

  // 3. Recent 5 Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status, users(username)')
    .order('created_at', { ascending: false })
    .limit(5)

  // 4. Prepare Chart Data (Last 7 Days)
  // We process this in JS because Supabase GroupBy requires complex SQL functions
  const chartData = paidOrders?.reduce((acc: any[], order) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.sales += order.total_amount
    } else {
      acc.push({ date, sales: order.total_amount })
    }
    return acc
  }, []).slice(-7) || [] // Take last 7 entries

  return {
    orderCount: orderCount || 0,
    userCount: userCount || 0,
    productCount: productCount || 0,
    totalRevenue,
    recentOrders: recentOrders || [],
    chartData
  }
}