
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Download, Heart, GitFork, User, Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PublicProject {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
  svgs: any[];
  forks?: number;
}

interface PublicSVG {
  id: string;
  name: string;
  description: string;
  views: number;
  downloads: number;
  favorited: boolean;
  file_path: string;
  created_at: string;
  user_id: string;
  project_id: string;
  projects: {
    name: string;
    color: string;
  };
  profiles: {
    display_name: string;
  };
}

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");

  const { data: publicProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['public-projects', sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          color,
          created_at,
          user_id,
          profiles!projects_user_id_fkey(display_name, avatar_url),
          svgs(id, views, downloads, favorited)
        `)
        .eq('is_public', true);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data } = await query;
      
      if (!data) return [];

      // Calculate metrics and sort
      const projectsWithMetrics = data.map(project => ({
        ...project,
        totalViews: project.svgs?.reduce((sum: number, svg: any) => sum + (svg.views || 0), 0) || 0,
        totalDownloads: project.svgs?.reduce((sum: number, svg: any) => sum + (svg.downloads || 0), 0) || 0,
        totalFavorites: project.svgs?.filter((svg: any) => svg.favorited).length || 0,
        svgCount: project.svgs?.length || 0
      }));

      // Sort based on selected criteria
      return projectsWithMetrics.sort((a, b) => {
        switch (sortBy) {
          case 'views':
            return b.totalViews - a.totalViews;
          case 'downloads':
            return b.totalDownloads - a.totalDownloads;
          case 'recent':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: // trending
            return (b.totalViews + b.totalDownloads + b.totalFavorites) - (a.totalViews + a.totalDownloads + a.totalFavorites);
        }
      });
    }
  });

  const { data: publicSVGs, isLoading: svgsLoading } = useQuery({
    queryKey: ['public-svgs', sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('svgs')
        .select(`
          id,
          name,
          description,
          views,
          downloads,
          favorited,
          file_path,
          created_at,
          user_id,
          project_id,
          projects(name, color, is_public),
          profiles!svgs_user_id_fkey(display_name)
        `);

      // Only get SVGs from public projects
      const { data: publicProjectIds } = await supabase
        .from('projects')
        .select('id')
        .eq('is_public', true);

      if (!publicProjectIds?.length) return [];

      query = query.in('project_id', publicProjectIds.map(p => p.id));

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data } = await query;
      
      if (!data) return [];

      // Sort SVGs
      return data.sort((a, b) => {
        switch (sortBy) {
          case 'views':
            return (b.views || 0) - (a.views || 0);
          case 'downloads':
            return (b.downloads || 0) - (a.downloads || 0);
          case 'recent':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: // trending
            return ((b.views || 0) + (b.downloads || 0)) - ((a.views || 0) + (a.downloads || 0));
        }
      });
    }
  });

  const handleForkProject = async (projectId: string, projectName: string, originalUserId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to fork projects",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create forked project
      const { data: forkedProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `${projectName} (Fork)`,
          description: `Forked from ${projectName}`,
          user_id: user.id,
          is_public: false
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Get original project's SVGs
      const { data: originalSvgs } = await supabase
        .from('svgs')
        .select('*')
        .eq('project_id', projectId);

      if (originalSvgs && originalSvgs.length > 0) {
        // Copy SVGs to forked project
        const forkedSvgs = originalSvgs.map(svg => ({
          name: svg.name,
          description: svg.description,
          file_path: svg.file_path, // Keep reference to original file
          user_id: user.id,
          project_id: forkedProject.id,
          tags: svg.tags
        }));

        await supabase.from('svgs').insert(forkedSvgs);
      }

      // Create notification for original creator
      try {
        await supabase.from('notifications').insert({
          user_id: originalUserId,
          type: 'fork',
          title: 'Project Forked',
          message: `${user.email} forked your project "${projectName}"`,
          data: {
            forked_by: user.id,
            original_project_id: projectId,
            forked_project_id: forkedProject.id
          }
        });
      } catch {
        // Ignore notification errors
      }

      toast({
        title: "Project forked successfully!",
        description: `You can now find "${projectName} (Fork)" in your projects`
      });

      navigate(`/project/${forkedProject.id}`);
    } catch (error) {
      console.error('Fork error:', error);
      toast({
        title: "Failed to fork project",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleViewSVG = (svgId: string) => {
    navigate(`/svg/${svgId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-muted-foreground">Discover trending public SVG collections and projects</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects and SVGs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
            <SelectItem value="downloads">Most Downloaded</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="svgs">SVGs</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {projectsLoading ? (
            <div className="text-center py-8">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicProjects?.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-4 h-4 rounded ${project.color || 'bg-blue-500'}`} />
                      <Badge variant="secondary">{project.svgCount} SVGs</Badge>
                    </div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{project.totalViews || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{project.totalDownloads || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{project.totalFavorites || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          by {(project.profiles as any)?.display_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/project/${project.id}`)}
                          className="flex-1"
                        >
                          View Project
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleForkProject(project.id, project.name, project.user_id)}
                          className="flex items-center space-x-1"
                        >
                          <GitFork className="h-4 w-4" />
                          <span>Fork</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="svgs" className="space-y-6">
          {svgsLoading ? (
            <div className="text-center py-8">Loading SVGs...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {publicSVGs?.map((svg) => (
                <Card 
                  key={svg.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleViewSVG(svg.id)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-2xl text-muted-foreground">SVG</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm truncate">{svg.name}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{svg.projects?.name}</span>
                        <div className={`w-2 h-2 rounded ${svg.projects?.color || 'bg-blue-500'}`} />
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{svg.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="h-3 w-3" />
                          <span>{svg.downloads || 0}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {(svg.profiles as any)?.display_name || 'Anonymous'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
