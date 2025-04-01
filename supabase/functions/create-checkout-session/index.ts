
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

    // Get the user's email from the auth token if available
    let customerEmail = undefined;
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_ANON_KEY') || '',
        );
        
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (!userError && userData?.user?.email) {
          customerEmail = userData.user.email;
          console.log('Found user email:', customerEmail);
        }
      }
    } catch (error) {
      console.warn('Error getting user email:', error);
      // Continue without email if there's an error
    }

    if (paymentType === 'one-time') {
      // Calculate price per token based on quantity
      const pricePerToken = calculatePricePerToken(tokenAmount);
      const amount = pricePerToken * tokenAmount * 100; // Price in cents
      
      // Create a payment intent for one-time purchase
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'pln',
        description: `${tokenAmount} tokenów dla ProstyScreening.ai`,
        metadata: {
          tokenAmount: tokenAmount.toString(),
          paymentType: 'one-time',
        },
        automatic_payment_methods: {
          enabled: true,
        }
      });

      console.log('Payment intent created successfully:', paymentIntent.id);
      return new Response(
        JSON.stringify({ 
          clientSecret: paymentIntent.client_secret,
          paymentType: 'one-time',
          amount: tokenAmount,
          unitPrice: pricePerToken,
          totalPrice: amount / 100 // Convert back to PLN
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Subscription flow - create a setup intent
      // First find or create customer
      let customer;
      
      if (customerEmail) {
        // Look for existing customer
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          // Create a new customer
          customer = await stripe.customers.create({
            email: customerEmail,
            metadata: {
              tokenSubscriptionAmount: tokenAmount.toString()
            }
          });
        }
      } else {
        // Create anonymous customer
        customer = await stripe.customers.create({
          metadata: {
            tokenSubscriptionAmount: tokenAmount.toString()
          }
        });
      }
      
      // Create a SetupIntent
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
        metadata: {
          tokenAmount: tokenAmount.toString(),
          paymentType: 'subscription',
        },
      });
      
      // Calculate price for display
      const pricePerToken = calculatePricePerToken(tokenAmount);
      
      console.log('Setup intent created successfully:', setupIntent.id);
      return new Response(
        JSON.stringify({ 
          clientSecret: setupIntent.client_secret,
          customerId: customer.id,
          paymentType: 'subscription',
          amount: tokenAmount,
          unitPrice: pricePerToken,
          totalPrice: pricePerToken * tokenAmount
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error creating payment:', error);
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
