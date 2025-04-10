
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Get the user information from the token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Invalid or expired token');
    }

    const userId = userData.user.id;

    // Get the workspace for this user
    const { data: memberData, error: memberError } = await supabaseClient
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberData?.workspace_id) {
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

    // Get workspace details including token balance and stripe customer ID
    const { data: workspaceData, error: workspaceError } = await supabaseClient
      .from('workspaces')
      .select('stripe_customer_id, token_balance')
      .eq('id', memberData.workspace_id)
      .single();
    
    if (workspaceError || !workspaceData) {
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

    const stripeCustomerId = workspaceData.stripe_customer_id;
    const tokenBalance = workspaceData.token_balance || 0;
    
    // If no Stripe customer ID exists yet, there are no payments
    if (!stripeCustomerId) {
      return new Response(
        JSON.stringify({ 
          hasSubscription: false,
          hasOneTimePurchase: false,
          tokenBalance: tokenBalance
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check for active subscriptions
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 100,
    });

    // Check for completed one-time payments
    const { data: charges } = await stripe.charges.list({
      customer: stripeCustomerId,
      limit: 100,
    });

    const successfulCharges = charges.filter(charge => 
      charge.status === 'succeeded' && !charge.invoice // exclude subscription charges (they have invoice field)
    );

    return new Response(
      JSON.stringify({ 
        hasSubscription: subscriptions.length > 0,
        hasOneTimePurchase: successfulCharges.length > 0,
        tokenBalance: tokenBalance,
        customerExists: true,
        customerId: stripeCustomerId
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
