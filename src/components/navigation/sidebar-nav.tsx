import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Upload, 
  BarChart3, 
  Settings, 
  User,
  ChevronRight,
  Plus
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Mock projects data
const mockProjects = [
  { id: "1", name: "UI Icons", count: 45, color: "bg-blue-500" },
  { id: "2", name: "Illustrations", count: 23, color: "bg-green-500" },
  { id: "3", name: "Logos", count: 12, color: "bg-purple-500" },
  { id: "4", name: "Random", count: 89, color: "bg-gray-500" },
];

export function SidebarNav() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className={open ? "w-64" : "w-16"}>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel 
              className={`cursor-pointer flex items-center gap-2 ${!open ? "sr-only" : ""}`}
              onClick={() => open && setProjectsExpanded(!projectsExpanded)}
            >
              <span>Projects</span>
              {open && (
                <ChevronRight 
                  className={`h-3 w-3 transition-transform ${projectsExpanded ? "rotate-90" : ""}`}
                />
              )}
            </SidebarGroupLabel>
            {open && (
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <Plus className="h-3 w-3" />
                <span className="sr-only">Add project</span>
              </Button>
            )}
          </div>
          
          {(open && projectsExpanded) && (
            <SidebarGroupContent>
              <SidebarMenu>
                {mockProjects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink to={`/project/${project.id}`} className={getNavCls}>
                        <div className={`h-3 w-3 rounded ${project.color}`} />
                        {open && <span className="truncate">{project.name}</span>}
                        {open && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {project.count}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="space-y-2 p-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
            <ThemeToggle />
          </div>
          <SidebarMenuButton 
            onClick={signOut}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Sign Out
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}