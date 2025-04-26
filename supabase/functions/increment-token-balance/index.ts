
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  // Create Supabase client using anon key for user authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  
  try {
    // Get auth header and authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }
    
    const userId = userData.user.id;
    
    // Parse request body
    const { amount, paymentType = 'one-time' } = await req.json();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Invalid token amount");
    }
    
    const tokenAmount = Number(amount);
    console.log(`Incrementing token balance by ${tokenAmount} for user: ${userId}`);
    
    // Create a Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Find user's workspace
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .single();
    
    if (memberError || !memberData?.workspace_id) {
      throw new Error("Failed to find user's workspace");
    }
    
    const workspaceId = memberData.workspace_id;
    
    // Get current balance
    const { data: workspaceData, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .select("token_balance")
      .eq("id", workspaceId)
      .single();
    
    if (workspaceError) {
      throw new Error("Failed to retrieve workspace data");
    }
    
    const currentBalance = workspaceData?.token_balance ?? 0;
    const newBalance = currentBalance + tokenAmount;
    
    // Update token balance and auto-topup setting
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("workspaces")
      .update({
        token_balance: newBalance,
        balance_auto_topup: paymentType === 'auto-recharge'
      })
      .eq("id", workspaceId)
      .select();
    
    if (updateError) {
      throw new Error("Failed to update token balance");
    }
    
    console.log(`Token balance updated: ${currentBalance} → ${newBalance}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        previousBalance: currentBalance,
        newBalance: newBalance,
        added: tokenAmount,
        autoTopup: paymentType === 'auto-recharge'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
