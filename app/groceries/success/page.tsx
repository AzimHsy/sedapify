import Link from "next/link";
import { CheckCircle, ShoppingBag, Loader2, XCircle } from "lucide-react";
import { verifyPayment } from "@/app/actions/orderActions";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams; // Next.js 15 requirement
  const sessionId = params.session_id;

  // 1. Trigger Verification
  let isSuccess = false;
  if (sessionId) {
    const result = await verifyPayment(sessionId);
    isSuccess = !!result.success;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-10 rounded-3xl shadow-xl text-center border border-gray-100">
        
        {isSuccess ? (
          <>
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
              <CheckCircle size={48} />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Verified!</h1>
            <p className="text-gray-500 mb-8">
              Your order has been confirmed and sent to the merchant.
            </p>

            <div className="space-y-3">
              <Link 
                href="/orders" 
                className="block w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
              >
                Track My Order
              </Link>
              
              <Link 
                href="/groceries" 
                className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 border border-gray-200 py-4 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                <ShoppingBag size={20} /> Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
             <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-500 mb-6">We couldn't confirm your payment status automatically.</p>
            <Link href="/orders" className="text-blue-600 hover:underline">Check Order History</Link>
          </>
        )}

      </div>
    </div>
  );
}