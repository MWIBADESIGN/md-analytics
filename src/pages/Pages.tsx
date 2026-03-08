import { FileText, Eye, Clock, ArrowDownUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { useDashboardData } from "@/hooks/useDashboardData";

const Pages = () => {
  const { topPages, metrics } = useDashboardData();

  const isEmpty = topPages.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pages Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Performance metrics for each page on your site</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Pages" value={String(topPages.length)} change="—" trend="up" icon={FileText} />
          <MetricCard title="Total Pageviews" value={String(metrics.pageviews)} change="—" trend="up" icon={Eye} />
          <MetricCard title="Avg Duration" value={metrics.avgDuration} change="—" trend="up" icon={Clock} />
          <MetricCard title="Bounce Rate" value={`${metrics.bounceRate}%`} change="—" trend="up" icon={ArrowDownUp} />
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No page data yet. Data will appear once visitors start browsing your site.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">All Pages</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Page</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Visitors</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Pageviews</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((page) => (
                    <tr key={page.url} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium text-primary truncate max-w-[300px]">{page.url}</td>
                      <td className="py-3 text-right text-foreground">{page.visitors.toLocaleString()}</td>
                      <td className="py-3 text-right text-foreground">{page.pageviews.toLocaleString()}</td>
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

export default Pages;
