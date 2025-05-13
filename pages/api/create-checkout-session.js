import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { score } = req.body;

  // Validate the score parameter
  if (typeof score !== 'number') {
    console.error('Invalid score provided:', score);
    return res.status(400).json({ error: 'Invalid score provided' });
  }

  try {
    console.log('Creating checkout session for score:', score);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Relationship Loyalty Test Result',
            },
            unit_amount: 200, // $2.00 (Stripe uses the smallest unit of the currency, in cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        score: score.toString(), // Stripe metadata values must be strings
      },
    });

    console.log('Checkout session created:', session.id);

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
}
