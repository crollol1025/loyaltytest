const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const stripe = require('stripe');  // Do not call stripe here, we'll pass the key below.

dotenv.config();  // ✅ Load environment variables before using them

// Initialize stripe with the secret key after loading .env
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

const app = express();

// ✅ Allow all origins temporarily to fix CORS issue
app.use(cors());

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  // Retrieve score from the frontend (sent in the body of the request)
  const { score } = req.body;  // Ensure you're sending 'score' from frontend
  
  // ✅ Manually set CORS header for extra safety
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  
  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Relationship Loyalty Test Result' },
          unit_amount: 500,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID},
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        score: score,  // Store the score in the session metadata
      },
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(Backend server running on port ${PORT});
});