import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-10 rounded-3xl shadow-xl text-center border border-green-100">
        
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <CheckCircle size={48} />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. Your ingredients will be delivered shortly.
        </p>

        <div className="space-y-3">
          <Link 
            href="/groceries" 
            className="block w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
          >
            Continue Shopping
          </Link>
          
          <Link 
            href="/recipe/create" 
            className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 border border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            <ShoppingBag size={20} /> Use Ingredients to Cook
          </Link>
        </div>

      </div>
    </div>
  );
}