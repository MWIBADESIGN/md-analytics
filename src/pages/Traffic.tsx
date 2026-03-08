import { Globe, Search, Share2, Link2, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(187, 94%, 43%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(280, 67%, 60%)", "hsl(0, 72%, 51%)"];

const Traffic = () => {
  const { trafficSources } = useDashboardData();

  const isEmpty = trafficSources.length === 0;

  const chartData = trafficSources.map((s, i) => ({
    ...s,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Traffic Sources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Understand where your visitors come from</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {trafficSources.length > 0 ? (
            trafficSources.slice(0, 5).map((s) => (
              <MetricCard key={s.name} title={s.name} value={`${s.value}%`} change="—" trend="up" icon={Globe} />
            ))
          ) : (
            <>
              <MetricCard title="Direct" value="0%" change="—" trend="up" icon={Globe} />
              <MetricCard title="Social" value="0%" change="—" trend="up" icon={Share2} />
              <MetricCard title="Search" value="0%" change="—" trend="up" icon={Search} />
              <MetricCard title="Referral" value="0%" change="—" trend="up" icon={Link2} />
              <MetricCard title="Paid Ads" value="0%" change="—" trend="up" icon={DollarSign} />
            </>
          )}
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No traffic data yet. Data will appear once visitors start browsing your site.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Source Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" strokeWidth={0}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 25%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 98%)" }} formatter={(value: number) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Traffic;
