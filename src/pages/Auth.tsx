import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import mdLogo from "@/assets/md-analytics-logo.png";

type AuthView = "login" | "signup" | "forgot";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your email.");
      } else if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<AuthView, { h: string; p: string }> = {
    login: { h: "Welcome back", p: "Sign in to your dashboard" },
    signup: { h: "Create account", p: "Get started with MD Analytics" },
    forgot: { h: "Reset Password", p: "We'll send a reset link to your email" },
  };

  const buttonLabels: Record<AuthView, string> = {
    login: "Sign In",
    signup: "Create Account",
    forgot: "Send Reset Link",
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <img src={mdLogo} alt="MD Analytics" className="h-32 w-32 rounded-2xl glow-primary shadow-lg" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">MD Analytics</h1>
          </div>
          <h2 className="text-4xl font-bold text-foreground leading-tight mb-4">
            Powerful analytics for your <span className="gradient-text">web & mobile</span> apps
          </h2>
          <p className="text-muted-foreground text-lg">
            Track visitors, monitor performance, and gain insights across all your digital properties.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={mdLogo} alt="MD Analytics" className="h-24 w-24 rounded-xl shadow-md" />
            <h1 className="text-2xl font-bold text-foreground">MD Analytics</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">{titles[view].h}</h2>
          <p className="text-muted-foreground mb-6">{titles[view].p}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 rounded-lg bg-secondary border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-lg bg-secondary border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {(view === "login" || view === "signup") && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-lg bg-secondary border border-border pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            {view === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setView("forgot")} className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 glow-primary"
            >
              {submitting ? "Loading..." : buttonLabels[view]}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {view === "forgot" ? (
              <button onClick={() => setView("login")} className="text-primary hover:underline">
                Back to sign in
              </button>
            ) : view === "login" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => setView("signup")} className="text-primary hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setView("login")} className="text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
