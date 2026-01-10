import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
  try {
    // 1. EXTRACT shopId from the request
    const { cartItems, shopName, shopId } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate Total
    const totalAmount = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);

    // Create Stripe Line Items
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

    // 2. SAVE ORDER TO DATABASE
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        shop_id: shopId, // <--- CRITICAL: THIS MUST BE SAVED
        total_amount: totalAmount,
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