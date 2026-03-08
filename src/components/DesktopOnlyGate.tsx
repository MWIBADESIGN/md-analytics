import { useIsMobile } from "@/hooks/use-mobile";
import mdLogo from "@/assets/md-analytics-logo.png";
import { Monitor } from "lucide-react";

export function DesktopOnlyGate({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center max-w-sm">
          <img src={mdLogo} alt="MD Analytics" className="h-16 w-16 rounded-xl mx-auto mb-6" />
          <Monitor className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Desktop Only</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            MD Analytics is a desktop application designed for computers only. Please open this app on a desktop or laptop device for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
