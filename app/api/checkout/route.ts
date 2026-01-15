import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any,
});

export async function POST(req: Request) {
  try {
    // 1. EXTRACT deliveryFee
    const { cartItems, shopName, shopId, deliveryFee } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. CALCULATE TOTAL (Items + Delivery)
    const itemsTotal = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);
    // Ensure we handle the case where deliveryFee might be undefined/null
    const fee = typeof deliveryFee === 'number' ? deliveryFee : 0;
    const totalAmount = itemsTotal + fee;

    // 3. CREATE STRIPE LINE ITEMS
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "myr",
        product_data: {
            name: item.name,
            images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    // --- FIX: ADD DELIVERY FEE LINE ITEM ---
    if (fee > 0) {
      line_items.push({
        price_data: {
          currency: "myr",
          product_data: {
            name: "Delivery Fee",
            description: "Distance-based delivery charge"
          },
          unit_amount: Math.round(fee * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/groceries/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/groceries`,
      metadata: {
        userId: user.id,
        shopId: shopId || null, 
      }
    });

    // 4. SAVE ORDER WITH CORRECT TOTAL
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        shop_id: shopId,
        total_amount: totalAmount, // <--- Now includes delivery
        status: 'pending',
        stripe_session_id: session.id
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Save Order Items
    const orderItemsData = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        price_at_purchase: item.price
    }));

    await supabase.from('order_items').insert(orderItemsData);

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}