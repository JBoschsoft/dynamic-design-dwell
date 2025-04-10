
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type UpdateWorkspacePaymentRequest = {
  workspaceId: string;
  stripeCustomerId: string;
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
    const { workspaceId, stripeCustomerId } = await req.json() as UpdateWorkspacePaymentRequest;

    // Verify the user is an admin of the workspace
    const { data: memberData, error: memberError } = await supabaseClient
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !memberData) {
      throw new Error("Unauthorized to update this workspace");
    }

    if (!["super_admin", "administrator"].includes(memberData.role)) {
      throw new Error("Only admins can update payment information");
    }

    // Update the workspace with stripe customer id
    const { error: updateError } = await supabaseClient
      .from("workspaces")
      .update({
        stripe_customer_id: stripeCustomerId,
      })
      .eq("id", workspaceId);

    if (updateError) {
      throw new Error(`Error updating workspace: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-workspace-payment function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
