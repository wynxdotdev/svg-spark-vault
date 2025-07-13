import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Eye, Download, Users, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ProjectSettings } from "@/components/project/ProjectSettings";

export default function ProjectProperties() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const { data: svgStats } = useQuery({
    queryKey: ['project-svg-stats', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data: svgs } = await supabase
        .from('svgs')
        .select('views, downloads, created_at')
        .eq('project_id', projectId);

      if (!svgs) return null;

      const totalViews = svgs.reduce((sum, svg) => sum + (svg.views || 0), 0);
      const totalDownloads = svgs.reduce((sum, svg) => sum + (svg.downloads || 0), 0);
      const totalSvgs = svgs.length;

      return {
        totalSvgs,
        totalViews,
        totalDownloads,
        recentActivity: svgs
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
      };
    }
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/project/${projectId}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Project</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Project Properties</h1>
            <p className="text-muted-foreground">View detailed information about this project</p>
          </div>
        </div>
        {isOwner && <ProjectSettings project={project} />}
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-lg ${project.color || 'bg-blue-500'} flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {project.description || "No description provided"}
                </p>
              </div>
            </div>
            <Badge variant={project.is_public ? "default" : "secondary"} className="text-sm">
              {project.is_public ? "Public" : "Private"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Project Details</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Owner</span>
                  <span className="text-sm font-medium">
                    {(project.profiles as any)?.display_name || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm font-medium">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {svgStats && (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total SVGs</span>
                      </div>
                      <span className="text-sm font-medium">{svgStats.totalSvgs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total Views</span>
                      </div>
                      <span className="text-sm font-medium">{svgStats.totalViews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total Downloads</span>
                      </div>
                      <span className="text-sm font-medium">{svgStats.totalDownloads}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. Views per SVG</span>
                      <span className="text-sm font-medium">
                        {svgStats.totalSvgs > 0 ? Math.round(svgStats.totalViews / svgStats.totalSvgs) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. Downloads per SVG</span>
                      <span className="text-sm font-medium">
                        {svgStats.totalSvgs > 0 ? Math.round(svgStats.totalDownloads / svgStats.totalSvgs) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Download Rate</span>
                      <span className="text-sm font-medium">
                        {svgStats.totalViews > 0 ? Math.round((svgStats.totalDownloads / svgStats.totalViews) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Project created</span>
              <span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            
            {project.updated_at !== project.created_at && (
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Project updated</span>
                <span className="font-medium">{new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
            )}

            {svgStats && svgStats.recentActivity.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Recent SVG Uploads</h4>
                  {svgStats.recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-muted-foreground">SVG uploaded</span>
                      <span className="font-medium">{new Date(activity.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Actions */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Project Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/project/${projectId}`)}
              >
                View Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/upload')}
              >
                Upload SVG
              </Button>
              <ProjectSettings project={project} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}