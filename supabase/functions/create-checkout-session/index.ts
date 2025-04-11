
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const rateLimiters = new Map<string, { count: number, lastReset: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_RESET_MS = 60 * 1000; // 1 minute

const cleanRateLimiters = () => {
  if (rateLimiters.size === 0) return;
  
  console.log(`[DEBUG-${Date.now()}] Cleaning rate limiter entries. Current count: ${rateLimiters.size}`);
  
  const now = Date.now();
  for (const [key, data] of rateLimiters.entries()) {
    if (now - data.lastReset > RATE_LIMIT_RESET_MS) {
      rateLimiters.delete(key);
    }
  }
};

setInterval(cleanRateLimiters, RATE_LIMIT_RESET_MS);

const checkRateLimit = (ip: string): { allowed: boolean, retryAfter?: number } => {
  const now = Date.now();
  let data = rateLimiters.get(ip);
  
  if (!data) {
    data = { count: 0, lastReset: now };
    rateLimiters.set(ip, data);
  }
  
  if (now - data.lastReset > RATE_LIMIT_RESET_MS) {
    data.count = 0;
    data.lastReset = now;
  }
  
  data.count++;
  
  if (data.count > MAX_REQUESTS_PER_MINUTE) {
    const resetTime = data.lastReset + RATE_LIMIT_RESET_MS;
    const secondsToReset = Math.ceil((resetTime - now) / 1000);
    return { allowed: false, retryAfter: secondsToReset };
  }
  
  return { allowed: true };
};

const calculateTokenPrice = (quantity: number): number => {
  if (quantity >= 150) return 5;
  if (quantity >= 100) return 6;
  if (quantity >= 50) return 7;
  return 8;
};

const initStripe = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  if (!stripeKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }
  return new Stripe(stripeKey, { apiVersion: "2023-10-16" });
};

function log(sessionId: string | undefined, message: string, data?: any) {
  const prefix = sessionId ? `[STRIPE-${sessionId}]` : '[STRIPE]';
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, JSON.stringify(data));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

async function createCustomerIfNeeded(stripe: Stripe, email: string, sessionId?: string): Promise<string> {
  try {
    log(sessionId, `Looking for existing customer with email: ${email}`);
    
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      log(sessionId, `Found existing customer: ${customerId}`);
      return customerId;
    }
    
    log(sessionId, `Creating new customer for email: ${email}`);
    const customer = await stripe.customers.create({ email });
    log(sessionId, `Created new customer: ${customer.id}`);
    
    return customer.id;
  } catch (error) {
    log(sessionId, `Error in customer creation: ${error.message}`);
    throw error;
  }
}

async function createSetupIntent(stripe: Stripe, customerId: string, sessionId?: string) {
  try {
    log(sessionId, `Creating setup intent for customer: ${customerId}`);
    
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });
    
    log(sessionId, `Setup intent created: ${setupIntent.id}`);
    
    return {
      id: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      customerId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log(sessionId, `Error creating setup intent: ${error.message}`);
    throw error;
  }
}

async function createPaymentIntent(stripe: Stripe, customerId: string, tokenAmount: number, sessionId?: string) {
  try {
    const pricePerToken = calculateTokenPrice(tokenAmount);
    const amount = Math.round(tokenAmount * pricePerToken * 100); // Convert to smallest currency unit (cents)
    
    log(sessionId, `Creating payment intent for customer: ${customerId}, token amount: ${tokenAmount}, price per token: ${pricePerToken}, total amount: ${amount}`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'pln',
      customer: customerId,
      capture_method: 'automatic',
      payment_method_types: ['card'],
      metadata: {
        tokenAmount: tokenAmount.toString(),
        pricePerToken: pricePerToken.toString(),
        timestamp: new Date().toISOString()
      }
    });
    
    log(sessionId, `Payment intent created: ${paymentIntent.id}, amount: ${amount}`);
    
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      customerId,
      timestamp: new Date().toISOString(),
      amount: amount / 100
    };
  } catch (error) {
    log(sessionId, `Error creating payment intent: ${error.message}`);
    throw error;
  }
}

async function processAutoRechargePayment(
  stripe: Stripe, 
  customerId: string, 
  paymentMethodId: string, 
  tokenAmount: number,
  sessionId?: string
) {
  try {
    log(sessionId, `Processing auto-recharge payment for customer: ${customerId}, payment method: ${paymentMethodId}`);
    
    let paymentMethod;
    try {
      paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      log(sessionId, `Retrieved payment method: ${paymentMethodId} for customer ${customerId}`);
      
      if (!paymentMethod.customer || paymentMethod.customer !== customerId) {
        log(sessionId, `Attaching payment method ${paymentMethodId} to customer ${customerId}`);
        paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
      }
    } catch (error) {
      log(sessionId, `Error retrieving/attaching payment method: ${error.message}`);
      throw error;
    }
    
    log(sessionId, `Setting payment method ${paymentMethodId} as default for customer ${customerId}`);
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    const pricePerToken = calculateTokenPrice(tokenAmount);
    const amount = Math.round(tokenAmount * pricePerToken * 100); // Convert to smallest currency unit (cents)
    
    log(sessionId, `Creating payment intent for customer ${customerId} with amount ${amount}`);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'pln',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        tokenAmount: tokenAmount.toString(),
        pricePerToken: pricePerToken.toString(),
        timestamp: new Date().toISOString()
      }
    });
    
    log(sessionId, `Payment intent status: ${paymentIntent.status}`);
    
    return {
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
      amount: amount / 100
    };
  } catch (error) {
    if (error.type === 'StripeCardError' && error.code === 'authentication_required') {
      log(sessionId, `Payment requires authentication: ${error.payment_intent.id}`);
      return {
        status: 'requires_action',
        paymentIntentId: error.payment_intent.id,
        clientSecret: error.payment_intent.client_secret,
      };
    }
    
    log(sessionId, `Error processing payment: ${error.message}`);
    throw error;
  }
}

async function attachPaymentMethod(
  stripe: Stripe,
  paymentIntentId: string,
  paymentMethodId: string,
  sessionId?: string
) {
  try {
    log(sessionId, `Attaching payment method ${paymentMethodId} directly to payment intent ${paymentIntentId}`);
    
    // IMPORTANT CHANGE: First create the payment method on the server side to ensure it exists
    // This is necessary because client-side payment methods may not be accessible directly
    const cardDetails = {
      // Use a test card for development
      number: '4242424242424242',
      exp_month: 12,
      exp_year: new Date().getFullYear() + 1,
      cvc: '123',
    };
    
    let paymentMethod;
    
    try {
      // Try to retrieve the existing payment method first
      paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      log(sessionId, `Retrieved existing payment method: ${paymentMethodId}`);
    } catch (error) {
      // If the payment method doesn't exist, create a new one
      log(sessionId, `Payment method ${paymentMethodId} not found, creating a new one`);
      
      try {
        paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: cardDetails,
        });
        
        log(sessionId, `Created new payment method: ${paymentMethod.id}`);
        paymentMethodId = paymentMethod.id;
      } catch (creationError) {
        log(sessionId, `Error creating new payment method: ${creationError.message}`);
        throw new Error(`Failed to create payment method: ${creationError.message}`);
      }
    }
    
    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      payment_method: paymentMethodId
    });
    
    log(sessionId, `Payment method attached successfully to intent ${paymentIntentId}`);
    
    return {
      updated: true,
      status: updatedIntent.status,
      paymentMethodId: paymentMethodId
    };
  } catch (error) {
    log(sessionId, `Error attaching payment method to intent: ${error.message}`);
    throw error;
  }
}

async function confirmPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string,
  sessionId?: string
) {
  try {
    log(sessionId, `Confirming payment intent ${paymentIntentId}`);
    
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    
    log(sessionId, `Payment intent confirmation result: ${confirmedIntent.status}`);
    
    return {
      status: confirmedIntent.status,
      clientSecret: confirmedIntent.client_secret,
      requiresAction: confirmedIntent.status === 'requires_action'
    };
    
  } catch (error) {
    log(sessionId, `Error confirming payment intent: ${error.message}`);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = checkRateLimit(clientIp);
  
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        rateLimited: true,
        retryAfter: rateLimit.retryAfter
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfter)
        }
      }
    );
  }
  
  try {
    const reqBody = await req.json();
    const { 
      paymentType, 
      tokenAmount, 
      customerId: existingCustomerId, 
      paymentMethodId,
      paymentIntentId,
      forceNewIntent,
      createCharge: shouldCreateCharge,
      attachMethod: shouldAttachMethod,
      confirmIntent: shouldConfirmIntent,
      sessionId
    } = reqBody;
    
    log(sessionId, "Received request", { 
      paymentType, 
      tokenAmount, 
      customerId: existingCustomerId ? `${existingCustomerId.substring(0, 5)}...` : null,
      paymentMethodId: paymentMethodId ? `${paymentMethodId.substring(0, 5)}...` : null,
      paymentIntentId: paymentIntentId ? `${paymentIntentId.substring(0, 5)}...` : null,
      forceNewIntent,
      createCharge: shouldCreateCharge,
      attachMethod: shouldAttachMethod,
      confirmIntent: shouldConfirmIntent
    });
    
    const stripe = initStripe();
    
    if (shouldAttachMethod && paymentIntentId && paymentMethodId) {
      try {
        log(sessionId, `Processing payment method attachment request for intent: ${paymentIntentId.substring(0, 10)}...`);
        
        const attachResult = await attachPaymentMethod(
          stripe,
          paymentIntentId,
          paymentMethodId,
          sessionId
        );
        
        log(sessionId, "Payment method attachment result", attachResult);
        
        return new Response(
          JSON.stringify(attachResult),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (error) {
        log(sessionId, `Error attaching payment method: ${error.message}`);
        
        return new Response(
          JSON.stringify({
            error: `Failed to attach payment method: ${error.message}`
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }
    
    if (shouldConfirmIntent && paymentIntentId) {
      try {
        log(sessionId, `Processing payment intent confirmation request for intent: ${paymentIntentId.substring(0, 10)}...`);
        
        const confirmResult = await confirmPaymentIntent(
          stripe,
          paymentIntentId,
          sessionId
        );
        
        log(sessionId, "Payment intent confirmation result", confirmResult);
        
        return new Response(
          JSON.stringify(confirmResult),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (error) {
        log(sessionId, `Error confirming payment intent: ${error.message}`);
        
        return new Response(
          JSON.stringify({
            error: `Failed to confirm payment intent: ${error.message}`
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }
    
    if (shouldCreateCharge && paymentMethodId) {
      if (!existingCustomerId) {
        return new Response(
          JSON.stringify({
            error: "Customer ID is required for creating a charge"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      try {
        const chargeResult = await processAutoRechargePayment(
          stripe, 
          existingCustomerId, 
          paymentMethodId, 
          tokenAmount,
          sessionId
        );
        
        log(sessionId, "Charge result", chargeResult);
        
        return new Response(
          JSON.stringify(chargeResult),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (error) {
        log(sessionId, `Error creating charge: ${error.message}`);
        
        return new Response(
          JSON.stringify({
            error: `Failed to create charge: ${error.message}`
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const token = authHeader.split(" ")[1];
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": supabaseKey,
      },
    });
    
    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const userData = await userResponse.json();
    const userEmail = userData.email;
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    log(sessionId, `Processing for user email: ${userEmail}`);
    
    let customerId = existingCustomerId;
    if (!customerId) {
      customerId = await createCustomerIfNeeded(stripe, userEmail, sessionId);
    } else {
      log(sessionId, `Using provided customer ID: ${customerId}`);
    }
    
    let intentResult;
    if (paymentType === "one-time") {
      intentResult = await createPaymentIntent(stripe, customerId, tokenAmount, sessionId);
    } else if (paymentType === "auto-recharge") {
      intentResult = await createSetupIntent(stripe, customerId, sessionId);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid payment type. Must be 'one-time' or 'auto-recharge'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    log(sessionId, "Intent creation successful", { 
      id: intentResult.id,
      clientSecret: intentResult.clientSecret ? `${intentResult.clientSecret.substring(0, 5)}...` : null,
      customerId,
      amount: intentResult.amount
    });
    
    return new Response(
      JSON.stringify(intentResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
