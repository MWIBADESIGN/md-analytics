import { Users, UserPlus, UserCheck, Clock, Monitor, Smartphone, Tablet, Apple, Laptop, Globe, Chrome } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/useProjects";

const UsersPage = () => {
  const { metrics } = useDashboardData();
  const { data: projects } = useProjects();
  const projectIds = projects?.map((p) => p.id) || [];

  const { data: sessions } = useQuery({
    queryKey: ["users-sessions", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("visitor_id, started_at, duration_seconds, country_code, country_name, device_type, os, browser, is_bounce, project_id")
        .in("project_id", projectIds)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Group by visitor
  const visitorMap: Record<string, { sessions: number; lastSeen: string; totalDuration: number; country: string; countryName: string; device: string; os: string; browser: string; pages: number }> = {};
  sessions?.forEach((s) => {
    if (!visitorMap[s.visitor_id]) {
      visitorMap[s.visitor_id] = { sessions: 0, lastSeen: s.started_at, totalDuration: 0, country: s.country_code || "??", countryName: s.country_name || "Unknown", device: s.device_type || "Desktop", os: s.os || "Unknown", browser: s.browser || "Unknown", pages: 0 };
    }
    visitorMap[s.visitor_id].sessions++;
    visitorMap[s.visitor_id].totalDuration += s.duration_seconds || 0;
    if (new Date(s.started_at) > new Date(visitorMap[s.visitor_id].lastSeen)) {
      visitorMap[s.visitor_id].lastSeen = s.started_at;
    }
  });

  const recentUsers = Object.entries(visitorMap)
    .sort(([, a], [, b]) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .slice(0, 10)
    .map(([id, data]) => ({
      id: id.substring(0, 10),
      country: data.country,
      countryName: data.countryName,
      device: data.device.charAt(0).toUpperCase() + data.device.slice(1),
      os: data.os,
      browser: data.browser,
      sessions: data.sessions,
      avgDuration: data.sessions > 0 ? formatDuration(Math.round(data.totalDuration / data.sessions)) : "0s",
      lastSeen: getTimeAgo(data.lastSeen),
    }));

  const newVisitorsCount = Object.values(visitorMap).filter(v => v.sessions === 1).length;
  const returningCount = Object.values(visitorMap).filter(v => v.sessions > 1).length;

  const isEmpty = !sessions || sessions.length === 0;

  const getOsIcon = (os: string) => {
    const osLower = os.toLowerCase();
    if (osLower.includes("mac") || osLower.includes("ios")) return <Apple className="h-3.5 w-3.5" />;
    if (osLower.includes("android")) return <Smartphone className="h-3.5 w-3.5" />;
    return <Laptop className="h-3.5 w-3.5" />;
  };

  const getBrowserIcon = (browser: string) => {
    const bLower = browser.toLowerCase();
    if (bLower.includes("chrome")) return <Chrome className="h-3.5 w-3.5" />;
    if (bLower.includes("safari")) return <Globe className="h-3.5 w-3.5" />;
    if (bLower.includes("firefox")) return <Globe className="h-3.5 w-3.5" />;
    if (bLower.includes("edge")) return <Globe className="h-3.5 w-3.5" />;
    return <Globe className="h-3.5 w-3.5" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track user behavior and engagement patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={String(metrics.totalVisitors)} change="—" trend="up" icon={Users} />
          <MetricCard title="New Users" value={String(newVisitorsCount)} change="—" trend="up" icon={UserPlus} />
          <MetricCard title="Returning" value={String(returningCount)} change="—" trend="up" icon={UserCheck} />
          <MetricCard title="Avg Session" value={metrics.avgDuration} change="—" trend="up" icon={Clock} />
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No user data yet. Data will appear once visitors start browsing your site.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                     <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Country</th>
                     <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Device</th>
                     <th className="pb-3 text-left text-xs font-medium text-muted-foreground">OS</th>
                     <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Browser</th>
                     <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Sessions</th>
                     <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Avg Duration</th>
                     <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                     <td className="py-3 text-foreground">{u.countryName} <span className="text-muted-foreground text-xs">({u.country})</span></td>
                     <td className="py-3 text-muted-foreground">
                       <span className="flex items-center gap-1.5">
                         {u.device === "Desktop" ? <Monitor className="h-3.5 w-3.5" /> : u.device === "Mobile" ? <Smartphone className="h-3.5 w-3.5" /> : <Tablet className="h-3.5 w-3.5" />}
                         {u.device}
                       </span>
                     </td>
                     <td className="py-3 text-muted-foreground">
                       <span className="flex items-center gap-1.5">
                         {getOsIcon(u.os)}
                         {u.os}
                       </span>
                     </td>
                     <td className="py-3 text-muted-foreground">
                       <span className="flex items-center gap-1.5">
                         {getBrowserIcon(u.browser)}
                         {u.browser}
                       </span>
                     </td>
                     <td className="py-3 text-right text-foreground">{u.sessions}</td>
                     <td className="py-3 text-right text-muted-foreground">{u.avgDuration}</td>
                     <td className="py-3 text-right text-muted-foreground">{u.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

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
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default UsersPage;
