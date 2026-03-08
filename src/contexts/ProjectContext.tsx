import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useProjects } from "@/hooks/useProjects";

interface ProjectContextType {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projects: any[] | undefined;
  isLoading: boolean;
  canCreateProject: boolean;
  projectCount: number;
  FREE_LIMIT: number;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const FREE_PROJECT_LIMIT = 3;

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: projects, isLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project if none selected
  useEffect(() => {
    if (!selectedProjectId && projects && projects.length > 0) {
      const saved = localStorage.getItem("md-selected-project");
      if (saved && projects.some((p) => p.id === saved)) {
        setSelectedProjectId(saved);
      } else {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [projects, selectedProjectId]);

  // Persist selection
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("md-selected-project", selectedProjectId);
    }
  }, [selectedProjectId]);

  const projectCount = projects?.length || 0;
  const canCreateProject = projectCount < FREE_PROJECT_LIMIT;

  return (
    <ProjectContext.Provider
      value={{
        selectedProjectId,
        setSelectedProjectId,
        projects,
        isLoading,
        canCreateProject,
        projectCount,
        FREE_LIMIT: FREE_PROJECT_LIMIT,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjectContext must be used within ProjectProvider");
  return ctx;
}
