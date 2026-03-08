import { Users, Eye, Clock, ArrowDownUp, MousePointerClick, Activity, Plus, Globe } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { VisitorsChart } from "@/components/VisitorsChart";
import { TrafficSourcesCard } from "@/components/TrafficSourcesCard";
import { RealTimePanel } from "@/components/RealTimePanel";
import { PagesTable } from "@/components/PagesTable";
import { DevicesCard } from "@/components/DevicesCard";
import { CountriesCard } from "@/components/CountriesCard";
import { WorldMapCard } from "@/components/WorldMapCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "@/contexts/ProjectContext";
import { ProjectSelector } from "@/components/ProjectSelector";

const Index = () => {
  const { selectedProjectId, projects, isLoading } = useProjectContext();
  const navigate = useNavigate();
  const hasProjects = projects && projects.length > 0;
  const dashboard = useDashboardData(selectedProjectId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Monitor your website performance in real-time</p>
          </div>
          {hasProjects && <ProjectSelector />}
        </div>

        {/* Empty State - No Projects */}
        {!isLoading && !hasProjects && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to MD Analytics!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Add your website or mobile application URL to start tracking visitors, pageviews, and analytics data in real-time.
            </p>
            <button
              onClick={() => navigate("/projects")}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors glow-primary"
            >
              <Plus className="h-4 w-4" />
              Add Your First Project
            </button>
          </div>
        )}

        {/* Dashboard Content - shown when projects exist */}
        {hasProjects && (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard title="Live Visitors" value={String(dashboard.metrics.liveVisitors)} change="—" trend="up" icon={Activity} />
              <MetricCard title="Total Visitors" value={String(dashboard.metrics.totalVisitors)} change="—" trend="up" icon={Users} />
              <MetricCard title="Pageviews" value={String(dashboard.metrics.pageviews)} change="—" trend="up" icon={Eye} />
              <MetricCard title="Views / Visit" value={String(dashboard.metrics.viewsPerVisit)} change="—" trend="up" icon={MousePointerClick} />
              <MetricCard title="Avg Duration" value={dashboard.metrics.avgDuration} change="—" trend="up" icon={Clock} />
              <MetricCard title="Bounce Rate" value={`${dashboard.metrics.bounceRate}%`} change="—" trend="up" icon={ArrowDownUp} />
            </div>

            {/* Chart + Real-time */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <VisitorsChart data={dashboard.chartData} />
              </div>
              <RealTimePanel liveCount={dashboard.metrics.liveVisitors} sessions={dashboard.recentSessions} />
            </div>

            {/* World Map */}
            <WorldMapCard countries={dashboard.countries} />

            {/* Traffic + Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrafficSourcesCard sources={dashboard.trafficSources} />
              <CountriesCard countries={dashboard.countries} />
            </div>

            {/* Pages Table + Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <PagesTable pages={dashboard.topPages} />
              </div>
              <DevicesCard devices={dashboard.devices} browsers={dashboard.browsers} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
