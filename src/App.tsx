import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DesktopOnlyGate } from "@/components/DesktopOnlyGate";
import Index from "./pages/Index";
import RealTime from "./pages/RealTime";
import Traffic from "./pages/Traffic";
import Pages from "./pages/Pages";
import Devices from "./pages/Devices";
import MobileApps from "./pages/MobileApps";
import UsersPage from "./pages/UsersPage";
import Projects from "./pages/Projects";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DesktopOnlyGate>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/realtime" element={<ProtectedRoute><RealTime /></ProtectedRoute>} />
                <Route path="/traffic" element={<ProtectedRoute><Traffic /></ProtectedRoute>} />
                <Route path="/pages" element={<ProtectedRoute><Pages /></ProtectedRoute>} />
                <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
                <Route path="/mobile" element={<ProtectedRoute><MobileApps /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DesktopOnlyGate>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
