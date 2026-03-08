import { Activity, Globe, Monitor, Smartphone, Tablet, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { useDashboardData } from "@/hooks/useDashboardData";

const RealTime = () => {
  const { metrics, recentSessions } = useDashboardData();

  const isEmpty = recentSessions.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Real-Time Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">See what's happening on your site right now</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Active Now" value={String(metrics.liveVisitors)} change="—" trend="up" icon={Activity} />
          <MetricCard title="Pageviews" value={String(metrics.pageviews)} change="—" trend="up" icon={Globe} />
          <MetricCard title="Avg Session" value={metrics.avgDuration} change="—" trend="up" icon={Clock} />
          <MetricCard title="Bounce Rate" value={`${metrics.bounceRate}%`} change="—" trend="up" icon={Monitor} />
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No active visitors right now. Data will appear once visitors start browsing your site.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <h3 className="text-sm font-semibold text-foreground">Active Visitors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Page</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Country</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Device</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((user, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium text-primary">{user.page}</td>
                      <td className="py-3 text-foreground">{user.country}</td>
                      <td className="py-3 text-muted-foreground flex items-center gap-1.5">
                        {user.device === "desktop" || user.device === "Desktop" ? <Monitor className="h-3.5 w-3.5" /> : user.device === "mobile" || user.device === "Mobile" ? <Smartphone className="h-3.5 w-3.5" /> : <Tablet className="h-3.5 w-3.5" />}
                        {user.device}
                      </td>
                      <td className="py-3 text-right text-muted-foreground/60">{user.time}</td>
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

export default RealTime;
