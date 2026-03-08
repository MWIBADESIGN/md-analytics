import { useProjectContext } from "@/contexts/ProjectContext";
import { Globe, Smartphone, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId, projects, isLoading } = useProjectContext();

  if (isLoading || !projects?.length) return null;

  const selected = projects.find((p) => p.id === selectedProjectId);

  return (
    <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
      <SelectTrigger className="w-[220px] h-9 bg-secondary border-border text-sm">
        <div className="flex items-center gap-2 truncate">
          {selected?.platform === "web" ? (
            <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
          ) : (
            <Smartphone className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <SelectValue placeholder="Select project" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <div className="flex items-center gap-2">
              {p.platform === "web" ? (
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="truncate">{p.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
