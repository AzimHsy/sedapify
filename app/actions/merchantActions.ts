'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper: Ensure user is a Merchant and get their Shop ID
async function getMerchantShop() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // 1. Verify Role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'merchant') redirect('/')

  // 2. Get Shop ID
  // FIX: Added .limit(1) to prevent crashing if user owns multiple shops
  const { data: shop, error } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()
  
  if (error || !shop) {
    console.error("Merchant Shop Error:", error)
    throw new Error("You are a merchant, but you don't have a shop assigned yet.")
  }

  return { user, shop }
}

// --- PRODUCT MANAGEMENT ---

export async function getMerchantProducts() {
  const { shop } = await getMerchantShop()
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function addMerchantProduct(formData: FormData) {
  const { shop } = await getMerchantShop()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const unit = formData.get('unit') as string
  const imageFile = formData.get('image') as File

  let image_url = null

  if (imageFile && imageFile.size > 0) {
    const filename = `product-${shop.id}-${Date.now()}`
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filename, imageFile)
      
    if (!uploadError) {
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(filename)
      image_url = data.publicUrl
    }
  }

  const { error } = await supabase.from('products').insert({
    name, price, category, unit, 
    shop_id: shop.id, 
    image_url
  })

  if (error) return { error: error.message }
  revalidatePath('/merchant/products')
  return { success: true }
}

export async function deleteMerchantProduct(productId: string) {
  const { shop } = await getMerchantShop() 
  const supabase = await createClient()

  await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('shop_id', shop.id)

  revalidatePath('/merchant/products')
}