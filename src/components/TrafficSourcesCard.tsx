import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(187, 94%, 43%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 67%, 60%)",
  "hsl(0, 72%, 51%)",
];

interface Props {
  sources?: { name: string; value: number }[];
}

export function TrafficSourcesCard({ sources = [] }: Props) {
  const isEmpty = sources.length === 0;

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-foreground mb-4">Traffic Sources</h3>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-10">No traffic data yet</p>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={sources} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                {sources.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(217, 33%, 17%)",
                  border: "1px solid hsl(217, 33%, 25%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 40%, 98%)",
                }}
                formatter={(value: number) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {sources.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
