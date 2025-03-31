
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
    const { paymentType, tokenAmount, priceId } = await req.json();
    console.log('Received request with:', { paymentType, tokenAmount, priceId });

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    let sessionConfig;

    if (paymentType === 'one-time') {
      // One-time purchase config
      sessionConfig = {
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: `${tokenAmount} tokens`,
                description: 'Tokens for ProstyScreening.ai platform',
              },
              unit_amount: calculatePricePerToken(tokenAmount) * 100, // Price in cents
              tax_behavior: 'exclusive',
            },
            quantity: tokenAmount,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/dashboard?success=true`,
        cancel_url: `${req.headers.get('origin')}/onboarding?step=2&canceled=true`,
      };
    } else {
      // Subscription config
      sessionConfig = {
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: 'Automatic Token Subscription',
                description: 'Automatic token refill when balance falls below 10 tokens',
              },
              unit_amount: 7 * 100, // Price per token in cents (7 PLN)
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
              tax_behavior: 'exclusive',
            },
            quantity: 50, // Default subscription amount of 50 tokens
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/dashboard?success=true`,
        cancel_url: `${req.headers.get('origin')}/onboarding?step=2&canceled=true`,
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
