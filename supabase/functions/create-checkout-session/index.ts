
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { paymentType, tokenAmount } = await req.json();
    
    console.log("Received request with:", { paymentType, tokenAmount });
    
    // Initialize Stripe with secret key from environment variables
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Calculate token price based on quantity (implement discounts)
    const getTokenPrice = (amount: number): number => {
      if (amount >= 150) return 5;
      if (amount >= 100) return 6;
      if (amount >= 50) return 7;
      return 8;
    };
    
    const unitPrice = getTokenPrice(tokenAmount);
    const totalAmount = unitPrice * tokenAmount;
    
    // Create a payment intent or setup intent based on payment type
    if (paymentType === 'one-time') {
      // Create a payment intent for one-time payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // amount in cents
        currency: 'pln',
        payment_method_types: ['card'],
        metadata: {
          tokenAmount: tokenAmount.toString(),
          unitPrice: unitPrice.toString(),
          paymentType
        },
        // Set longer timeout to prevent expiration issues
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      });
      
      console.log("Payment intent created successfully:", paymentIntent.id);
      
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentType,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          id: paymentIntent.id  // Include the ID for reference
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      // Create a setup intent for subscription payments
      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['card'],
        metadata: {
          tokenAmount: tokenAmount.toString(),
          unitPrice: unitPrice.toString(),
          paymentType
        },
        // Always creating a new setup intent, never reusing
        usage: 'off_session',
        // Set longer expiration through confirm parameters
        confirm: false
      });
      
      console.log("Setup intent created successfully:", setupIntent.id);
      
      return new Response(
        JSON.stringify({
          clientSecret: setupIntent.client_secret,
          paymentType,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          id: setupIntent.id  // Include the ID for reference
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
