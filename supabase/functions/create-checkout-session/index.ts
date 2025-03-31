
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const { paymentType, tokenAmount } = await req.json();
    console.log('Received request with:', { paymentType, tokenAmount });

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let sessionConfig;

    if (paymentType === 'one-time') {
      // Calculate price per token based on quantity
      const pricePerToken = calculatePricePerToken(tokenAmount);
      const totalAmount = pricePerToken * tokenAmount * 100; // Convert to cents
      
      // One-time purchase config
      sessionConfig = {
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: `${tokenAmount} tokenów`,
                description: 'Tokeny dla ProstyScreening.ai platform',
                images: ['https://your-site.com/token-image.png'], // Optional
              },
              unit_amount: pricePerToken * 100, // Price in cents
              tax_behavior: 'exclusive',
            },
            quantity: tokenAmount,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/dashboard?success=true`,
        cancel_url: `${req.headers.get('origin')}/onboarding?step=2&canceled=true`,
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
      };
    } else {
      // Calculate price per token based on quantity
      const pricePerToken = calculatePricePerToken(tokenAmount);
      
      // Subscription config
      sessionConfig = {
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: 'Automatyczne doładowanie tokenów',
                description: `Automatyczne doładowanie ${tokenAmount} tokenów gdy stan konta spada poniżej 10`,
                images: ['https://your-site.com/subscription-image.png'], // Optional
              },
              unit_amount: pricePerToken * 100, // Price per token in cents
              recurring: {
                interval: 'month',
                interval_count: 1,
                usage_type: 'licensed',
              },
              tax_behavior: 'exclusive',
            },
            quantity: tokenAmount,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/dashboard?success=true`,
        cancel_url: `${req.headers.get('origin')}/onboarding?step=2&canceled=true`,
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
        customer_email: null, // Can be set based on authenticated user
      };
    }

    console.log('Creating checkout session with config:', sessionConfig);
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Session created successfully:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Function to calculate price per token based on quantity
function calculatePricePerToken(quantity) {
  if (quantity >= 150) return 5;
  if (quantity >= 100) return 6;
  if (quantity >= 50) return 7;
  return 8;
}
