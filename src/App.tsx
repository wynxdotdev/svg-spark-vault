
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";

// Layout
import MainLayout from "@/components/layout/main-layout";
import ProtectedRoute from "@/components/auth/protected-route";

// Pages
import Dashboard from "@/pages/Dashboard";
import Search from "@/pages/Search";
import Upload from "@/pages/Upload";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ProjectView from "@/pages/ProjectView";
import ProjectProperties from "@/pages/ProjectProperties";
import Explore from "@/pages/Explore";
import SVGPreview from "@/pages/SVGPreview";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="svg-vault-theme">
      <AuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="search" element={<Search />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="upload" element={<Upload />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="project/:projectId" element={<ProjectView />} />
                  <Route path="project/:projectId/properties" element={<ProjectProperties />} />
                  <Route path="svg/:svgId" element={<SVGPreview />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
