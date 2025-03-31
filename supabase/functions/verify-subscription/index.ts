
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
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
    );

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get the user information from the token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Invalid or expired token');
    }

    const email = userData.user.email;
    if (!email) {
      throw new Error('No email found for user');
    }

    // Get customer by email
    const { data: customers } = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.length === 0) {
      return new Response(
        JSON.stringify({ 
          hasSubscription: false,
          hasOneTimePurchase: false,
          tokenBalance: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const customerId = customers[0].id;

    // Check for active subscriptions
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 100,
    });

    // Check for completed one-time payments
    const { data: charges } = await stripe.charges.list({
      customer: customerId,
      limit: 100,
    });

    const successfulCharges = charges.filter(charge => 
      charge.status === 'succeeded' && !charge.invoice // exclude subscription charges (they have invoice field)
    );

    // In a real application, you would calculate the token balance based on purchases and usage
    // For this example, we're just returning a dummy balance
    const dummyTokenBalance = subscriptions.length > 0 ? 100 : (successfulCharges.length * 50);

    return new Response(
      JSON.stringify({ 
        hasSubscription: subscriptions.length > 0,
        hasOneTimePurchase: successfulCharges.length > 0,
        tokenBalance: dummyTokenBalance
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
