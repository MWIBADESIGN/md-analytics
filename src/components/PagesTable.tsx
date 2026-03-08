interface Page {
  url: string;
  visitors: number;
  pageviews: number;
}

interface Props {
  pages?: Page[];
}

export function PagesTable({ pages = [] }: Props) {
  const isEmpty = pages.length === 0;

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-foreground mb-4">Top Pages</h3>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-10">No page data yet</p>
      ) : (
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
              {pages.map((page) => (
                <tr key={page.url} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 font-medium text-primary truncate max-w-[300px]">{page.url}</td>
                  <td className="py-3 text-right text-foreground">{page.visitors.toLocaleString()}</td>
                  <td className="py-3 text-right text-foreground">{page.pageviews.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
