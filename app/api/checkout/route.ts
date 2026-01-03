import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Or whichever version your IDE suggests
});

export async function POST(req: Request) {
  try {
    const { cartItems, shopName } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Transform your cart items into Stripe's format
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "myr", // Malaysia Ringgit
        product_data: {
          name: item.name,
          description: `Grocery item from ${shopName}`,
          images: item.image_url ? [item.image_url] : [],
          metadata: {
            supabase_product_id: item.id
          }
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents (RM10.00 = 1000)
      },
      quantity: item.qty,
    }));

    // 2. Create the Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      // Redirect back to your success page
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/groceries/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/groceries`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}