import { Monitor, Smartphone, Tablet } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const iconMap: Record<string, any> = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };

interface Props {
  devices?: { name: string; value: number }[];
  browsers?: { name: string; users: number }[];
}

export function DevicesCard({ devices = [], browsers = [] }: Props) {
  const isEmpty = devices.length === 0 && browsers.length === 0;

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-foreground mb-4">Devices & Browsers</h3>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-10">No device data yet</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(devices.length > 0 ? devices : [{ name: "Desktop", value: 0 }, { name: "Mobile", value: 0 }, { name: "Tablet", value: 0 }]).slice(0, 3).map((device) => {
              const Icon = iconMap[device.name] || Monitor;
              return (
                <div key={device.name} className="rounded-lg bg-secondary/50 p-3 text-center">
                  <Icon className="h-5 w-5 mx-auto text-primary mb-1.5" />
                  <p className="text-lg font-bold text-foreground">{device.value}%</p>
                  <p className="text-xs text-muted-foreground">{device.name}</p>
                </div>
              );
            })}
          </div>
          {browsers.length > 0 && (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={browsers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(217, 33%, 17%)",
                    border: "1px solid hsl(217, 33%, 25%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(210, 40%, 98%)",
                  }}
                />
                <Bar dataKey="users" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}
