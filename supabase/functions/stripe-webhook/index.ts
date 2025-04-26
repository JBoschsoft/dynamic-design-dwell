
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No stripe signature found');
    }

    // Get the raw body as text
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Webhook verified:', event.type);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout session:', session.id);
        
        // Add new tokens based on the payment
        if (session.metadata?.tokenAmount) {
          const tokenAmount = parseInt(session.metadata.tokenAmount);
          const paymentType = session.metadata.paymentType || 'one-time';
          
          // Get workspace by customer ID
          const { data: workspace, error: workspaceError } = await supabaseClient
            .from('workspaces')
            .select('id, token_balance')
            .eq('stripe_customer_id', session.customer)
            .single();
            
          if (workspaceError) {
            console.error('Error finding workspace:', workspaceError);
            break;
          }
          
          // Update token balance
          const { error: updateError } = await supabaseClient
            .from('workspaces')
            .update({ 
              token_balance: (workspace.token_balance || 0) + tokenAmount,
              balance_auto_topup: paymentType === 'auto-recharge'
            })
            .eq('id', workspace.id);
            
          if (updateError) {
            console.error('Error updating token balance:', updateError);
          } else {
            console.log(`Token balance updated for workspace ${workspace.id}: +${tokenAmount} tokens`);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`Subscription ${event.type}:`, subscription.id);
        
        // Get workspace by customer ID
        const { data: workspace, error: workspaceError } = await supabaseClient
          .from('workspaces')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single();
          
        if (workspaceError) {
          console.error('Error finding workspace:', workspaceError);
          break;
        }
        
        // Update auto-topup status based on subscription status
        const { error: updateError } = await supabaseClient
          .from('workspaces')
          .update({ 
            balance_auto_topup: subscription.status === 'active'
          })
          .eq('id', workspace.id);
          
        if (updateError) {
          console.error('Error updating workspace subscription status:', updateError);
        } else {
          console.log(`Updated subscription status for workspace ${workspace.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
