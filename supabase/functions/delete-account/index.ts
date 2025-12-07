/**
 * Delete Account Edge Function
 * 
 * Handles GDPR-compliant account deletion including:
 * - User profile data
 * - Saved filters and thesis profiles
 * - Startup lists and items
 * - Notifications
 * - Credit transactions
 * - Organization membership (if applicable)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPrelight } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const preflightResponse = handleCorsPrelight(req);
  if (preflightResponse) return preflightResponse;
  
  const corsHeaders = getCorsHeaders(req.headers.get("Origin"));

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { userId } = await req.json();
    
    // Ensure user can only delete their own account
    if (userId !== user.id) {
      throw new Error("Unauthorized: You can only delete your own account");
    }

    logStep("User authenticated", { userId: user.id });

    // Check if user is an organization owner
    const { data: ownedOrgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('owner_id', user.id);

    if (ownedOrgs && ownedOrgs.length > 0) {
      // Transfer ownership or delete organization
      for (const org of ownedOrgs) {
        // Check if there are other admins to transfer to
        const { data: admins } = await supabaseAdmin
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', org.id)
          .eq('role', 'admin')
          .neq('user_id', user.id)
          .limit(1);

        if (admins && admins.length > 0) {
          // Transfer ownership to first admin
          await supabaseAdmin
            .from('organizations')
            .update({ owner_id: admins[0].user_id })
            .eq('id', org.id);

          logStep("Transferred organization ownership", { orgId: org.id, newOwner: admins[0].user_id });
        } else {
          // Check for other members
          const { data: members } = await supabaseAdmin
            .from('organization_members')
            .select('user_id')
            .eq('organization_id', org.id)
            .neq('user_id', user.id)
            .limit(1);

          if (members && members.length > 0) {
            // Promote first member to owner
            await supabaseAdmin
              .from('organization_members')
              .update({ role: 'owner' })
              .eq('organization_id', org.id)
              .eq('user_id', members[0].user_id);

            await supabaseAdmin
              .from('organizations')
              .update({ owner_id: members[0].user_id })
              .eq('id', org.id);

            logStep("Promoted member to owner", { orgId: org.id, newOwner: members[0].user_id });
          } else {
            // Delete organization if no other members
            await supabaseAdmin
              .from('organization_invites')
              .delete()
              .eq('organization_id', org.id);

            await supabaseAdmin
              .from('organizations')
              .delete()
              .eq('id', org.id);

            logStep("Deleted empty organization", { orgId: org.id });
          }
        }
      }
    }

    // Delete user's data in order (respecting foreign keys)
    
    // 1. Delete notifications
    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
    logStep("Deleted notifications");

    // 2. Delete mentions
    await supabaseAdmin
      .from('mentions')
      .delete()
      .or(`user_id.eq.${user.id},mentioned_by_user_id.eq.${user.id}`);
    logStep("Deleted mentions");

    // 3. Delete startup votes
    await supabaseAdmin
      .from('startup_votes')
      .delete()
      .eq('user_id', user.id);
    logStep("Deleted startup votes");

    // 4. Delete startup list shares
    await supabaseAdmin
      .from('startup_list_shares')
      .delete()
      .or(`shared_with_user_id.eq.${user.id},shared_by_user_id.eq.${user.id}`);
    logStep("Deleted list shares");

    // 5. Delete startup list activity
    const { data: userLists } = await supabaseAdmin
      .from('startup_lists')
      .select('id')
      .eq('user_id', user.id);

    if (userLists) {
      for (const list of userLists) {
        await supabaseAdmin
          .from('startup_list_activity')
          .delete()
          .eq('list_id', list.id);
        
        await supabaseAdmin
          .from('startup_list_items')
          .delete()
          .eq('list_id', list.id);
      }
    }
    logStep("Deleted list items and activity");

    // 6. Delete startup lists
    await supabaseAdmin
      .from('startup_lists')
      .delete()
      .eq('user_id', user.id);
    logStep("Deleted startup lists");

    // 7. Delete user alerts
    const { data: userAlerts } = await supabaseAdmin
      .from('user_alerts')
      .select('id')
      .eq('user_id', user.id);

    if (userAlerts) {
      for (const alert of userAlerts) {
        await supabaseAdmin
          .from('alert_matches')
          .delete()
          .eq('alert_id', alert.id);
      }
    }

    await supabaseAdmin
      .from('user_alerts')
      .delete()
      .eq('user_id', user.id);
    logStep("Deleted user alerts");

    // 8. Delete saved filters / thesis profiles
    await supabaseAdmin
      .from('user_thesis_profiles')
      .delete()
      .eq('user_id', user.id);
    logStep("Deleted thesis profiles");

    // 9. Delete organization membership
    await supabaseAdmin
      .from('organization_members')
      .delete()
      .eq('user_id', user.id);
    logStep("Deleted organization memberships");

    // 10. Delete credit transactions (keep for 7 years for tax purposes)
    // We anonymize instead of delete
    await supabaseAdmin
      .from('credit_transactions')
      .update({ 
        user_id: null,
        description: 'Account deleted - anonymized' 
      })
      .eq('user_id', user.id);
    logStep("Anonymized credit transactions");

    // 11. Delete profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id);
    logStep("Deleted profile");

    // 12. Delete auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      logStep("Warning: Could not delete auth user", { error: deleteError.message });
      // Continue anyway - profile is deleted
    } else {
      logStep("Deleted auth user");
    }

    logStep("Account deletion completed", { userId: user.id });

    return new Response(JSON.stringify({
      success: true,
      message: "Account deleted successfully",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

