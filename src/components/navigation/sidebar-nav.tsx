
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
  Plus,
  Compass
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function SidebarNav() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const { data: userProjects } = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          color,
          svgs(id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return data?.map(project => ({
        id: project.id,
        name: project.name,
        count: project.svgs?.length || 0,
        color: project.color || 'bg-blue-500'
      })) || [];
    },
    enabled: !!user
  });

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
              <CreateProjectDialog>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Add project</span>
                </Button>
              </CreateProjectDialog>
            )}
          </div>
          
          {(open && projectsExpanded) && (
            <SidebarGroupContent>
              <SidebarMenu>
                {userProjects?.map((project) => (
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
                {userProjects?.length === 0 && open && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No projects yet
                    </div>
                  </SidebarMenuItem>
                )}
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
          {open && (
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
          )}
          <div className="flex items-center justify-between">
            {!open && (
              <div className="text-xs text-muted-foreground truncate w-8">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <ThemeToggle />
          </div>
          <SidebarMenuButton 
            onClick={signOut}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {open ? "Sign Out" : "Out"}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
