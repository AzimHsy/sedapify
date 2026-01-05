"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ShoppingCart, Plus, Minus, X, CheckCircle, Store, MapPin, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import ShopSelector from "./ShopSelector";

// --- TYPES ---
interface Shop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  image_url: string;
  distance?: number; 
}

interface Product {
  id: string;
  shop_id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  unit: string;
  purchase_limit?: number;
}

const CATEGORIES = ["All", "Vegetables", "Meat & Poultry", "Seafood", "Pantry", "Dairy & Eggs"];

export default function GroceryStore({ 
  initialProducts, 
  initialShops 
}: { 
  initialProducts: Product[], 
  initialShops: Shop[] 
}) {
  
  // --- STATES ---
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ [key: string]: number }>({}); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // --- BUSINESS RULES ---
  const MAX_DISTANCE_KM = 15; 
  const RATE_PER_KM = 0.50;   
  const BASE_FEE = 3.00;

  const deliveryDistance = activeShop?.distance || 0;
  const deliveryFee = deliveryDistance > 0 
    ? parseFloat((BASE_FEE + (deliveryDistance * RATE_PER_KM)).toFixed(2)) 
    : 0;
  const canDeliver = deliveryDistance > 0 && deliveryDistance <= MAX_DISTANCE_KM;

  if (!activeShop) {
    return <ShopSelector shops={initialShops} onShopSelect={(shop) => setActiveShop(shop)} />;
  }

  const filteredProducts = initialProducts.filter((product) => {
    const matchesShop = product.shop_id === activeShop.id;
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShop && matchesCategory && matchesSearch;
  });

  // --- CART OPERATIONS ---
  const addToCart = (id: string) => {
    const product = initialProducts.find(p => p.id === id);
    if (!product) return;

    const currentQty = cart[id] || 0;
    
    if (product.purchase_limit && currentQty >= product.purchase_limit) {
        alert(`RESTRICTED ITEM: You can only buy ${product.purchase_limit} units of ${product.name} per transaction due to government rationing.`);
        return;
    }
    
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCount = (prev[id] || 0) - 1;
      if (newCount <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  
  const subtotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = initialProducts.find((p) => p.id === id);
    return total + (product ? product.price * qty : 0);
  }, 0);

  const finalTotal = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!canDeliver) return; 

    setIsCheckingOut(true);
    const cartItems = Object.entries(cart).map(([id, qty]) => {
      const product = initialProducts.find(p => p.id === id);
      return { ...product, qty };
    });

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cartItems, 
                shopName: activeShop.name,
                shopId: activeShop.id
            }),
        });
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url; 
        } else {
            alert("Payment Error: " + (data.error || "Unknown error"));
            setIsCheckingOut(false);
        }
    } catch (error) {
        alert("Network error");
        setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 pt-2 md:h-screen md:sticky md:top-0 z-30 flex flex-col">
        <div className="bg-white rounded-lg flex items-center justify-center shadow-lg">
          <img src="/sedapmart-logo.png" alt="Logo" className="w-48 h-auto rounded-lg p-2" />
        </div>

        <button 
            onClick={() => {
                if(confirm("Change shop? Cart will be cleared.")) {
                    setActiveShop(null); setCart({});
                }
            }}
            className="mb-6 flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition text-left group"
        >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
                {activeShop.image_url ? (
                    <Image 
                      src={activeShop.image_url} 
                      alt="Shop" 
                      fill
                      className="object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                ) : <Store size={20} className="text-green-600"/>}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Shopping at</p>
                <p className="text-sm font-bold text-gray-900 truncate">{activeShop.name}</p>
            </div>
            <ChevronRight size={16} className="text-green-600 opacity-0 group-hover:opacity-100 transition" />
        </button>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search ingredients..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto md:flex-col gap-2 pb-4 md:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-3 rounded-xl text-left font-medium transition-all ${
                activeCategory === cat ? "bg-green-50 text-green-700 border-l-4 border-green-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      {/* PRODUCT GRID */}
      <main className="flex-1 p-6 pb-28 md:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-gray-800">{activeCategory}</h2>
                <p className="text-gray-500 text-sm">{filteredProducts.length} items found</p>
            </div>
            {activeShop.distance && (
                 <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-white px-3 py-1 rounded-full shadow-sm text-gray-500">
                    <MapPin size={14} /> {(activeShop.distance).toFixed(1)} km away
                 </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-12 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const qty = cart[product.id] || 0;
              return (
                <div key={product.id} className="bg-white rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col group">
                  <div className="relative h-32 md:h-40 w-full mb-3 rounded-xl overflow-hidden bg-gray-100">
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition duration-500" 
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png"
                      }} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.unit}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-green-700">RM {product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    {qty === 0 ? (
                      <button onClick={() => addToCart(product.id)} className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-600 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition"><Plus size={16} /> Add</button>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 rounded-lg p-1">
                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-green-700 hover:bg-gray-100"><Minus size={14}/></button>
                        <span className="font-bold text-sm text-green-700">{qty}</span>
                        <button onClick={() => addToCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-green-700 hover:bg-gray-100"><Plus size={14}/></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FLOATING CART BAR */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 animate-in slide-in-from-bottom-5">
           <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                 <div className="relative">
                   <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-green-200"><ShoppingCart size={22} /></div>
                   <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{totalItems}</div>
                 </div>
                 <div>
                    <p className="font-bold text-gray-900 text-lg">RM {subtotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">View details</p>
                 </div>
              </div>
              <button onClick={() => setIsCartOpen(true)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">View Cart</button>
           </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="font-bold text-xl flex items-center gap-2"><ShoppingCart className="text-green-600"/> My Basket</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {Object.entries(cart).map(([id, qty]) => {
                const product = initialProducts.find(p => p.id === id);
                if (!product) return null;
                return (
                  <div key={id} className="flex gap-4 items-center">
                     <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">
                       <Image 
                         src={product.image_url} 
                         alt={product.name} 
                         fill 
                         className="object-cover" 
                         onError={(e) => {
                           e.currentTarget.src = "/placeholder.png"
                         }} 
                       />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                       <p className="text-green-600 text-sm font-medium">RM {(product.price * qty).toFixed(2)}</p>
                       <p className="text-xs text-gray-400">{product.unit}</p>
                     </div>
                     <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
                        <button onClick={() => removeFromCart(id)} className="w-7 h-7 flex items-center justify-center bg-white shadow-sm rounded-md text-gray-600"><Minus size={14}/></button>
                        <span className="font-bold w-4 text-center text-sm">{qty}</span>
                        <button onClick={() => addToCart(id)} className="w-7 h-7 flex items-center justify-center bg-white shadow-sm rounded-md text-gray-600"><Plus size={14}/></button>
                     </div>
                  </div>
                )
              })}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 safe-area-bottom">
               
               {activeShop?.distance && (
                 <div className="mb-4 text-xs space-y-2">
                    <div className="flex justify-between text-gray-500">
                        <span>Shop Distance</span>
                        <span>{activeShop.distance.toFixed(1)} km</span>
                    </div>
                    
                    {!canDeliver ? (
                         <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertCircle size={16} />
                            <span className="font-bold">Too far for delivery (Max {MAX_DISTANCE_KM}km)</span>
                         </div>
                    ) : (
                        <div className="flex justify-between text-gray-500">
                            <span>Delivery Fee (RM {RATE_PER_KM.toFixed(2)}/km)</span>
                            <span>RM {deliveryFee.toFixed(2)}</span>
                        </div>
                    )}
                 </div>
               )}

               <div className="flex justify-between mb-2 text-gray-500 text-sm">
                 <span>Subtotal</span>
                 <span>RM {subtotal.toFixed(2)}</span>
               </div>
               
               <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
                 <span>Total</span>
                 <span>RM {canDeliver ? finalTotal.toFixed(2) : subtotal.toFixed(2)}</span>
               </div>
               
               <button 
                onClick={handleCheckout}
                disabled={isCheckingOut || !canDeliver} 
                className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                    !canDeliver 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
                }`}
               >
                 {isCheckingOut ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                 {isCheckingOut ? "Processing..." : (!canDeliver ? "Delivery Unavailable" : "Secure Checkout")}
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}