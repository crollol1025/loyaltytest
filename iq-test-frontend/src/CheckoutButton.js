import React, { useState } from 'react';

const CheckoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the session ID from the backend
  const fetchSessionId = async () => {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // You can pass any additional data here if needed
    });

    const data = await response.json();
    if (data.sessionId) {
      console.log('Session ID from fetchSessionId:', data.sessionId);
      return data.sessionId;
    } else {
      console.error('Failed to get sessionId:', data);
      throw new Error('Failed to fetch session ID');
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Fetch the session ID from the backend
      const sessionId = await fetchSessionId();

      // Initialize Stripe and redirect to checkout
      const stripe = window.Stripe('pk_test_51RLJAXEHLCRcIqqichjJlEB0TWBwLfUlj4qMEDNVAVtg38FCROcT4eKyVQt0yuYtm8HOPndgM2XsIGQ87wbNmGvo00aRcMkcBK'); // Replace with your actual Stripe public key

      // Check if stripe was initialized correctly
      if (!stripe) {
        throw new Error("Stripe is not initialized.");
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe Checkout error:', error);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }

    setIsLoading(false);
  };

  return (
    <button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Redirecting to Checkout...' : 'Proceed to Checkout'}
    </button>
  );
};

export default CheckoutButton;
