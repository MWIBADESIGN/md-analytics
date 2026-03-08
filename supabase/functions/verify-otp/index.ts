import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp_code, new_password } = await req.json();

    if (!email || !otp_code) {
      return new Response(JSON.stringify({ error: "Email and OTP code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find valid OTP
    const { data: otpData, error: otpError } = await supabase
      .from("password_reset_otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp_code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpData) {
      return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as used
    await supabase
      .from("password_reset_otps")
      .update({ used: true })
      .eq("id", otpData.id);

    // If new_password provided, update it
    if (new_password) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        otpData.user_id,
        { password: new_password }
      );
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, password_updated: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // OTP verified, return success so user can set new password
    return new Response(JSON.stringify({ success: true, verified: true, user_id: otpData.user_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
