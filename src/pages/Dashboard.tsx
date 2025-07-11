import { useState, useEffect } from "react";
import { Plus, Upload, Folder, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalProjects: number;
  totalSVGs: number;
  recentUploads: number;
  favoriteIcons: number;
}

interface RecentUpload {
  id: string;
  name: string;
  project: string;
  uploadedAt: string;
  size: string;
}

interface Project {
  id: string;
  name: string;
  count: number;
  color: string | null;
  updated: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSVGs: 0,
    recentUploads: 0,
    favoriteIcons: 0
  });
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects with SVG counts
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          color,
          updated_at,
          svgs (
            id
          )
        `)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch recent SVG uploads
      const { data: svgsData, error: svgsError } = await supabase
        .from('svgs')
        .select(`
          id,
          name,
          file_size,
          created_at,
          projects (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (svgsError) throw svgsError;

      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from('svgs')
        .select('*', { count: 'exact', head: true })
        .eq('favorited', true);

      // Fetch recent uploads count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCount } = await supabase
        .from('svgs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Transform data
      const transformedProjects = projectsData?.map(project => ({
        id: project.id,
        name: project.name,
        count: project.svgs?.length || 0,
        color: project.color || 'bg-blue-500',
        updated: formatRelativeTime(project.updated_at)
      })) || [];

      const transformedUploads = svgsData?.map(svg => ({
        id: svg.id,
        name: svg.name,
        project: svg.projects?.name || 'No Project',
        uploadedAt: formatRelativeTime(svg.created_at),
        size: svg.file_size ? `${(svg.file_size / 1024).toFixed(1)}kb` : 'N/A'
      })) || [];

      setProjects(transformedProjects);
      setRecentUploads(transformedUploads);
      setStats({
        totalProjects: projectsData?.length || 0,
        totalSVGs: svgsData?.length || 0,
        recentUploads: recentCount || 0,
        favoriteIcons: favoritesCount || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground">You need to be signed in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-primary-foreground/80 text-lg mb-6">
            Manage your SVG collection with ease. Upload, organize, and find your icons instantly.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/upload">
                <Upload className="h-4 w-4" />
                Upload SVGs
              </Link>
            </Button>
            <CreateProjectDialog 
              onProjectCreated={fetchDashboardData}
              trigger={
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              }
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 translate-x-24"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SVGs</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalSVGs}</div>
            <p className="text-xs text-muted-foreground">
              +15 this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.favoriteIcons}</div>
            <p className="text-xs text-muted-foreground">
              Bookmarked icons
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Your latest SVG uploads</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/search">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No recent uploads
                </div>
              ) : recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-primary">
                      <AvatarFallback className="text-primary-foreground font-medium">
                        {upload.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{upload.name}</p>
                      <p className="text-xs text-muted-foreground">{upload.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{upload.uploadedAt}</p>
                    <p className="text-xs font-medium">{upload.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Your SVG project collections</CardDescription>
              </div>
              <CreateProjectDialog 
                onProjectCreated={fetchDashboardData}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {projects.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No projects yet. Create your first project!
                </div>
              ) : projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded ${project.color}`} />
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Updated {project.updated}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {project.count}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}