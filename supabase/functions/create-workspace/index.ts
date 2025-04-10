
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateWorkspaceRequest = {
  companyName: string;
  industry: string;
  companySize: string;
  phoneNumber: string;
  countryCode: string;
};

serve(async (req) => {
  console.log("🚀 Starting create-workspace function");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("→ Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request information
    console.log(`→ Request method: ${req.method}`);
    console.log(`→ Request headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
    
    // Check for required environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ Missing required environment variables:", {
        url: !!supabaseUrl,
        serviceKey: !!supabaseServiceRoleKey
      });
      throw new Error("Server configuration error: Missing environment variables");
    }
    
    console.log("✓ Environment variables verified");
    
    // Create a Supabase client with the service role key
    const serviceRoleClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("→ Request data:", JSON.stringify(requestData));
    } catch (e) {
      console.error("❌ Error parsing request JSON:", e);
      throw new Error("Invalid request format: could not parse JSON body");
    }
    
    const { companyName, industry, companySize, phoneNumber, countryCode } = requestData as CreateWorkspaceRequest;
    
    // Validate required fields
    if (!companyName || !industry || !companySize || !phoneNumber || !countryCode) {
      console.error("❌ Missing required fields:", { 
        companyName: !!companyName, 
        industry: !!industry, 
        companySize: !!companySize,
        phoneNumber: !!phoneNumber,
        countryCode: !!countryCode
      });
      throw new Error("Missing required fields in request");
    }

    console.log("✓ Request data validated");

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    console.log("→ Auth header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ Missing Authorization header");
      throw new Error("Authorization header is required");
    }

    // Get the user from the auth header
    const token = authHeader.replace("Bearer ", "");
    console.log("→ Attempting to get user with token");
    
    const { data: userData, error: userError } = await serviceRoleClient.auth.getUser(token);

    if (userError) {
      console.error("❌ User authentication error:", userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }

    if (!userData?.user) {
      console.error("❌ No user found with provided token");
      throw new Error("Authentication failed: Invalid token");
    }

    const user = userData.user;
    console.log("✓ User authenticated:", user.id);
    console.log("→ Creating workspace using database function");
    
    // Use the database function to create workspace, profile, and member in a transaction
    const { data: workspaceData, error: workspaceError } = await serviceRoleClient.rpc(
      'create_workspace_with_admin',
      {
        workspace_name: companyName,
        workspace_industry: industry,
        workspace_company_size: companySize,
        user_phone_number: phoneNumber,
        user_country_code: countryCode
      }
    );

    if (workspaceError) {
      console.error("❌ Workspace creation error:", workspaceError);
      throw new Error(`Error creating workspace: ${workspaceError.message}`);
    }

    console.log("✓ Workspace created:", workspaceData);

    // After workspace creation, update the user's profile with the role
    const { error: profileUpdateError } = await serviceRoleClient
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', user.id);
    
    if (profileUpdateError) {
      console.error("⚠️ Profile update error:", profileUpdateError);
      console.warn("Failed to update user role, but workspace was created");
    } else {
      console.log("✓ User profile updated with super_admin role");
    }

    // Return the workspace id
    return new Response(
      JSON.stringify({ 
        success: true, 
        workspaceId: workspaceData,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in create-workspace function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
