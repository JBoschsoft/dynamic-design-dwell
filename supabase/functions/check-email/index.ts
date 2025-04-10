
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckEmailRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting check-email function");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Get the request body
    const requestData = await req.json();
    const { email } = requestData as CheckEmailRequest;
    console.log("Checking email:", email);

    if (!email) {
      throw new Error("Email is required");
    }

    // Check if email already exists using secure function
    const { data: exists, error } = await supabaseClient.rpc(
      'check_email_exists',
      { email_to_check: email }
    );

    if (error) {
      console.error("Error checking email:", error);
      throw new Error(`Error checking email: ${error.message}`);
    }

    console.log("Email exists:", exists);

    return new Response(
      JSON.stringify({ 
        exists: Boolean(exists),
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in check-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
