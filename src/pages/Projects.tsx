import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Globe, Smartphone, Trash2, Copy, ExternalLink, Link2, Check, Zap, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjectContext, FREE_PROJECT_LIMIT } from "@/contexts/ProjectContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const Projects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { canCreateProject, projectCount } = useProjectContext();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [platform, setPlatform] = useState<"web" | "android" | "ios">("web");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("projects")
        .insert({ name, domain, platform, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setJustCreatedId(data.id);
      // Auto-copy the 1-line snippet
      const snippet = getOneLineSnippet(data.id);
      navigator.clipboard.writeText(snippet);
      toast.success("Project created! Tracking code copied to clipboard ✨");
      setShowForm(false);
      setName("");
      setDomain("");
      setPlatform("web");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getOneLineSnippet = (projectId: string) =>
    `<script src="${SUPABASE_URL}/functions/v1/mda?id=${projectId}"></script>`;

  const copySnippet = (projectId: string) => {
    navigator.clipboard.writeText(getOneLineSnippet(projectId));
    setCopiedId(projectId);
    toast.success("Tracking code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add your website — just one line of code to start tracking
            </p>
          </div>
          {canCreateProject ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors glow-primary"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          ) : (
            <button
              onClick={() => toast.info("Upgrade to Pro to add more than 3 projects.")}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-muted text-muted-foreground font-medium text-sm cursor-not-allowed border border-border"
            >
              <Lock className="h-4 w-4" />
              Upgrade to Add More
            </button>
          )}
        </div>

        {/* Free tier badge */}
        {!canCreateProject && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Free plan limit reached ({projectCount}/{FREE_PROJECT_LIMIT} projects)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Pro to add unlimited projects and unlock advanced analytics.</p>
            </div>
          </div>
        )}

        {/* Add Project Form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Website"
                  className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {platform === "web" ? "Website URL" : "App Bundle ID / Link"}
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder={platform === "web" ? "https://example.com" : "com.example.app"}
                    className="w-full h-10 rounded-lg bg-secondary border border-border pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Platform</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform("web")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    platform === "web"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="h-4 w-4" /> Website
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("android")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    platform === "android"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> Android
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("ios")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    platform === "ios"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> iOS
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => createProject.mutate()}
                disabled={!name || !domain || createProject.isPending}
                className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createProject.isPending ? "Creating..." : "Create & Get Tracking Code"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="h-10 px-6 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !projects?.length ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your website to get a simple one-line tracking code.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Your First Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`rounded-xl border bg-card p-5 space-y-3 transition-all ${
                  justCreatedId === project.id
                    ? "border-primary/50 shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {project.platform !== "web" ? (
                        <Smartphone className="h-5 w-5 text-primary" />
                      ) : (
                        <Globe className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {project.domain || "No domain set"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteProject.mutate(project.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Simple 1-line tracking code */}
                {project.platform === "web" ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Add this single line before {`</body>`} on your website:
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/70 rounded-lg px-3 py-2.5 border border-border">
                      <code className="text-xs text-foreground flex-1 font-mono truncate select-all">
                        {getOneLineSnippet(project.id)}
                      </code>
                      <button
                        onClick={() => copySnippet(project.id)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        {copiedId === project.id ? (
                          <>
                            <Check className="h-3 w-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    {justCreatedId === project.id && (
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                        <p className="text-xs text-primary font-medium">
                          ✨ Tracking code already copied to your clipboard! Just paste it into your website's HTML before the closing &lt;/body&gt; tag. Data will appear on your dashboard within seconds of your first visitor.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-foreground">Mobile API Endpoint:</span>
                    <pre className="text-xs text-foreground/80 bg-secondary/50 rounded-lg p-3 overflow-x-auto font-mono">
{`POST ${SUPABASE_URL}/functions/v1/track
Content-Type: application/json

{
  "project_id": "${project.id}",
  "visitor_id": "unique-device-id",
  "session_id": "unique-session-id",
  "event_name": "pageview",
  "event_data": { "url": "/home", "title": "Home Screen" }
}`}
                    </pre>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.platform !== "web"
                      ? "bg-accent/10 text-accent"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {project.platform === "web" ? "Web" : project.platform === "android" ? "Android" : "iOS"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
