import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "./useProjects";

export function useDashboardData(selectedProjectId?: string | null) {
  const { data: projects } = useProjects();
  const projectIds = selectedProjectId ? [selectedProjectId] : (projects?.map((p) => p.id) || []);

  const { data: sessions, ...sessionsQuery } = useQuery({
    queryKey: ["dashboard-sessions", projectIds],
    enabled: projectIds.length > 0,
    refetchInterval: 15000, // Poll every 15 seconds for live data
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .in("project_id", projectIds)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: pageviews } = useQuery({
    queryKey: ["dashboard-pageviews", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pageviews")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Compute metrics
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const liveSessions = sessions?.filter(
    (s) => !s.ended_at && new Date(s.started_at) > fiveMinAgo
  ) || [];

  const uniqueVisitors = new Set(sessions?.map((s) => s.visitor_id) || []).size;
  const totalPageviews = pageviews?.length || 0;
  const viewsPerVisit = uniqueVisitors > 0 ? (totalPageviews / uniqueVisitors).toFixed(1) : "0";

  const sessionsWithDuration = sessions?.filter((s) => s.duration_seconds) || [];
  const avgDuration = sessionsWithDuration.length > 0
    ? Math.round(sessionsWithDuration.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessionsWithDuration.length)
    : 0;

  const totalSessions = sessions?.length || 0;
  const bounceSessions = sessions?.filter((s) => s.is_bounce).length || 0;
  const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;

  // Traffic sources
  const sourceMap: Record<string, number> = {};
  sessions?.forEach((s) => {
    const src = s.referrer_source || "Direct";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const trafficSources = Object.entries(sourceMap)
    .map(([name, count]) => ({ name, value: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Countries
  const countryMap: Record<string, { name: string; code: string; count: number }> = {};
  sessions?.forEach((s) => {
    if (s.country_name) {
      const key = s.country_code || s.country_name;
      if (!countryMap[key]) countryMap[key] = { name: s.country_name, code: s.country_code || "", count: 0 };
      countryMap[key].count++;
    }
  });
  const countries = Object.values(countryMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((c) => ({
      ...c,
      pct: totalSessions > 0 ? Math.round((c.count / totalSessions) * 100) : 0,
    }));

  // Devices
  const deviceMap: Record<string, number> = {};
  sessions?.forEach((s) => {
    const d = s.device_type || "desktop";
    deviceMap[d] = (deviceMap[d] || 0) + 1;
  });
  const devices = Object.entries(deviceMap)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0 }))
    .sort((a, b) => b.value - a.value);

  // Browsers
  const browserMap: Record<string, number> = {};
  sessions?.forEach((s) => {
    const b = s.browser || "Unknown";
    browserMap[b] = (browserMap[b] || 0) + 1;
  });
  const browsers = Object.entries(browserMap)
    .map(([name, users]) => ({ name, users }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 5);

  // Top pages
  const pageMap: Record<string, { visitors: Set<string>; views: number; sessions: Set<string> }> = {};
  pageviews?.forEach((pv) => {
    const url = pv.page_url;
    if (!pageMap[url]) pageMap[url] = { visitors: new Set(), views: 0, sessions: new Set() };
    pageMap[url].visitors.add(pv.visitor_id);
    pageMap[url].views++;
    if (pv.session_id) pageMap[url].sessions.add(pv.session_id);
  });
  const topPages = Object.entries(pageMap)
    .map(([url, data]) => ({ url, visitors: data.visitors.size, pageviews: data.views }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 10);

  // Visitors chart (last 7 days)
  const chartData: { date: string; visitors: number; pageviews: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString("en", { weekday: "short" });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const dayVisitors = new Set(
      sessions?.filter((s) => {
        const t = new Date(s.started_at);
        return t >= dayStart && t < dayEnd;
      }).map((s) => s.visitor_id) || []
    ).size;

    const dayPageviews = pageviews?.filter((pv) => {
      const t = new Date(pv.created_at);
      return t >= dayStart && t < dayEnd;
    }).length || 0;

    chartData.push({ date: dayStr, visitors: dayVisitors, pageviews: dayPageviews });
  }

  // Recent active sessions for real-time panel
  const recentSessions = (sessions || [])
    .filter((s) => !s.ended_at)
    .slice(0, 5)
    .map((s) => ({
      page: "/",
      country: s.country_code || "??",
      device: s.device_type || "Desktop",
      time: getTimeAgo(s.started_at),
    }));

  return {
    isLoading: sessionsQuery.isLoading,
    metrics: {
      liveVisitors: liveSessions.length,
      totalVisitors: uniqueVisitors,
      pageviews: totalPageviews,
      viewsPerVisit,
      avgDuration: formatDuration(avgDuration),
      bounceRate,
    },
    trafficSources,
    countries,
    devices,
    browsers,
    topPages,
    chartData,
    recentSessions,
  };
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getTimeAgo(dateStr: string): string {
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
