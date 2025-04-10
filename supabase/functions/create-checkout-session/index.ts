
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

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
    // Parse the request body
    const { paymentType, tokenAmount, paymentMethodId, customerId } = await req.json();
    
    console.log("Received request with:", { paymentType, tokenAmount, paymentMethodId, customerId });
    
    // Initialize Stripe with secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in Edge Function secrets');
    }
    
    console.log("Initializing Stripe API connection...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 3, // Add retries for network issues
    });
    
    // Calculate token price based on quantity (implement discounts)
    const getTokenPrice = (amount: number): number => {
      if (amount >= 150) return 5;
      if (amount >= 100) return 6;
      if (amount >= 50) return 7;
      return 8;
    };
    
    const unitPrice = getTokenPrice(tokenAmount);
    const totalAmount = unitPrice * tokenAmount;
    
    // If we already have a paymentMethodId from a setup intent confirmation
    if (paymentMethodId && paymentType === 'subscription') {
      try {
        console.log("Processing subscription with payment method:", paymentMethodId);
        
        // Find or create a customer to attach the payment method to
        let customer;
        if (customerId) {
          console.log("Retrieving existing customer:", customerId);
          customer = await stripe.customers.retrieve(customerId);
        } else {
          // Create a new customer with the payment method
          console.log("Creating new customer with payment method:", paymentMethodId);
          customer = await stripe.customers.create({
            payment_method: paymentMethodId,
            metadata: {
              autoRecharge: "true",
              rechargeThreshold: "10",
              rechargeAmount: tokenAmount.toString()
            }
          });
        }
        
        // Attach the payment method to the customer if not already
        try {
          console.log("Attaching payment method to customer");
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
          });
        } catch (error) {
          console.log("Payment method already attached or error:", error);
          // Continue if the error is because it's already attached
        }
        
        // Set as the default payment method
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        
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
            autoRecharge: "true"
          },
        });
        
        console.log("Initial subscription charge created:", paymentIntent.id);
        
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
        throw error;
      }
    }
    
    // Create a payment intent or setup intent based on payment type
    if (paymentType === 'one-time') {
      console.log("Creating one-time payment intent for", tokenAmount, "tokens");
      // Create a payment intent for one-time payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // amount in cents
        currency: 'pln',
        payment_method_types: ['card'],
        metadata: {
          tokenAmount: tokenAmount.toString(),
          unitPrice: unitPrice.toString(),
          paymentType,
          autoRecharge: "false"
        }
      });
      
      console.log("Payment intent created successfully:", paymentIntent.id);
      
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentType,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          id: paymentIntent.id  // Include the ID for reference
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      console.log("Creating setup intent for subscription payments");
      // Create a setup intent for subscription payments to securely collect card details
      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['card'],
        metadata: {
          tokenAmount: tokenAmount.toString(),
          unitPrice: unitPrice.toString(),
          paymentType,
          autoRecharge: "true",
          rechargeThreshold: "10",
          rechargeAmount: tokenAmount.toString()
        },
        // Set to off_session to allow future off-session payments
        usage: 'off_session',
      });
      
      console.log("Setup intent created successfully:", setupIntent.id);
      
      return new Response(
        JSON.stringify({
          clientSecret: setupIntent.client_secret,
          paymentType,
          amount: tokenAmount,
          unitPrice,
          totalPrice: totalAmount,
          id: setupIntent.id  // Include the ID for reference
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
