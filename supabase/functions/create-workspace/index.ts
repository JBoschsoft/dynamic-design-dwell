
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
      throw new Error("Invalid user token");
    }

    // Parse the request body
    const { companyName, industry, companySize, phoneNumber, countryCode } = await req.json() as CreateWorkspaceRequest;

    // Create a connection using the service role key (needed for writing to profiles table)
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Start a transaction
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
      throw new Error(`Error creating workspace: ${workspaceError?.message || "Unknown error"}`);
    }

    // Create profile record
    const { error: profileError } = await serviceRoleClient
      .from("profiles")
      .insert({
        id: user.id,
        phone_number: phoneNumber,
        country_code: countryCode,
      });

    if (profileError) {
      throw new Error(`Error creating profile: ${profileError.message}`);
    }

    // Create workspace member record with super_admin role
    const { error: memberError } = await serviceRoleClient
      .from("workspace_members")
      .insert({
        workspace_id: workspaceData.id,
        user_id: user.id,
        role: "super_admin",
      });

    if (memberError) {
      throw new Error(`Error creating workspace member: ${memberError.message}`);
    }

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
