
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  paymentType: "one-time" | "auto-recharge";
  tokenAmount: number;
  email?: string;
  customerId?: string;
  sessionId?: string;
  timestamp?: number;
  checkStatus?: boolean;
  paymentIntentId?: string;
  attachMethod?: boolean;
  confirmIntent?: boolean;
  createCharge?: boolean;
  paymentMethodId?: string;
}

serve(async (req) => {
  console.log("Request received:", new Date().toISOString());
  
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize Stripe with the secret key from environment
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Parse request body
    const requestData = await req.json() as CheckoutRequest;
    
    // Handle payment status check if requested
    if (requestData.checkStatus && requestData.paymentIntentId) {
      console.log(`Checking payment status for intent: ${requestData.paymentIntentId.substring(0, 10)}...`);
      
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(requestData.paymentIntentId);
        
        console.log(`Payment status: ${paymentIntent.status} for intent: ${paymentIntent.id.substring(0, 10)}...`);
        
        return new Response(JSON.stringify({
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          customerId: paymentIntent.customer,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error retrieving payment intent:", error);
        return new Response(JSON.stringify({ error: error.message || "Error retrieving payment intent" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }
    
    // Handle payment method attachment if requested
    if (requestData.attachMethod && requestData.paymentMethodId && requestData.paymentIntentId) {
      console.log(`Attaching payment method ${requestData.paymentMethodId.substring(0, 5)}... to payment intent ${requestData.paymentIntentId.substring(0, 5)}...`);
      
      try {
        const paymentIntent = await stripe.paymentIntents.update(requestData.paymentIntentId, {
          payment_method: requestData.paymentMethodId,
        });
        
        return new Response(JSON.stringify({
          updated: true,
          status: paymentIntent.status,
          paymentMethodId: requestData.paymentMethodId
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error attaching payment method:", error);
        return new Response(JSON.stringify({ error: error.message || "Error attaching payment method" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }
    
    // Handle payment intent confirmation if requested
    if (requestData.confirmIntent && requestData.paymentIntentId) {
      console.log(`Confirming payment intent: ${requestData.paymentIntentId.substring(0, 10)}...`);
      
      try {
        const paymentIntent = await stripe.paymentIntents.confirm(requestData.paymentIntentId);
        
        return new Response(JSON.stringify({
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret,
          requiresAction: paymentIntent.status === 'requires_action',
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error confirming payment intent:", error);
        return new Response(JSON.stringify({ error: error.message || "Error confirming payment intent" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }
    
    // Handle creating a charge for auto-recharge if requested
    if (requestData.createCharge && requestData.paymentMethodId && requestData.tokenAmount) {
      console.log(`Creating charge for ${requestData.tokenAmount} tokens with payment method: ${requestData.paymentMethodId.substring(0, 5)}...`);
      
      // Calculate amount
      let unitPrice = 8; // Default price per token in PLN
      if (requestData.tokenAmount >= 50 && requestData.tokenAmount < 100) {
        unitPrice = 7;
      } else if (requestData.tokenAmount >= 100 && requestData.tokenAmount < 150) {
        unitPrice = 6;
      } else if (requestData.tokenAmount >= 150) {
        unitPrice = 5;
      }
      const totalAmount = requestData.tokenAmount * unitPrice * 100; // Convert to cents
      
      try {
        // Create a PaymentIntent that will be charged immediately
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: "pln",
          customer: requestData.customerId,
          payment_method: requestData.paymentMethodId,
          payment_method_types: ['card', 'p24'], // Limit to only card and p24
          off_session: true,
          confirm: true,
          metadata: {
            tokenAmount: requestData.tokenAmount.toString(),
            paymentType: "auto-recharge",
            sessionId: requestData.sessionId || "unknown"
          }
        });
        
        console.log(`Created and confirmed payment intent: ${paymentIntent.id}, status: ${paymentIntent.status}`);
        
        return new Response(JSON.stringify({
          status: paymentIntent.status,
          id: paymentIntent.id,
          amount: requestData.tokenAmount
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Error creating charge:", error);
        return new Response(JSON.stringify({ error: error.message || "Error creating charge" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Standard payment intent creation flow
    const { paymentType, tokenAmount, email, sessionId } = requestData;
    
    console.log("Processing request:", { 
      paymentType, 
      tokenAmount, 
      email: email ? "provided" : "not provided",
      customerId: requestData.customerId ? `${requestData.customerId.slice(0, 5)}...` : "not provided", 
      sessionId 
    });

    // Create or retrieve a customer
    let customerData = null;
    
    if (requestData.customerId) {
      try {
        customerData = await stripe.customers.retrieve(requestData.customerId);
        console.log("Retrieved existing customer:", customerData.id);
      } catch (error) {
        console.error("Error retrieving customer:", error);
        // Continue without customer ID, will create new or search by email
      }
    }
    
    // If no customer found by ID but email is provided, try to find by email
    if (!customerData && email) {
      const existingCustomers = await stripe.customers.list({ email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        customerData = existingCustomers.data[0];
        console.log("Found customer by email:", customerData.id);
      } else if (email) {
        // Create a new customer if email is provided
        customerData = await stripe.customers.create({ email });
        console.log("Created new customer:", customerData.id);
      }
    }

    // Calculate amount in cents (PLN)
    let unitPrice = 8; // Default price per token in PLN
    
    if (tokenAmount >= 50 && tokenAmount < 100) {
      unitPrice = 7;
    } else if (tokenAmount >= 100 && tokenAmount < 150) {
      unitPrice = 6;
    } else if (tokenAmount >= 150) {
      unitPrice = 5;
    }
    
    const totalAmount = tokenAmount * unitPrice * 100; // Convert to cents
    
    // Create payment intent with limited payment method types
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "pln",
      customer: customerData?.id,
      payment_method_types: ['card', 'p24'], // Limit to only card and p24
      metadata: {
        paymentType,
        tokenAmount: tokenAmount.toString(),
        sessionId: sessionId || "unknown"
      },
      automatic_payment_methods: null, // Disable automatic payment methods
    });
    
    console.log("Created payment intent:", { 
      id: paymentIntent.id, 
      amount: paymentIntent.amount,
      customer: customerData?.id ? `${customerData.id.slice(0, 5)}...` : "none"
    });

    // Return the client secret to the client
    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customerData?.id,
        amount: tokenAmount
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
