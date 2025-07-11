import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Upload, Search, Download, Heart, Copy, Eye, Plus, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProjectSettings } from "@/components/project/ProjectSettings";

export default function ProjectView() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_user_id_fkey(display_name, avatar_url)
        `)
        .eq('id', projectId)
        .single();

      if (error || !data) return null;
      return data;
    }
  });

  const { data: svgs, isLoading: svgsLoading } = useQuery({
    queryKey: ['project-svgs', projectId, searchQuery, sortBy],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from('svgs')
        .select('*')
        .eq('project_id', projectId);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'views':
          query = query.order('views', { ascending: false });
          break;
        case 'downloads':
          query = query.order('downloads', { ascending: false });
          break;
        case 'date':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('name');
      }

      const { data } = await query;
      return data || [];
    }
  });

  const handleDownload = async (svg: any) => {
    try {
      const { data: fileData } = await supabase.storage
        .from('svg-files')
        .download(svg.file_path);

      if (!fileData) throw new Error('Failed to download file');

      // Update download count
      await supabase
        .from('svgs')
        .update({ downloads: (svg.downloads || 0) + 1 })
        .eq('id', svg.id);

      // Create download link
      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = svg.name.endsWith('.svg') ? svg.name : `${svg.name}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `"${svg.name}" is being downloaded`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the SVG file",
        variant: "destructive"
      });
    }
  };

  const handleCopyCode = async (svg: any) => {
    try {
      const { data: fileData } = await supabase.storage
        .from('svg-files')
        .download(svg.file_path);

      if (fileData) {
        const text = await fileData.text();
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied to clipboard",
          description: "SVG code has been copied to your clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy SVG code",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = async (svg: any) => {
    if (!user) return;

    try {
      const newFavoriteStatus = !svg.favorited;
      await supabase
        .from('svgs')
        .update({ favorited: newFavoriteStatus })
        .eq('id', svg.id);

      toast({
        title: newFavoriteStatus ? "Added to favorites" : "Removed from favorites",
        description: `"${svg.name}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} your favorites`
      });

      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const isOwner = user?.id === project.user_id;

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg ${project.color || 'bg-blue-500'} flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              {project.description || "No description available"}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={project.is_public ? "default" : "secondary"}>
                {project.is_public ? "Public" : "Private"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                by {(project.profiles as any)?.display_name || 'Anonymous'}
              </span>
              <span className="text-sm text-muted-foreground">
                {svgs?.length || 0} SVGs
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isOwner && <ProjectSettings project={project} />}
          {isOwner && (
            <Button onClick={() => navigate('/upload')} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add SVG</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search SVGs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="svgs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="svgs">SVGs ({svgs?.length || 0})</TabsTrigger>
          <TabsTrigger value="info">Project Info</TabsTrigger>
        </TabsList>

        <TabsContent value="svgs">
          {svgsLoading ? (
            <div className="text-center py-8">Loading SVGs...</div>
          ) : svgs && svgs.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {svgs.map((svg) => (
                  <Card key={svg.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div 
                        className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center cursor-pointer"
                        onClick={() => navigate(`/svg/${svg.id}`)}
                      >
                        <div className="text-2xl text-muted-foreground">SVG</div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm truncate">{svg.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{svg.views || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download className="h-3 w-3" />
                              <span>{svg.downloads || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(svg)}
                            className="flex-1 h-8 text-xs"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCode(svg)}
                            className="flex-1 h-8 text-xs"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {user && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleFavorite(svg)}
                              className={`flex-1 h-8 text-xs ${svg.favorited ? 'bg-red-50 text-red-600' : ''}`}
                            >
                              <Heart className={`h-3 w-3 ${svg.favorited ? 'fill-current' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {svgs.map((svg) => (
                  <Card key={svg.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-4 cursor-pointer flex-1"
                          onClick={() => navigate(`/svg/${svg.id}`)}
                        >
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-sm text-muted-foreground">SVG</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{svg.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{svg.views || 0} views</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Download className="h-4 w-4" />
                                <span>{svg.downloads || 0} downloads</span>
                              </div>
                              <span>{new Date(svg.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(svg)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCode(svg)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {user && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleFavorite(svg)}
                              className={svg.favorited ? 'bg-red-50 text-red-600' : ''}
                            >
                              <Heart className={`h-4 w-4 ${svg.favorited ? 'fill-current' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No SVGs yet</h3>
              <p className="text-muted-foreground mb-4">
                {isOwner ? "Start by uploading your first SVG to this project." : "This project doesn't have any SVGs yet."}
              </p>
              {isOwner && (
                <Button onClick={() => navigate('/upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload SVG
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Project Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>{project.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p>{project.description || "No description provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Visibility</label>
                    <p>{project.is_public ? "Public" : "Private"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total SVGs</span>
                    <span className="font-medium">{svgs?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Views</span>
                    <span className="font-medium">
                      {svgs?.reduce((sum, svg) => sum + (svg.views || 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Downloads</span>
                    <span className="font-medium">
                      {svgs?.reduce((sum, svg) => sum + (svg.downloads || 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorites</span>
                    <span className="font-medium">
                      {svgs?.filter(svg => svg.favorited).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
