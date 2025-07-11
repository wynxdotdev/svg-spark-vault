
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Heart, Eye, Copy, ExternalLink, User, Calendar, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function SVGPreview() {
  const { svgId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: svg, isLoading } = useQuery({
    queryKey: ['svg-preview', svgId],
    queryFn: async () => {
      if (!svgId) return null;

      const { data, error } = await supabase
        .from('svgs')
        .select(`
          *,
          projects (
            id,
            name,
            description,
            color,
            is_public,
            user_id,
            profiles!projects_user_id_fkey (display_name, avatar_url)
          ),
          profiles!svgs_user_id_fkey (display_name, avatar_url)
        `)
        .eq('id', svgId)
        .single();

      if (error || !data) return null;

      // Increment view count
      await supabase
        .from('svgs')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', svgId);

      return data;
    }
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!svg || !user) return;

      const newFavoriteStatus = !svg.favorited;
      const { error } = await supabase
        .from('svgs')
        .update({ favorited: newFavoriteStatus })
        .eq('id', svg.id);

      if (error) throw error;
      return newFavoriteStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.setQueryData(['svg-preview', svgId], (old: any) => 
        old ? { ...old, favorited: newStatus } : old
      );
      toast({
        title: newStatus ? "Added to favorites" : "Removed from favorites",
        description: `"${svg?.name}" has been ${newStatus ? 'added to' : 'removed from'} your favorites`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!svg) return;

      // Increment download count
      await supabase
        .from('svgs')
        .update({ downloads: (svg.downloads || 0) + 1 })
        .eq('id', svg.id);

      // Get file from storage
      const { data: fileData } = await supabase.storage
        .from('svg-files')
        .download(svg.file_path);

      if (!fileData) throw new Error('Failed to download file');

      // Create download link
      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = svg.name.endsWith('.svg') ? svg.name : `${svg.name}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      queryClient.setQueryData(['svg-preview', svgId], (old: any) => 
        old ? { ...old, downloads: (old.downloads || 0) + 1 } : old
      );
      toast({
        title: "Download started",
        description: `"${svg?.name}" is being downloaded`
      });
    },
    onError: () => {
      toast({
        title: "Download failed",
        description: "Failed to download the SVG file",
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = async () => {
    if (!svg) return;

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading SVG...</p>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">SVG Not Found</h1>
          <p className="text-muted-foreground mb-4">The SVG you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/explore')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SVG Display */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="aspect-square bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2] rounded-lg flex items-center justify-center">
                  <div className="text-6xl text-muted-foreground">SVG</div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              {user && (
                <Button 
                  variant="outline" 
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className={svg.favorited ? "bg-red-50 text-red-600 border-red-200" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${svg.favorited ? "fill-current" : ""}`} />
                  {svg.favorited ? "Favorited" : "Favorite"}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate(`/project/${svg.project_id}`)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </div>
          </div>

          {/* SVG Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{svg.name}</CardTitle>
                {svg.description && (
                  <CardDescription className="text-base">
                    {svg.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{(svg.views || 0) + 1} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{svg.downloads || 0} downloads</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{svg.favorited ? "Favorited" : "Not favorited"}</span>
                  </div>
                </div>

                <Separator />

                {/* Creator Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Creator</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{(svg.profiles as any)?.display_name || 'Anonymous'}</p>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(svg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Project Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Project</h3>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                    onClick={() => navigate(`/project/${svg.project_id}`)}
                  >
                    <div className={`h-8 w-8 rounded ${svg.projects?.color || 'bg-blue-500'} flex items-center justify-center`}>
                      <Folder className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{svg.projects?.name}</p>
                      {svg.projects?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {svg.projects.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">
                          {svg.projects?.is_public ? 'Public' : 'Private'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {(svg.projects?.profiles as any)?.display_name || 'Anonymous'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {svg.tags && svg.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {svg.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* File Info */}
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">File Information</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Format: SVG</p>
                    {svg.file_size && (
                      <p>Size: {(svg.file_size / 1024).toFixed(1)} KB</p>
                    )}
                    <p>Added: {new Date(svg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
