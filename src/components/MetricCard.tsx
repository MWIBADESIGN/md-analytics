import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {trend === "up" ? (
          <TrendingUp className="h-3.5 w-3.5 text-success" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
        )}
        <span className={`text-xs font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}>
          {change}
        </span>
        <span className="text-xs text-muted-foreground">vs last period</span>
      </div>
    </div>
  );
}
