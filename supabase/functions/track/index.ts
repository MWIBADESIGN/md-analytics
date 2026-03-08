import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let os = "Unknown";
  let deviceType = "desktop";

  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR/")) browser = "Opera";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    deviceType = "mobile";
  } else if (ua.includes("iPad") || ua.includes("Tablet")) {
    deviceType = "tablet";
  }

  return { browser, os, deviceType };
}

function parseReferrerSource(referrer: string | undefined): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes("google")) return "Google";
    if (host.includes("bing")) return "Bing";
    if (host.includes("yahoo")) return "Yahoo";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("twitter") || host.includes("t.co")) return "Twitter/X";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("tiktok")) return "TikTok";
    return host;
  } catch {
    return null;
  }
}

function getClientIp(req: Request): string | null {
  // Try common headers for the real client IP
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "true-client-ip",
  ];
  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can be comma-separated, take the first
      return value.split(",")[0].trim();
    }
  }
  return null;
}

async function getGeoFromIp(ip: string): Promise<{ country_name: string; country_code: string } | null> {
  try {
    // Try cf-connecting-ip country from Cloudflare first, then fallback to API
    const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
    const data = await res.json();
    if (data.countryName && data.countryCode) {
      return { country_name: data.countryName, country_code: data.countryCode };
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { project_id, visitor_id, session_id, event_name, event_data } = body;

    if (!project_id || !visitor_id || !event_name) {
      return new Response(
        JSON.stringify({ error: "project_id, visitor_id, and event_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate project exists
    const { data: project } = await supabase
      .from("projects")
      .select("id, domain")
      .eq("id", project_id)
      .maybeSingle();

    if (!project) {
      return new Response(
        JSON.stringify({ error: "Invalid project" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const { browser, os, deviceType } = parseUserAgent(userAgent);
    const referrer = event_data?.referrer || "";
    const referrerSource = parseReferrerSource(referrer);
    const screen = event_data?.screen || null;

    // Get geolocation from IP
    const clientIp = getClientIp(req);
    let geo: { country_name: string; country_code: string } | null = null;
    if (clientIp) {
      geo = await getGeoFromIp(clientIp);
    }

    if (event_name === "pageview") {
      const existingSession = await supabase
        .from("sessions")
        .select("id")
        .eq("id", session_id)
        .maybeSingle();

      if (!existingSession.data && session_id) {
        await supabase.from("sessions").insert({
          id: session_id,
          project_id,
          visitor_id,
          browser,
          os,
          device_type: deviceType,
          referrer_url: referrer || null,
          referrer_source: referrerSource,
          screen_resolution: screen,
          is_bounce: true,
          country_code: geo?.country_code || null,
          country_name: geo?.country_name || null,
          ip_address: clientIp || null,
        });
      } else if (existingSession.data) {
        // Update bounce + fill geo if missing
        const updateData: Record<string, unknown> = { is_bounce: false };
        if (geo) {
          updateData.country_code = geo.country_code;
          updateData.country_name = geo.country_name;
        }
        await supabase
          .from("sessions")
          .update(updateData)
          .eq("id", existingSession.data.id);
      }

      await supabase.from("pageviews").insert({
        project_id,
        visitor_id,
        session_id: session_id || null,
        page_url: event_data?.url || "/",
        page_title: event_data?.title || null,
      });
    }

    if (event_name === "session_end" && session_id) {
      const duration = event_data?.duration || 0;
      await supabase
        .from("sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq("id", session_id);
    }

    await supabase.from("events").insert({
      project_id,
      visitor_id,
      session_id: session_id || null,
      event_name,
      event_data: event_data || {},
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Track error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
