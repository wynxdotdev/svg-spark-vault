
import { useState, useEffect } from "react";
import { TrendingUp, Download, Eye, Heart, Folder, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  totalViews: number;
  totalDownloads: number;
  totalFavorites: number;
  totalUploads: number;
  viewsGrowth: number;
  downloadsGrowth: number;
  favoritesGrowth: number;
  uploadsGrowth: number;
}

interface TopSVG {
  id: string;
  name: string;
  project: string;
  views: number;
  downloads: number;
  favorites: number;
}

interface TopProject {
  id: string;
  name: string;
  svgs: number;
  views: number;
  downloads: number;
  storage: string;
  growth: number;
}

export default function Analytics() {
  const { user } = useAuth();

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's SVGs with aggregated stats
      const { data: svgs } = await supabase
        .from('svgs')
        .select('views, downloads, favorited, file_size, created_at, name, project_id, projects(name)')
        .eq('user_id', user.id);

      if (!svgs) return null;

      const totalViews = svgs.reduce((sum, svg) => sum + (svg.views || 0), 0);
      const totalDownloads = svgs.reduce((sum, svg) => sum + (svg.downloads || 0), 0);
      const totalFavorites = svgs.filter(svg => svg.favorited).length;
      const totalUploads = svgs.length;

      return {
        totalViews,
        totalDownloads,
        totalFavorites,
        totalUploads,
        viewsGrowth: 12.5, // Mock growth data for now
        downloadsGrowth: 8.3,
        favoritesGrowth: 15.2,
        uploadsGrowth: 5.7,
        svgs
      };
    },
    enabled: !!user
  });

  const { data: topSVGs } = useQuery({
    queryKey: ['top-svgs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: svgs } = await supabase
        .from('svgs')
        .select('id, name, views, downloads, favorited, projects(name)')
        .eq('user_id', user.id)
        .order('views', { ascending: false })
        .limit(5);

      return svgs?.map(svg => ({
        id: svg.id,
        name: svg.name,
        project: svg.projects?.name || 'Unknown',
        views: svg.views || 0,
        downloads: svg.downloads || 0,
        favorites: svg.favorited ? 1 : 0
      })) || [];
    },
    enabled: !!user
  });

  const { data: topProjects } = useQuery({
    queryKey: ['top-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          svgs(views, downloads, file_size)
        `)
        .eq('user_id', user.id);

      return projects?.map(project => {
        const svgCount = project.svgs?.length || 0;
        const totalViews = project.svgs?.reduce((sum: number, svg: any) => sum + (svg.views || 0), 0) || 0;
        const totalDownloads = project.svgs?.reduce((sum: number, svg: any) => sum + (svg.downloads || 0), 0) || 0;
        const totalSize = project.svgs?.reduce((sum: number, svg: any) => sum + (svg.file_size || 0), 0) || 0;

        return {
          id: project.id,
          name: project.name,
          svgs: svgCount,
          views: totalViews,
          downloads: totalDownloads,
          storage: `${(totalSize / 1024 / 1024).toFixed(1)} MB`,
          growth: Math.random() * 30 - 5 // Mock growth data
        };
      }) || [];
    },
    enabled: !!user
  });

  const StatCard = ({ title, value, growth, icon: Icon, description }: {
    title: string;
    value: string | number;
    growth: number;
    icon: any;
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="flex items-center space-x-2 text-xs">
          <span className={growth >= 0 ? "text-green-600" : "text-red-600"}>
            {growth >= 0 ? "+" : ""}{growth}%
          </span>
          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (!analyticsData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your SVG collection performance and usage</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={analyticsData.totalViews}
          growth={analyticsData.viewsGrowth}
          icon={Eye}
          description="from last month"
        />
        <StatCard
          title="Downloads"
          value={analyticsData.totalDownloads}
          growth={analyticsData.downloadsGrowth}
          icon={Download}
          description="from last month"
        />
        <StatCard
          title="Favorites"
          value={analyticsData.totalFavorites}
          growth={analyticsData.favoritesGrowth}
          icon={Heart}
          description="from last month"
        />
        <StatCard
          title="Uploads"
          value={analyticsData.totalUploads}
          growth={analyticsData.uploadsGrowth}
          icon={Upload}
          description="from last month"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="svgs">Top SVGs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing SVGs */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing SVGs</CardTitle>
                <CardDescription>Most viewed and downloaded icons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSVGs?.slice(0, 5).map((svg, index) => (
                    <div key={svg.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{svg.name}</p>
                          <p className="text-xs text-muted-foreground">{svg.project}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{svg.views} views</p>
                        <p className="text-xs text-muted-foreground">{svg.downloads} downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Views and downloads by project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProjects?.slice(0, 5).map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{project.name}</span>
                        <Badge variant={project.growth >= 0 ? "secondary" : "destructive"} className="text-xs">
                          {project.growth >= 0 ? "+" : ""}{project.growth.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{project.views} views</span>
                          <span>{project.downloads} downloads</span>
                        </div>
                        <Progress value={Math.min((project.views / 1000) * 100, 100)} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="svgs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top SVGs Performance</CardTitle>
              <CardDescription>Detailed breakdown of your most popular SVGs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSVGs?.map((svg, index) => (
                  <div key={svg.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{svg.name}</p>
                        <p className="text-sm text-muted-foreground">{svg.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{svg.views}</p>
                        <p className="text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{svg.downloads}</p>
                        <p className="text-muted-foreground">Downloads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{svg.favorites}</p>
                        <p className="text-muted-foreground">Favorites</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Performance metrics for each project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProjects?.map((project) => (
                  <div key={project.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant={project.growth >= 0 ? "secondary" : "destructive"}>
                        {project.growth >= 0 ? "+" : ""}{project.growth.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">SVGs</p>
                        <p className="font-medium">{project.svgs}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium">{project.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Downloads</p>
                        <p className="font-medium">{project.downloads.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Storage</p>
                        <p className="font-medium">{project.storage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
