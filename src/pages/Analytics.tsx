import { TrendingUp, Download, Eye, Heart, Folder, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Mock analytics data
const mockStats = {
  totalViews: 15420,
  totalDownloads: 3240,
  totalFavorites: 890,
  totalUploads: 234,
  viewsGrowth: 12.5,
  downloadsGrowth: 8.3,
  favoritesGrowth: 15.2,
  uploadsGrowth: 5.7,
};

const mockTopSVGs = [
  { name: "arrow-right.svg", project: "UI Icons", views: 1250, downloads: 320, favorites: 85 },
  { name: "user-circle.svg", project: "Avatars", views: 1120, downloads: 280, favorites: 72 },
  { name: "shopping-cart.svg", project: "E-commerce", views: 980, downloads: 245, favorites: 68 },
  { name: "heart-filled.svg", project: "Social", views: 890, downloads: 210, favorites: 95 },
  { name: "settings-gear.svg", project: "UI Icons", views: 750, downloads: 185, favorites: 45 },
];

const mockTopProjects = [
  { name: "UI Icons", svgs: 45, views: 5420, downloads: 1340, storage: "12.5 MB", growth: 15.2 },
  { name: "Illustrations", svgs: 23, views: 3240, downloads: 890, storage: "45.2 MB", growth: 8.7 },
  { name: "Logos", svgs: 12, views: 2100, downloads: 650, storage: "8.9 MB", growth: 22.1 },
  { name: "Social Media", svgs: 31, views: 1980, downloads: 420, storage: "15.7 MB", growth: -2.3 },
  { name: "E-commerce", svgs: 18, views: 1540, downloads: 380, storage: "9.2 MB", growth: 12.8 },
];

const mockUsageTimeline = [
  { period: "Last 7 days", uploads: 15, views: 2340, downloads: 580 },
  { period: "Last 30 days", uploads: 45, views: 8920, downloads: 2180 },
  { period: "Last 90 days", uploads: 120, views: 22580, downloads: 5940 },
  { period: "All time", uploads: 234, views: 45290, downloads: 12480 },
];

export default function Analytics() {
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
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center space-x-2 text-xs">
          <span className={growth >= 0 ? "text-success" : "text-destructive"}>
            {growth >= 0 ? "+" : ""}{growth}%
          </span>
          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );

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
          value={mockStats.totalViews}
          growth={mockStats.viewsGrowth}
          icon={Eye}
          description="from last month"
        />
        <StatCard
          title="Downloads"
          value={mockStats.totalDownloads}
          growth={mockStats.downloadsGrowth}
          icon={Download}
          description="from last month"
        />
        <StatCard
          title="Favorites"
          value={mockStats.totalFavorites}
          growth={mockStats.favoritesGrowth}
          icon={Heart}
          description="from last month"
        />
        <StatCard
          title="Uploads"
          value={mockStats.totalUploads}
          growth={mockStats.uploadsGrowth}
          icon={Upload}
          description="from last month"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="svgs">Top SVGs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="usage">Usage Timeline</TabsTrigger>
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
                  {mockTopSVGs.slice(0, 5).map((svg, index) => (
                    <div key={svg.name} className="flex items-center justify-between">
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
                  {mockTopProjects.slice(0, 5).map((project) => (
                    <div key={project.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{project.name}</span>
                        <Badge variant={project.growth >= 0 ? "secondary" : "destructive"} className="text-xs">
                          {project.growth >= 0 ? "+" : ""}{project.growth}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{project.views} views</span>
                          <span>{project.downloads} downloads</span>
                        </div>
                        <Progress value={(project.views / 6000) * 100} className="h-2" />
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
                {mockTopSVGs.map((svg, index) => (
                  <div key={svg.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
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
                {mockTopProjects.map((project) => (
                  <div key={project.name} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant={project.growth >= 0 ? "secondary" : "destructive"}>
                        {project.growth >= 0 ? "+" : ""}{project.growth}%
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

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Timeline</CardTitle>
              <CardDescription>Track your activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockUsageTimeline.map((period) => (
                  <div key={period.period} className="space-y-3">
                    <h3 className="font-medium">{period.period}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uploads</span>
                          <span className="font-medium">{period.uploads}</span>
                        </div>
                        <Progress value={(period.uploads / 250) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Views</span>
                          <span className="font-medium">{period.views.toLocaleString()}</span>
                        </div>
                        <Progress value={(period.views / 50000) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Downloads</span>
                          <span className="font-medium">{period.downloads.toLocaleString()}</span>
                        </div>
                        <Progress value={(period.downloads / 15000) * 100} className="h-2" />
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