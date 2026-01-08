import { getProducts, getShops } from "@/app/actions/groceryActions";
import GroceryStore from "@/components/GroceryStore";

export default async function GroceriesPage() {
  // Run both fetches in parallel
  const [products, shops] = await Promise.all([
    getProducts(),
    getShops()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <GroceryStore 
        initialProducts={products} 
        initialShops={shops}
      />
    </div>
  );
}