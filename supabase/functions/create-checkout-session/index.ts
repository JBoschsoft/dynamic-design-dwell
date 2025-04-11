
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimiter = new Map();

// Clear rate limiter entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimiter.entries()) {
    if (now - timestamp > 60000) { // Remove entries older than 1 minute
      rateLimiter.delete(key);
    }
  }
}, 60000);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { paymentType, tokenAmount, paymentMethodId, customerId, forceNewIntent } = await req.json();
    
    console.log("Received request with:", { paymentType, tokenAmount, paymentMethodId, customerId, forceNewIntent });
    
    // Initialize Stripe with secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in Edge Function secrets');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured in Edge Function secrets');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Initializing Stripe API connection...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retries for network issues
    });
    
    // Extract user information from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error("Error getting user from token:", userError);
      } else if (userData && userData.user) {
        userId = userData.user.id;
        console.log("User ID from token:", userId);
      }
    }
    
    // Get the user's workspace ID if they're logged in
    let workspaceId = null;
    if (userId) {
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (memberError) {
        console.error("Error getting workspace:", memberError);
      } else if (memberData) {
        workspaceId = memberData.workspace_id;
        console.log("Found workspace ID:", workspaceId);
      }
    }
    
    // Calculate token price based on quantity (implement discounts)
    const getTokenPrice = (amount: number): number => {
      if (amount >= 150) return 5;
      if (amount >= 100) return 6;
      if (amount >= 50) return 7;
      return 8;
    };
    
    const unitPrice = getTokenPrice(tokenAmount);
    const totalAmount = unitPrice * tokenAmount;
    
    // Determine if auto-topup should be enabled
    const isAutoTopupEnabled = paymentType === 'subscription';
    
    // If we already have a paymentMethodId from a setup intent confirmation
    if (paymentMethodId && paymentType === 'subscription') {
      try {
        console.log("Processing subscription with payment method:", paymentMethodId);
        
        // Find or create a customer to attach the payment method to
        let customer;
        let isNewCustomer = false;
        
        if (customerId) {
          console.log("Retrieving existing customer:", customerId);
          try {
            customer = await stripe.customers.retrieve(customerId);
            console.log("Found existing customer:", customer.id);
          } catch (error) {
            console.error("Error retrieving customer, will create new one:", error);
            console.log("Customer ID that failed:", customerId);
            customer = null; // Reset to create new customer
          }
        } 
        
        if (!customerId || !customer) {
          // Get user email for new customer creation if available
          let userEmail = null;
          if (userId) {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
            if (!userError && userData && userData.user?.email) {
              userEmail = userData.user.email;
            }
          }
          
          // Create a new customer with the payment method and appropriate metadata for auto-recharge
          console.log("Creating new customer with payment method:", paymentMethodId);
          customer = await stripe.customers.create({
            email: userEmail || undefined,
            payment_method: paymentMethodId,
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
            metadata: {
              autoRecharge: "true",
              rechargeThreshold: "10",
              rechargeAmount: tokenAmount.toString(),
              userId: userId || undefined,
              workspaceId: workspaceId || undefined
            }
          });
          isNewCustomer = true;
          console.log("Created new customer:", customer.id);
        } else {
          // If we're using an existing customer, we should update their metadata and default payment method
          await stripe.customers.update(customer.id, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
            metadata: {
              autoRecharge: "true",
              rechargeThreshold: "10",
              rechargeAmount: tokenAmount.toString(),
              userId: userId || undefined,
              workspaceId: workspaceId || undefined
            }
          });
          console.log("Updated existing customer metadata and default payment method");
        }
        
        // Verify the payment method exists before attempting to attach it
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
          console.log("Payment method exists:", paymentMethod.id);
        } catch (error) {
          console.error("Error retrieving payment method:", error);
          throw new Error(`Invalid payment method: ${paymentMethodId}`);
        }
        
        // Attach the payment method to the customer if not already
        try {
          console.log("Attaching payment method to customer");
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
          });
          console.log("Payment method attached successfully");
          
          // Update the payment method with metadata for auto-recharge
          await stripe.paymentMethods.update(paymentMethodId, {
            metadata: {
              autoRecharge: "true",
              forOffSessionUsage: "true"
            }
          });
          console.log("Updated payment method metadata for off-session usage");
          
        } catch (error) {
          // Only continue if the error is because it's already attached
          if (!error.message?.includes("already been attached")) {
            console.error("Error attaching payment method:", error);
            throw error;
          }
          console.log("Payment method already attached");
          
          // Still update the payment method metadata
          await stripe.paymentMethods.update(paymentMethodId, {
            metadata: {
              autoRecharge: "true",
              forOffSessionUsage: "true"
            }
          });
          console.log("Updated payment method metadata for off-session usage");
        }
        
        // Set as the default payment method
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        console.log("Updated customer's default payment method");
        
        // Create a payment intent for the initial charge
        console.log("Creating payment intent for initial charge");
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount * 100, // amount in cents
          currency: 'pln',
          customer: customer.id,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          metadata: {
            tokenAmount: tokenAmount.toString(),
            unitPrice: unitPrice.toString(),
            paymentType: "subscription-initial",
            autoRecharge: "true",
            workspaceId: workspaceId || undefined
          },
          setup_future_usage: 'off_session', // Explicitly set this for future charges
          description: `Initial subscription charge for ${tokenAmount} tokens`,
        });
        
        console.log("Initial subscription charge created:", paymentIntent.id, "Status:", paymentIntent.status);
        
        // Update workspace table with Stripe customer ID and auto-topup setting
        if (workspaceId && (isNewCustomer || customerId !== customer.id)) {
          const { error: updateError } = await supabase
            .from('workspaces')
            .update({ 
              stripe_customer_id: customer.id,
              token_balance: tokenAmount,
              balance_auto_topup: isAutoTopupEnabled
            })
            .eq('id', workspaceId);
          
          if (updateError) {
            console.error("Error updating workspace with Stripe customer ID:", updateError);
          } else {
            console.log("Updated workspace with Stripe customer ID, token balance, and auto-topup setting");
          }
        }
        
        return new Response(
          JSON.stringify({
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            customerId: customer.id,
            amount: tokenAmount,
            unitPrice,
            totalPrice: totalAmount,
            setupForAutoRecharge: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } catch (error) {
        console.error("Error creating initial subscription charge:", error);
        
        // Handle specific Stripe errors that might need special responses
        if (error.type === 'StripeCardError') {
          return new Response(
            JSON.stringify({ 
              error: error.message,
              code: error.code,
              decline_code: error.decline_code
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: error.message || 'An error occurred processing the subscription',
            errorType: error.type || 'unknown'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
    }
    
    // Create a payment intent or setup intent based on payment type
    if (paymentType === 'one-time') {
      console.log("Creating one-time payment intent for", tokenAmount, "tokens");
      
      // Find existing Stripe customer ID for this workspace if available
      let stripeCustomerId = null;
      let userEmail = null;
      
      if (userId) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (!userError && userData && userData.user?.email) {
          userEmail = userData.user.email;
        }
      }
      
      if (workspaceId) {
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('stripe_customer_id')
          .eq('id', workspaceId)
          .maybeSingle();
        
        if (!workspaceError && workspaceData && workspaceData.stripe_customer_id) {
          stripeCustomerId = workspaceData.stripe_customer_id;
          console.log("Found existing Stripe customer ID:", stripeCustomerId);
          
          // Verify the customer still exists in Stripe
          try {
            await stripe.customers.retrieve(stripeCustomerId);
          } catch (error) {
            console.error("Customer no longer exists in Stripe, will create new one:", error);
            stripeCustomerId = null;
          }
        }
      }
      
      // If no Stripe customer ID exists and we have a user ID, create one
      if (!stripeCustomerId && userEmail) {
        console.log("Creating new Stripe customer for user email:", userEmail);
        
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
            workspaceId: workspaceId || undefined,
            autoRecharge: "false" // Explicitly mark as not auto-recharge
          }
        });
        
        stripeCustomerId = customer.id;
        console.log("Created new customer:", stripeCustomerId);
        
        // Update workspace with new Stripe customer ID
        if (workspaceId) {
          const { error: updateError } = await supabase
            .from('workspaces')
            .update({ 
              stripe_customer_id: stripeCustomerId,
              balance_auto_topup: false 
            })
            .eq('id', workspaceId);
          
          if (updateError) {
            console.error("Error updating workspace with Stripe customer ID:", updateError);
          } else {
            console.log("Updated workspace with new Stripe customer ID");
          }
        }
      }
      
      // Create a payment intent for one-time payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // amount in cents
        currency: 'pln',
        customer: stripeCustomerId || undefined,
        payment_method_types: ['card'],
        metadata: {
          tokenAmount: tokenAmount.toString(),
          unitPrice: unitPrice.toString(),
          paymentType,
          autoRecharge: "false",
          workspaceId: workspaceId || undefined,
          userId: userId || undefined,
          createdAt: new Date().toISOString() // Add creation timestamp
        },
        description: `One-time purchase of ${tokenAmount} tokens`,
        // For one-time payments, explicitly set to null (not an empty string)
        setup_future_usage: null,
      });
      
      console.log("Payment intent created successfully:", paymentIntent.id, "Client Secret:", paymentIntent.client_secret?.substring(0, 10) + "...");
      
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentType,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          id: paymentIntent.id,
          customerId: stripeCustomerId,
          timestamp: new Date().toISOString(), // Add timestamp to help track intent freshness
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      console.log(`Creating setup intent for subscription payments${forceNewIntent ? ' (forcing new intent)' : ''}`);
      
      // Apply rate limiting for setup intent creation
      // Create a unique key based on userId or a client identifier
      const clientId = userId || req.headers.get('X-Client-Info') || req.headers.get('User-Agent') || 'anonymous';
      const rateKey = `${clientId}:${paymentType}:${tokenAmount}`;
      
      // Check if we've created an intent for this user recently, unless we're forcing a new one
      if (!forceNewIntent) {
        const lastCreation = rateLimiter.get(rateKey);
        if (lastCreation && Date.now() - lastCreation < 5000) { // 5-second rate limit (reduced from 10 seconds)
          console.log("Rate limited: Setup intent creation too frequent for client", clientId);
          return new Response(
            JSON.stringify({ 
              error: "Rate limited. Please wait before requesting another setup intent.",
              rateLimited: true,
              retryAfter: Math.ceil((lastCreation + 5000 - Date.now()) / 1000)
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 429
            }
          );
        }
      }
      
      // Get user email if available
      let userEmail = null;
      if (userId) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (!userError && userData && userData.user?.email) {
          userEmail = userData.user.email;
        }
      }
      
      // If we have a workspaceId, check if there's an existing customer ID
      let existingCustomerId = customerId || null;
      
      if (workspaceId && !existingCustomerId) {
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('stripe_customer_id')
          .eq('id', workspaceId)
          .maybeSingle();
        
        if (!workspaceError && workspaceData && workspaceData.stripe_customer_id) {
          existingCustomerId = workspaceData.stripe_customer_id;
          
          // Verify the customer still exists in Stripe
          try {
            const customer = await stripe.customers.retrieve(existingCustomerId);
            console.log("Found existing customer:", existingCustomerId);
            
            // Update customer metadata for auto recharge if it's a subscription
            if (isAutoTopupEnabled) {
              await stripe.customers.update(existingCustomerId, {
                metadata: {
                  autoRecharge: "true",
                  rechargeThreshold: "10",
                  rechargeAmount: tokenAmount.toString(),
                  workspaceId: workspaceId || undefined,
                  userId: userId || undefined
                }
              });
              console.log("Updated existing customer metadata for auto-recharge");
            }
          } catch (error) {
            console.error("Customer no longer exists in Stripe:", error);
            existingCustomerId = null;
          }
        }
      }
      
      // Create a setup intent with additional metadata
      const intentUniqueId = `intent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['card'],
        customer: existingCustomerId || undefined, // Attach to customer if one exists
        metadata: {
          tokenAmount: tokenAmount.toString(),
          unitPrice: unitPrice.toString(),
          paymentType,
          autoRecharge: "true",
          rechargeThreshold: "10",
          rechargeAmount: tokenAmount.toString(),
          workspaceId: workspaceId || undefined,
          userId: userId || undefined,
          userEmail: userEmail || undefined,
          createdAt: new Date().toISOString(), // Add creation timestamp
          forceRefresh: forceNewIntent ? "true" : "false", // Indicate if this was a forced refresh
          uniqueId: intentUniqueId // Add a unique ID to prevent collisions
        },
        // Set to off_session to allow future off-session payments
        usage: 'off_session',
        description: `Setup payment method for automatic recharge of ${tokenAmount} tokens`,
        expand: ['payment_method'], // Get full payment method data
      });
      
      // Update rate limiter (only if not forcing a new intent)
      if (!forceNewIntent) {
        rateLimiter.set(rateKey, Date.now());
      }
      
      console.log("Setup intent created successfully:", setupIntent.id, "Client Secret:", setupIntent.client_secret?.substring(0, 10) + "...");
      
      return new Response(
        JSON.stringify({
          clientSecret: setupIntent.client_secret,
          paymentType,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          id: setupIntent.id,
          customerId: existingCustomerId,
          timestamp: new Date().toISOString(), 
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
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        errorDetail: error.stack || 'No stack trace available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
