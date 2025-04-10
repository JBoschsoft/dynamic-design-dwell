
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InviteUserRequest = {
  workspaceId: string;
  email: string;
  role: 'administrator' | 'specialist';
};

type InviteUserBatchRequest = {
  workspaceId: string;
  invites: {
    email: string;
    role: 'administrator' | 'specialist';
  }[];
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

    // Determine if this is a batch request or a single invite
    const reqBody = await req.json();
    const isBatchRequest = 'invites' in reqBody;

    let invites: InviteUserRequest[] = [];

    if (isBatchRequest) {
      const { workspaceId, invites: batchInvites } = reqBody as InviteUserBatchRequest;
      invites = batchInvites.map(invite => ({
        workspaceId,
        email: invite.email,
        role: invite.role,
      }));
    } else {
      invites = [reqBody as InviteUserRequest];
    }

    // Verify the user is an admin of the workspace
    const { data: memberData, error: memberError } = await supabaseClient
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", invites[0].workspaceId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !memberData) {
      throw new Error("Unauthorized to send invitations for this workspace");
    }

    if (!["super_admin", "administrator"].includes(memberData.role)) {
      throw new Error("Only admins can send invitations");
    }

    // Get workspace details
    const { data: workspaceData, error: workspaceError } = await supabaseClient
      .from("workspaces")
      .select("name")
      .eq("id", invites[0].workspaceId)
      .single();

    if (workspaceError || !workspaceData) {
      throw new Error(`Workspace not found: ${workspaceError?.message || "Unknown error"}`);
    }

    const results = [];
    const serviceRoleClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    for (const invite of invites) {
      try {
        // Check if email already exists using secure function
        const { data: emailExistsData, error: emailExistsError } = await serviceRoleClient.rpc(
          'check_email_exists',
          { email_to_check: invite.email }
        );

        if (emailExistsError) {
          throw new Error(`Error checking email: ${emailExistsError.message}`);
        }

        if (emailExistsData === true) {
          results.push({
            email: invite.email,
            status: 'error',
            message: 'Email already exists in the system',
          });
          continue;
        }

        // Create invitation record
        const { data: invitationData, error: invitationError } = await supabaseClient
          .from("workspace_invitations")
          .insert({
            workspace_id: invite.workspaceId,
            email: invite.email,
            role: invite.role,
          })
          .select()
          .single();

        if (invitationError) {
          if (invitationError.code === '23505') { // Unique violation
            results.push({
              email: invite.email,
              status: 'error',
              message: 'Invitation already exists for this email',
            });
            continue;
          }
          throw new Error(`Error creating invitation: ${invitationError.message}`);
        }

        // Generate a signup URL with invitation ID
        const signupUrl = `${req.headers.get('origin') || 'https://prostyscreening.ai'}/signup?invitation=${invitationData.id}`;

        // Send invitation email
        await resend.emails.send({
          from: "ProstyScreening <no-reply@prostyscreening.ai>",
          to: invite.email,
          subject: `Dołącz do workspace'a ${workspaceData.name} na ProstyScreening.ai`,
          html: `
            <h1>Zostałeś zaproszony do workspace'a ${workspaceData.name} na platformie ProstyScreening.ai</h1>
            <p>Kliknij poniższy link, aby utworzyć konto i dołączyć do workspace'a:</p>
            <p><a href="${signupUrl}">Dołącz do workspace'a</a></p>
            <p>Link jest ważny przez 7 dni.</p>
          `,
        });

        results.push({
          email: invite.email,
          status: 'success',
          invitationId: invitationData.id,
        });
      } catch (error) {
        results.push({
          email: invite.email,
          status: 'error',
          message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in invite-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
