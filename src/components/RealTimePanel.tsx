interface Session {
  page: string;
  country: string;
  device: string;
  time: string;
}

interface Props {
  liveCount?: number;
  sessions?: Session[];
}

export function RealTimePanel({ liveCount = 0, sessions = [] }: Props) {
  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse-glow" />
        <h3 className="text-sm font-semibold text-foreground">Real-Time</h3>
        <span className="ml-auto text-2xl font-bold gradient-text">{liveCount}</span>
        <span className="text-xs text-muted-foreground">active now</span>
      </div>
      {sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No active visitors right now</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((user, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground w-12">{user.country}</span>
              <span className="flex-1 font-medium text-foreground truncate">{user.page}</span>
              <span className="text-muted-foreground">{user.device}</span>
              <span className="text-muted-foreground/60 w-12 text-right">{user.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
