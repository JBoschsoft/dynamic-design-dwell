
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting create-workspace function");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Get the user from the auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("User error:", userError);
      throw new Error("Invalid user token");
    }

    console.log("User authenticated:", user.id);

    // Parse the request body
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData));
    
    const { companyName, industry, companySize, phoneNumber, countryCode } = requestData as CreateWorkspaceRequest;

    // Create a connection using the service role key (needed for writing to profiles table)
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Start a transaction by first creating workspace
    console.log("Creating workspace");
    const { data: workspaceData, error: workspaceError } = await serviceRoleClient
      .from("workspaces")
      .insert({
        name: companyName,
        industry,
        company_size: companySize,
      })
      .select()
      .single();

    if (workspaceError || !workspaceData) {
      console.error("Workspace creation error:", workspaceError);
      throw new Error(`Error creating workspace: ${workspaceError?.message || "Unknown error"}`);
    }

    console.log("Workspace created:", workspaceData.id);

    // Create profile record
    console.log("Creating profile for user:", user.id);
    const { error: profileError } = await serviceRoleClient
      .from("profiles")
      .insert({
        id: user.id,
        phone_number: phoneNumber,
        country_code: countryCode,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error(`Error creating profile: ${profileError.message}`);
    }

    console.log("Profile created successfully");

    // Create workspace member record with super_admin role
    console.log("Creating workspace member with super_admin role");
    const { error: memberError } = await serviceRoleClient
      .from("workspace_members")
      .insert({
        workspace_id: workspaceData.id,
        user_id: user.id,
        role: "super_admin",
      });

    if (memberError) {
      console.error("Workspace member creation error:", memberError);
      throw new Error(`Error creating workspace member: ${memberError.message}`);
    }

    console.log("Workspace member created successfully");

    // Return the workspace id
    return new Response(
      JSON.stringify({ 
        success: true, 
        workspaceId: workspaceData.id,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-workspace function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
