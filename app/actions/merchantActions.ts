'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers' // <--- Import Cookies

// 1. ACTION: Switch Active Shop (Called by Sidebar)
export async function switchMerchantShop(shopId: string) {
  const cookieStore = await cookies()
  cookieStore.set('merchant_active_shop', shopId)
  revalidatePath('/merchant') // Refresh all merchant pages
}

// 2. HELPER: Get the currently active shop based on Cookie
async function getMerchantShop() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Check Role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'merchant') redirect('/')

  // Check Cookie
  const cookieStore = await cookies()
  const activeShopId = cookieStore.get('merchant_active_shop')?.value

  let shop = null

  if (activeShopId) {
    // A. Try to fetch the specific shop from cookie (Security: Must still be owned by user)
    const { data } = await supabase
      .from('shops')
      .select('id')
      .eq('id', activeShopId)
      .eq('owner_id', user.id)
      .single()
    shop = data
  }

  if (!shop) {
    // B. Fallback: If cookie is missing or invalid, grab the first shop owned
    const { data } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single()
    shop = data
  }
  
  if (!shop) {
    throw new Error("You are a merchant, but you don't have a shop assigned yet.")
  }

  return { user, shop }
}

// --- PRODUCT MANAGEMENT (Unchanged logic, but now uses the smart getMerchantShop) ---

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
    // 1. Get file extension
    const fileExt = imageFile.name.split('.').pop()
    
    // 2. SANITIZE FILENAME: Create a clean, safe name
    // Example: product-123-17150000.png (No spaces, no weird symbols)
    const fileName = `product-${shop.id}-${Date.now()}.${fileExt}`

    // 3. Upload with the CLEAN name
    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      })
      
    if (uploadError) {
      console.error("Upload Error:", uploadError)
      return { error: "Image upload failed: " + uploadError.message }
    } else {
      // 4. Get the URL for the CLEAN name
      const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName)
      image_url = data.publicUrl
      console.log("✅ Image Saved to:", image_url) // Check your terminal to see this
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