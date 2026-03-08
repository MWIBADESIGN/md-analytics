import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface Props {
  data?: { date: string; visitors: number; pageviews: number }[];
}

export function VisitorsChart({ data = [] }: Props) {
  const isEmpty = data.length === 0 || data.every((d) => d.visitors === 0 && d.pageviews === 0);

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Visitors Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Visitors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">Pageviews</span>
          </div>
        </div>
      </div>
      {isEmpty ? (
        <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
          No visitor data yet. Data will appear once visitors arrive.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pageviewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(187, 94%, 43%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(187, 94%, 43%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217, 33%, 17%)",
                border: "1px solid hsl(217, 33%, 25%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210, 40%, 98%)",
              }}
            />
            <Area type="monotone" dataKey="visitors" stroke="hsl(217, 91%, 60%)" fill="url(#visitorsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="pageviews" stroke="hsl(187, 94%, 43%)" fill="url(#pageviewsGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
