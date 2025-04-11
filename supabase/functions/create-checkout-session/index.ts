
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
  console.log(`[DEBUG-${now}] Cleaning rate limiter entries. Current count: ${rateLimiter.size}`);
  for (const [key, timestamp] of rateLimiter.entries()) {
    if (now - timestamp > 60000) { // Remove entries older than 1 minute
      console.log(`[DEBUG-${now}] Removing stale rate limiter entry: ${key}`);
      rateLimiter.delete(key);
    }
  }
}, 60000);

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const requestStart = Date.now();
  console.log(`[REQ-${requestId}] Request started at ${new Date(requestStart).toISOString()}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[REQ-${requestId}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log(`[REQ-${requestId}] Processing ${req.method} request to ${req.url}`);
    
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`[REQ-${requestId}] Request body parsed:`, JSON.stringify(requestBody));
    } catch (parseError) {
      console.error(`[REQ-${requestId}] Failed to parse request body:`, parseError);
      throw new Error(`Invalid request body: ${parseError.message}`);
    }
    
    const { paymentType, tokenAmount, paymentMethodId, customerId, forceNewIntent } = requestBody;
    
    console.log(`[REQ-${requestId}] Request parameters:`, {
      paymentType,
      tokenAmount,
      paymentMethodId: paymentMethodId ? `${paymentMethodId.substring(0, 5)}...` : undefined,
      customerId: customerId ? `${customerId.substring(0, 5)}...` : null,
      forceNewIntent
    });
    
    // Initialize Stripe with secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error(`[REQ-${requestId}] STRIPE_SECRET_KEY is missing`);
      throw new Error('STRIPE_SECRET_KEY is not configured in Edge Function secrets');
    } else {
      console.log(`[REQ-${requestId}] STRIPE_SECRET_KEY found (length: ${stripeSecretKey.length})`);
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[REQ-${requestId}] Supabase credentials missing:`, {
        urlMissing: !supabaseUrl,
        keyMissing: !supabaseServiceKey
      });
      throw new Error('Supabase credentials not configured in Edge Function secrets');
    } else {
      console.log(`[REQ-${requestId}] Supabase credentials found`);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`[REQ-${requestId}] Initializing Stripe API connection...`);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retries for network issues
    });
    
    // Extract user information from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      console.log(`[REQ-${requestId}] Authorization header found, getting user...`);
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.error(`[REQ-${requestId}] Error getting user from token:`, userError);
        } else if (userData && userData.user) {
          userId = userData.user.id;
          console.log(`[REQ-${requestId}] User authenticated: ${userId.substring(0, 8)}...`);
        }
      } catch (authError) {
        console.error(`[REQ-${requestId}] Auth error:`, authError);
      }
    } else {
      console.log(`[REQ-${requestId}] No authorization header found`);
    }
    
    // Get the user's workspace ID if they're logged in
    let workspaceId = null;
    if (userId) {
      try {
        console.log(`[REQ-${requestId}] Getting workspace for user ${userId.substring(0, 8)}...`);
        const { data: memberData, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (memberError) {
          console.error(`[REQ-${requestId}] Error getting workspace:`, memberError);
        } else if (memberData) {
          workspaceId = memberData.workspace_id;
          console.log(`[REQ-${requestId}] Found workspace ID: ${workspaceId}`);
        } else {
          console.log(`[REQ-${requestId}] No workspace found for user`);
        }
      } catch (workspaceError) {
        console.error(`[REQ-${requestId}] Workspace error:`, workspaceError);
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
    
    console.log(`[REQ-${requestId}] Price calculation: ${tokenAmount} tokens at ${unitPrice} PLN each = ${totalAmount} PLN total`);
    
    // Determine if auto-topup should be enabled
    const isAutoTopupEnabled = paymentType === 'subscription';
    console.log(`[REQ-${requestId}] Auto-topup enabled: ${isAutoTopupEnabled}`);
    
    // If we already have a paymentMethodId from a setup intent confirmation
    if (paymentMethodId && paymentType === 'subscription') {
      try {
        console.log(`[REQ-${requestId}] Processing subscription with payment method: ${paymentMethodId.substring(0, 5)}...`);
        
        // Find or create a customer to attach the payment method to
        let customer;
        let isNewCustomer = false;
        
        if (customerId) {
          console.log(`[REQ-${requestId}] Retrieving existing customer: ${customerId.substring(0, 5)}...`);
          try {
            customer = await stripe.customers.retrieve(customerId);
            console.log(`[REQ-${requestId}] Found existing customer: ${customer.id.substring(0, 5)}...`);
          } catch (customerError) {
            console.error(`[REQ-${requestId}] Error retrieving customer:`, customerError);
            console.log(`[REQ-${requestId}] Customer ID that failed: ${customerId}`);
            console.log(`[REQ-${requestId}] Will create new customer instead`);
            customer = null; // Reset to create new customer
          }
        } 
        
        if (!customerId || !customer) {
          // Get user email for new customer creation if available
          let userEmail = null;
          if (userId) {
            console.log(`[REQ-${requestId}] Getting user email for new customer...`);
            try {
              const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
              if (!userError && userData && userData.user?.email) {
                userEmail = userData.user.email;
                console.log(`[REQ-${requestId}] Found user email: ${userEmail}`);
              }
            } catch (emailError) {
              console.error(`[REQ-${requestId}] Error getting user email:`, emailError);
            }
          }
          
          // Create a new customer with the payment method and appropriate metadata for auto-recharge
          console.log(`[REQ-${requestId}] Creating new customer with payment method: ${paymentMethodId.substring(0, 5)}...`);
          try {
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
            console.log(`[REQ-${requestId}] Created new customer: ${customer.id}`);
          } catch (customerCreateError) {
            console.error(`[REQ-${requestId}] Error creating customer:`, customerCreateError);
            throw new Error(`Failed to create customer: ${customerCreateError.message}`);
          }
        } else {
          // If we're using an existing customer, we should update their metadata and default payment method
          console.log(`[REQ-${requestId}] Updating existing customer: ${customer.id}`);
          try {
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
            console.log(`[REQ-${requestId}] Updated existing customer metadata and default payment method`);
          } catch (customerUpdateError) {
            console.error(`[REQ-${requestId}] Error updating customer:`, customerUpdateError);
          }
        }
        
        // Verify the payment method exists before attempting to attach it
        try {
          console.log(`[REQ-${requestId}] Verifying payment method: ${paymentMethodId.substring(0, 5)}...`);
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
          console.log(`[REQ-${requestId}] Payment method exists: ${paymentMethod.id.substring(0, 5)}...`);
        } catch (pmError) {
          console.error(`[REQ-${requestId}] Error retrieving payment method:`, pmError);
          throw new Error(`Invalid payment method: ${paymentMethodId}`);
        }
        
        // Attach the payment method to the customer if not already
        try {
          console.log(`[REQ-${requestId}] Attaching payment method ${paymentMethodId.substring(0, 5)}... to customer ${customer.id.substring(0, 5)}...`);
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
          });
          console.log(`[REQ-${requestId}] Payment method attached successfully`);
          
          // Update the payment method with metadata for auto-recharge
          await stripe.paymentMethods.update(paymentMethodId, {
            metadata: {
              autoRecharge: "true",
              forOffSessionUsage: "true"
            }
          });
          console.log(`[REQ-${requestId}] Updated payment method metadata for off-session usage`);
          
        } catch (attachError) {
          console.log(`[REQ-${requestId}] Attach error:`, attachError);
          // Only continue if the error is because it's already attached
          if (!attachError.message?.includes("already been attached")) {
            console.error(`[REQ-${requestId}] Error attaching payment method:`, attachError);
            throw attachError;
          }
          console.log(`[REQ-${requestId}] Payment method already attached`);
          
          // Still update the payment method metadata
          try {
            await stripe.paymentMethods.update(paymentMethodId, {
              metadata: {
                autoRecharge: "true",
                forOffSessionUsage: "true"
              }
            });
            console.log(`[REQ-${requestId}] Updated payment method metadata for off-session usage`);
          } catch (updateError) {
            console.error(`[REQ-${requestId}] Error updating payment method:`, updateError);
          }
        }
        
        // Set as the default payment method
        try {
          console.log(`[REQ-${requestId}] Setting default payment method: ${paymentMethodId.substring(0, 5)}...`);
          await stripe.customers.update(customer.id, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
          console.log(`[REQ-${requestId}] Updated customer's default payment method`);
        } catch (defaultPmError) {
          console.error(`[REQ-${requestId}] Error setting default payment method:`, defaultPmError);
        }
        
        // Create a payment intent for the initial charge
        console.log(`[REQ-${requestId}] Creating payment intent for initial charge of ${totalAmount} PLN`);
        const paymentIntentData = {
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
            workspaceId: workspaceId || undefined,
            requestId: requestId
          },
          setup_future_usage: 'off_session', // Explicitly set this for future charges
          description: `Initial subscription charge for ${tokenAmount} tokens`,
        };
        
        console.log(`[REQ-${requestId}] Payment intent data:`, JSON.stringify(paymentIntentData));
        
        let paymentIntent;
        try {
          paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
          console.log(`[REQ-${requestId}] Initial subscription charge created: ${paymentIntent.id}, Status: ${paymentIntent.status}`);
        } catch (piError) {
          console.error(`[REQ-${requestId}] Payment intent creation error:`, piError);
          console.error(`[REQ-${requestId}] Error type: ${piError.type}`);
          console.error(`[REQ-${requestId}] Error code: ${piError.code}`);
          console.error(`[REQ-${requestId}] Error message: ${piError.message}`);
          throw piError;
        }
        
        // Update workspace table with Stripe customer ID and auto-topup setting
        if (workspaceId && (isNewCustomer || customerId !== customer.id)) {
          console.log(`[REQ-${requestId}] Updating workspace with Stripe data:`, {
            workspace_id: workspaceId,
            customer_id: customer.id,
            token_balance: tokenAmount,
            auto_topup: isAutoTopupEnabled
          });
          
          try {
            const { error: updateError } = await supabase
              .from('workspaces')
              .update({ 
                stripe_customer_id: customer.id,
                token_balance: tokenAmount,
                balance_auto_topup: isAutoTopupEnabled
              })
              .eq('id', workspaceId);
            
            if (updateError) {
              console.error(`[REQ-${requestId}] Error updating workspace:`, updateError);
            } else {
              console.log(`[REQ-${requestId}] Updated workspace with Stripe customer ID, token balance, and auto-topup setting`);
            }
          } catch (dbError) {
            console.error(`[REQ-${requestId}] Database error:`, dbError);
          }
        }
        
        console.log(`[REQ-${requestId}] Subscription flow completed successfully`);
        
        const responseData = {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          customerId: customer.id,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          setupForAutoRecharge: true
        };
        
        console.log(`[REQ-${requestId}] Response data:`, JSON.stringify(responseData));
        
        return new Response(
          JSON.stringify(responseData),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } catch (error) {
        console.error(`[REQ-${requestId}] Error creating initial subscription charge:`, error);
        
        // Handle specific Stripe errors that might need special responses
        if (error.type === 'StripeCardError') {
          console.log(`[REQ-${requestId}] Stripe card error:`, {
            message: error.message,
            code: error.code,
            decline_code: error.decline_code
          });
          
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
      console.log(`[REQ-${requestId}] Creating one-time payment intent for ${tokenAmount} tokens`);
      
      // Find existing Stripe customer ID for this workspace if available
      let stripeCustomerId = null;
      let userEmail = null;
      
      if (userId) {
        try {
          console.log(`[REQ-${requestId}] Getting user email...`);
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
          if (!userError && userData && userData.user?.email) {
            userEmail = userData.user.email;
            console.log(`[REQ-${requestId}] Found user email: ${userEmail}`);
          }
        } catch (emailError) {
          console.error(`[REQ-${requestId}] Error getting user email:`, emailError);
        }
      }
      
      if (workspaceId) {
        try {
          console.log(`[REQ-${requestId}] Looking for existing Stripe customer ID for workspace ${workspaceId}...`);
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspaces')
            .select('stripe_customer_id')
            .eq('id', workspaceId)
            .maybeSingle();
          
          if (!workspaceError && workspaceData && workspaceData.stripe_customer_id) {
            stripeCustomerId = workspaceData.stripe_customer_id;
            console.log(`[REQ-${requestId}] Found existing Stripe customer ID: ${stripeCustomerId}`);
            
            // Verify the customer still exists in Stripe
            try {
              console.log(`[REQ-${requestId}] Verifying customer exists in Stripe...`);
              await stripe.customers.retrieve(stripeCustomerId);
              console.log(`[REQ-${requestId}] Customer verified in Stripe`);
            } catch (customerError) {
              console.error(`[REQ-${requestId}] Customer no longer exists in Stripe:`, customerError);
              stripeCustomerId = null;
            }
          } else {
            console.log(`[REQ-${requestId}] No existing Stripe customer ID found for workspace`);
          }
        } catch (customerLookupError) {
          console.error(`[REQ-${requestId}] Error looking up customer:`, customerLookupError);
        }
      }
      
      // If no Stripe customer ID exists and we have a user ID, create one
      if (!stripeCustomerId && userEmail) {
        console.log(`[REQ-${requestId}] Creating new Stripe customer for user email: ${userEmail}`);
        
        try {
          const customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              userId: userId,
              workspaceId: workspaceId || undefined,
              autoRecharge: "false" // Explicitly mark as not auto-recharge
            }
          });
          
          stripeCustomerId = customer.id;
          console.log(`[REQ-${requestId}] Created new customer: ${stripeCustomerId}`);
          
          // Update workspace with new Stripe customer ID
          if (workspaceId) {
            try {
              console.log(`[REQ-${requestId}] Updating workspace with new customer ID...`);
              const { error: updateError } = await supabase
                .from('workspaces')
                .update({ 
                  stripe_customer_id: stripeCustomerId,
                  balance_auto_topup: false 
                })
                .eq('id', workspaceId);
              
              if (updateError) {
                console.error(`[REQ-${requestId}] Error updating workspace:`, updateError);
              } else {
                console.log(`[REQ-${requestId}] Updated workspace with new Stripe customer ID`);
              }
            } catch (updateError) {
              console.error(`[REQ-${requestId}] Error updating workspace:`, updateError);
            }
          }
        } catch (createCustomerError) {
          console.error(`[REQ-${requestId}] Error creating customer:`, createCustomerError);
        }
      }
      
      // Create a payment intent for one-time payments
      console.log(`[REQ-${requestId}] Creating payment intent data...`);
      
      const paymentIntentData = {
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
          createdAt: new Date().toISOString(), // Add creation timestamp
          requestId: requestId
        },
        description: `One-time purchase of ${tokenAmount} tokens`,
        // For one-time payments, explicitly set to null (not an empty string)
        setup_future_usage: null,
      };
      
      console.log(`[REQ-${requestId}] Payment intent data:`, JSON.stringify(paymentIntentData));
      
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
        console.log(`[REQ-${requestId}] Payment intent created successfully: ${paymentIntent.id}, Client Secret: ${paymentIntent.client_secret?.substring(0, 10)}...`);
      } catch (piError) {
        console.error(`[REQ-${requestId}] Error creating payment intent:`, piError);
        console.error(`[REQ-${requestId}] Error type: ${piError.type}, code: ${piError.code}`);
        console.error(`[REQ-${requestId}] Error message: ${piError.message}`);
        throw piError;
      }
      
      const responseData = {
        clientSecret: paymentIntent.client_secret,
        paymentType,
        amount: tokenAmount,
        unitPrice,
        totalPrice: totalAmount,
        id: paymentIntent.id,
        customerId: stripeCustomerId,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`[REQ-${requestId}] Response data (omitting client secret):`, {
        ...responseData,
        clientSecret: responseData.clientSecret ? `${responseData.clientSecret.substring(0, 10)}...` : null
      });
      
      return new Response(
        JSON.stringify(responseData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      console.log(`[REQ-${requestId}] Creating setup intent for subscription payments${forceNewIntent ? ' (forcing new intent)' : ''}`);
      
      // Apply rate limiting for setup intent creation
      // Create a unique key based on userId or a client identifier
      const clientId = userId || req.headers.get('X-Client-Info') || req.headers.get('User-Agent') || 'anonymous';
      const rateKey = `${clientId}:${paymentType}:${tokenAmount}`;
      
      const now = Date.now();
      console.log(`[REQ-${requestId}] Rate limit check for key: ${rateKey}`);
      
      // Check if we've created an intent for this user recently, unless we're forcing a new one
      if (!forceNewIntent) {
        const lastCreation = rateLimiter.get(rateKey);
        console.log(`[REQ-${requestId}] Last creation time: ${lastCreation ? new Date(lastCreation).toISOString() : 'none'}`);
        
        if (lastCreation && (now - lastCreation) < 5000) { // 5-second rate limit (reduced from 10 seconds)
          console.log(`[REQ-${requestId}] Rate limited: Setup intent creation too frequent for client ${clientId}`);
          const retryAfter = Math.ceil((lastCreation + 5000 - now) / 1000);
          console.log(`[REQ-${requestId}] Retry after: ${retryAfter} seconds`);
          
          return new Response(
            JSON.stringify({ 
              error: "Rate limited. Please wait before requesting another setup intent.",
              rateLimited: true,
              retryAfter
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 429
            }
          );
        }
      } else {
        console.log(`[REQ-${requestId}] Bypassing rate limit due to forceNewIntent=true`);
      }
      
      // Get user email if available
      let userEmail = null;
      if (userId) {
        try {
          console.log(`[REQ-${requestId}] Getting user email...`);
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
          if (!userError && userData && userData.user?.email) {
            userEmail = userData.user.email;
            console.log(`[REQ-${requestId}] Found user email: ${userEmail}`);
          }
        } catch (emailError) {
          console.error(`[REQ-${requestId}] Error getting user email:`, emailError);
        }
      }
      
      // If we have a workspaceId, check if there's an existing customer ID
      let existingCustomerId = customerId || null;
      
      if (workspaceId && !existingCustomerId) {
        try {
          console.log(`[REQ-${requestId}] Checking for existing Stripe customer ID for workspace ${workspaceId}...`);
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspaces')
            .select('stripe_customer_id')
            .eq('id', workspaceId)
            .maybeSingle();
          
          if (!workspaceError && workspaceData && workspaceData.stripe_customer_id) {
            existingCustomerId = workspaceData.stripe_customer_id;
            console.log(`[REQ-${requestId}] Found existing customer ID: ${existingCustomerId}`);
            
            // Verify the customer still exists in Stripe
            try {
              console.log(`[REQ-${requestId}] Verifying customer exists in Stripe...`);
              const customer = await stripe.customers.retrieve(existingCustomerId);
              console.log(`[REQ-${requestId}] Found existing customer: ${existingCustomerId}`);
              
              // Update customer metadata for auto recharge if it's a subscription
              if (isAutoTopupEnabled) {
                try {
                  console.log(`[REQ-${requestId}] Updating customer metadata for auto-recharge...`);
                  await stripe.customers.update(existingCustomerId, {
                    metadata: {
                      autoRecharge: "true",
                      rechargeThreshold: "10",
                      rechargeAmount: tokenAmount.toString(),
                      workspaceId: workspaceId || undefined,
                      userId: userId || undefined
                    }
                  });
                  console.log(`[REQ-${requestId}] Updated existing customer metadata for auto-recharge`);
                } catch (updateError) {
                  console.error(`[REQ-${requestId}] Error updating customer metadata:`, updateError);
                }
              }
            } catch (error) {
              console.error(`[REQ-${requestId}] Customer no longer exists in Stripe:`, error);
              existingCustomerId = null;
            }
          } else {
            console.log(`[REQ-${requestId}] No existing Stripe customer ID found for workspace`);
          }
        } catch (lookupError) {
          console.error(`[REQ-${requestId}] Error looking up customer:`, lookupError);
        }
      }
      
      // Create a setup intent with additional metadata
      const intentUniqueId = `intent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      console.log(`[REQ-${requestId}] Creating setup intent with unique ID: ${intentUniqueId}`);
      
      const setupIntentData = {
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
          uniqueId: intentUniqueId, // Add a unique ID to prevent collisions
          requestId: requestId
        },
        // Set to off_session to allow future off-session payments
        usage: 'off_session',
        description: `Setup payment method for automatic recharge of ${tokenAmount} tokens`,
        expand: ['payment_method'], // Get full payment method data
      };
      
      console.log(`[REQ-${requestId}] Setup intent data:`, JSON.stringify(setupIntentData));
      
      let setupIntent;
      try {
        setupIntent = await stripe.setupIntents.create(setupIntentData);
        console.log(`[REQ-${requestId}] Setup intent created successfully: ${setupIntent.id}, Client Secret: ${setupIntent.client_secret?.substring(0, 10)}...`);
      } catch (siError) {
        console.error(`[REQ-${requestId}] Error creating setup intent:`, siError);
        console.error(`[REQ-${requestId}] Error type: ${siError.type}, code: ${siError.code}`);
        console.error(`[REQ-${requestId}] Error message: ${siError.message}`);
        throw siError;
      }
      
      // Update rate limiter (only if not forcing a new intent)
      if (!forceNewIntent) {
        rateLimiter.set(rateKey, now);
        console.log(`[REQ-${requestId}] Rate limiter updated for key: ${rateKey}`);
      }
      
      const responseData = {
        clientSecret: setupIntent.client_secret,
        paymentType,
        amount: tokenAmount,
        unitPrice,
        totalPrice: totalAmount,
        id: setupIntent.id,
        customerId: existingCustomerId,
        timestamp: new Date().toISOString(), 
      };
      
      console.log(`[REQ-${requestId}] Response data (omitting client secret):`, {
        ...responseData,
        clientSecret: responseData.clientSecret ? `${responseData.clientSecret.substring(0, 10)}...` : null
      });
      
      return new Response(
        JSON.stringify(responseData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error(`[REQ-${requestId}] Unhandled error:`, error);
    console.error(`[REQ-${requestId}] Error stack:`, error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        errorDetail: error.stack || 'No stack trace available',
        requestId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  } finally {
    const requestEnd = Date.now();
    console.log(`[REQ-${requestId}] Request completed in ${requestEnd - requestStart}ms`);
  }
});

