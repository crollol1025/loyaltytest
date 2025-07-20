// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // ✅ Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can replace * with your domain for production
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 1️⃣ Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2️⃣ Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Safely parse the request body
    const { score } = req.body;

    // Validate input
    if (typeof score !== 'number') {
      console.error('Invalid score provided:', score);
      return res.status(400).json({ error: 'Invalid score provided' });
    }

    console.log('Creating checkout session for score:', score);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Relationship Loyalty Test Result' },
            unit_amount: 200, // $2.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        score: score.toString(),
      },
    });

    console.log('Checkout session created:', session.id);
    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
}
