
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
  phone?: string;
  customerId?: string;
  sessionId?: string;
  timestamp?: number;
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
    const { paymentType, tokenAmount, email, phone, customerId, sessionId } = await req.json() as CheckoutRequest;
    
    console.log("Processing request:", { 
      paymentType, 
      tokenAmount, 
      email: email ? "provided" : "not provided", 
      phone: phone ? "provided" : "not provided",
      customerId: customerId ? `${customerId.slice(0, 5)}...` : "not provided", 
      sessionId 
    });

    // Create or retrieve a customer
    let customerData: Stripe.Customer | null = null;
    
    if (customerId) {
      try {
        customerData = await stripe.customers.retrieve(customerId) as Stripe.Customer;
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
        const customerParams: Stripe.CustomerCreateParams = { email };
        if (phone) customerParams.phone = phone;
        
        customerData = await stripe.customers.create(customerParams);
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
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "pln",
      customer: customerData?.id,
      metadata: {
        paymentType,
        tokenAmount: tokenAmount.toString(),
        sessionId: sessionId || "unknown"
      },
      automatic_payment_methods: {
        enabled: true,
      },
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
