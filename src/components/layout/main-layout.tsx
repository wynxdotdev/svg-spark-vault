import { Outlet } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/navigation/sidebar-nav";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex w-full">
        <SidebarNav />
        
        <main className="flex-1 min-h-screen">
          {/* Header with sidebar trigger */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                
                {/* Logo for collapsed sidebar */}
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">S</span>
                  </div>
                  <span className="font-bold text-lg hidden lg:block">SVG Spark Vault</span>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="flex items-center space-x-2">
                <button className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <span className="text-primary text-sm">+</span>
                </button>
              </div>
            </div>
          </header>
          
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}