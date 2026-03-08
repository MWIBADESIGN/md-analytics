import { Monitor, Smartphone, Tablet, Laptop } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(187, 94%, 43%)", "hsl(142, 71%, 45%)"];

const Devices = () => {
  const { devices, browsers, metrics } = useDashboardData();

  const deviceData = devices.length > 0
    ? devices.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))
    : [{ name: "Desktop", value: 0, color: COLORS[0] }, { name: "Mobile", value: 0, color: COLORS[1] }, { name: "Tablet", value: 0, color: COLORS[2] }];

  const desktopPct = deviceData.find(d => d.name === "Desktop")?.value || 0;
  const mobilePct = deviceData.find(d => d.name === "Mobile")?.value || 0;
  const tabletPct = deviceData.find(d => d.name === "Tablet")?.value || 0;

  const isEmpty = devices.length === 0 && browsers.length === 0;

  // Build screen resolution and OS data from sessions via the hook's raw data
  // For now we show what's available from the hook

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Devices & Platforms</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Understand what your visitors are using</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Desktop" value={`${desktopPct}%`} change="—" trend="up" icon={Monitor} />
          <MetricCard title="Mobile" value={`${mobilePct}%`} change="—" trend="up" icon={Smartphone} />
          <MetricCard title="Tablet" value={`${tabletPct}%`} change="—" trend="up" icon={Tablet} />
          <MetricCard title="Unique Devices" value={String(metrics.totalVisitors)} change="—" trend="up" icon={Laptop} />
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <Monitor className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No device data yet. Data will appear once visitors start browsing your site.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Device Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" strokeWidth={0} label={({ name, value }) => `${name} ${value}%`}>
                      {deviceData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 25%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 98%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Browsers</h3>
                {browsers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={browsers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} width={70} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(217, 33%, 25%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 40%, 98%)" }} />
                      <Bar dataKey="users" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10">No browser data yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Devices;
