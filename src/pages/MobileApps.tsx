import { Smartphone, Download, Users, Clock, Eye, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";

const MobileApps = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mobile App Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track installs, usage, and performance across platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard title="Installs (7d)" value="0" change="—" trend="up" icon={Download} />
          <MetricCard title="DAU" value="0" change="—" trend="up" icon={Users} />
          <MetricCard title="MAU" value="0" change="—" trend="up" icon={Users} />
          <MetricCard title="Avg Session" value="0s" change="—" trend="up" icon={Clock} />
          <MetricCard title="Screen Views" value="0" change="—" trend="up" icon={Eye} />
          <MetricCard title="Crashes" value="0" change="—" trend="up" icon={AlertTriangle} />
        </div>

        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Smartphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No Mobile App Data Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Mobile app analytics data will appear here once your app starts sending tracking events. Add the tracking script to your mobile app to get started.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileApps;
