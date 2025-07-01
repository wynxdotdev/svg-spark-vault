import { useState } from "react";
import { Plus, Upload, Folder, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

// Mock data
const mockStats = {
  totalProjects: 12,
  totalSVGs: 234,
  recentUploads: 15,
  favoriteIcons: 67
};

const mockRecentUploads = [
  { id: 1, name: "arrow-right.svg", project: "UI Icons", uploadedAt: "2 hours ago", size: "1.2kb" },
  { id: 2, name: "user-circle.svg", project: "Avatars", uploadedAt: "5 hours ago", size: "2.1kb" },
  { id: 3, name: "shopping-cart.svg", project: "E-commerce", uploadedAt: "1 day ago", size: "1.8kb" },
  { id: 4, name: "heart-filled.svg", project: "Social", uploadedAt: "2 days ago", size: "0.9kb" },
];

const mockProjects = [
  { id: 1, name: "UI Icons", count: 45, color: "bg-blue-500", updated: "Today" },
  { id: 2, name: "Illustrations", count: 23, color: "bg-green-500", updated: "Yesterday" },
  { id: 3, name: "Logos", count: 12, color: "bg-purple-500", updated: "3 days ago" },
  { id: 4, name: "Social Media", count: 31, color: "bg-pink-500", updated: "1 week ago" },
  { id: 5, name: "E-commerce", count: 18, color: "bg-orange-500", updated: "2 weeks ago" },
  { id: 6, name: "Random", count: 89, color: "bg-gray-500", updated: "1 month ago" },
];

export default function Dashboard() {
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
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
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
            <div className="text-2xl font-bold">{mockStats.totalProjects}</div>
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
            <div className="text-2xl font-bold">{mockStats.totalSVGs}</div>
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
            <div className="text-2xl font-bold">{mockStats.recentUploads}</div>
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
            <div className="text-2xl font-bold">{mockStats.favoriteIcons}</div>
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
              {mockRecentUploads.map((upload) => (
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
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {mockProjects.slice(0, 6).map((project) => (
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