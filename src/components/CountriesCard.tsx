interface Country {
  name: string;
  code: string;
  count: number;
  pct: number;
}

interface Props {
  countries?: Country[];
}

export function CountriesCard({ countries = [] }: Props) {
  const isEmpty = countries.length === 0;

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-foreground mb-4">Top Countries</h3>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-10">No country data yet</p>
      ) : (
        <div className="space-y-2.5">
          {countries.map((c) => (
            <div key={c.code || c.name} className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-8">{c.code || "??"}</span>
              <span className="flex-1 text-sm text-foreground">{c.name}</span>
              <span className="text-sm text-muted-foreground w-16 text-right">{c.count.toLocaleString()}</span>
              <div className="w-24">
                <div className="h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(c.pct, 2)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{c.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
