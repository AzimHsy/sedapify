import { createClient } from '@/lib/supabase/server'
import AdminProductForm from '@/components/AdminProductForm'
import ProductFilters from '@/components/ProductFilters'
import AdminProductList from '@/components/AdminProductList'

// Define props to receive searchParams (URL query strings)
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>
}) {
  const params = await searchParams // Next.js 15 requirement
  const query = params.q || ''
  const category = params.cat || ''

  const supabase = await createClient()
  
  // 1. Start Query
  let dbQuery = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Apply Filters if they exist
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`) // Case-insensitive search
  }
  if (category && category !== 'All') {
    dbQuery = dbQuery.eq('category', category)
  }

  // 3. Execute Query
  const { data: products } = await dbQuery
  const { data: shops } = await supabase.from('shops').select('id, name')

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      
      {/* LEFT: Product List & Filters */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold">Inventory</h1>
        </div>

        {/* SEARCH & FILTER COMPONENT */}
        <ProductFilters />

        {/* LIST COMPONENT (With Edit Modal built-in) */}
        <AdminProductList products={products || []} shops={shops || []} />
      </div>

      {/* RIGHT: Add Product Form */}
      <div>
        <AdminProductForm shops={shops || []} />
      </div>

    </div>
  )
}