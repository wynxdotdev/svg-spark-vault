import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Settings, 
  Download, 
  Share2, 
  Plus, 
  Grid, 
  List, 
  Filter, 
  Search, 
  Calendar,
  SortAsc,
  SortDesc,
  Tag,
  Copy,
  Heart,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock project data
const mockProjects = {
  "1": {
    id: "1",
    name: "UI Icons",
    description: "Essential user interface icons for web and mobile applications",
    color: "bg-blue-500",
    svgCount: 45,
    totalViews: 5420,
    totalDownloads: 1340,
    createdAt: "2023-10-15",
    updatedAt: "2023-12-01",
    tags: ["ui", "interface", "web", "mobile"],
    isPublic: true,
  },
  "2": {
    id: "2",
    name: "Illustrations",
    description: "Beautiful hand-crafted illustrations for modern designs",
    color: "bg-green-500",
    svgCount: 23,
    totalViews: 3240,
    totalDownloads: 890,
    createdAt: "2023-09-20",
    updatedAt: "2023-11-28",
    tags: ["illustration", "art", "design"],
    isPublic: true,
  },
  "random": {
    id: "random",
    name: "Random",
    description: "Miscellaneous SVG icons and graphics",
    color: "bg-gray-500",
    svgCount: 89,
    totalViews: 2100,
    totalDownloads: 520,
    createdAt: "2023-08-01",
    updatedAt: "2023-12-02",
    tags: ["misc", "random", "various"],
    isPublic: false,
  },
};

// Mock SVG data for project
const generateMockSVGs = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `icon-${i + 1}.svg`,
    tags: ["interface", "arrow", "navigation", "ui"].slice(0, Math.floor(Math.random() * 3) + 1),
    size: `${(Math.random() * 3 + 0.5).toFixed(1)}kb`,
    uploadedAt: `${Math.floor(Math.random() * 30) + 1} days ago`,
    views: Math.floor(Math.random() * 500) + 50,
    downloads: Math.floor(Math.random() * 100) + 10,
    favorited: Math.random() > 0.7,
  }));
};

export default function ProjectView() {
  const { projectId } = useParams();
  const project = projectId ? mockProjects[projectId as keyof typeof mockProjects] : null;
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  
  const mockSVGs = project ? generateMockSVGs(project.svgCount) : [];
  const allTags = ["all", ...Array.from(new Set(mockSVGs.flatMap(svg => svg.tags)))];

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Project not found</h1>
        <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  const ProjectSettings = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>Configure your project preferences</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input defaultValue={project.name} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea defaultValue={project.description} />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500"].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded ${color} ${project.color === color ? "ring-2 ring-primary" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Public Project</Label>
            <Button variant="outline" size="sm">
              {project.isPublic ? "Public" : "Private"}
            </Button>
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Save Changes</Button>
            <Button variant="destructive" size="sm">Delete Project</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const SVGGridItem = ({ svg }: { svg: typeof mockSVGs[0] }) => (
    <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-square bg-muted/50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">{svg.name.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="icon" variant="secondary" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8">
              <Heart className={`h-4 w-4 ${svg.favorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Move to Project</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate">{svg.name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{svg.size}</span>
            <span>{svg.views} views</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {svg.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SVGListItem = ({ svg }: { svg: typeof mockSVGs[0] }) => (
    <Card className="group hover:shadow-soft transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">{svg.name.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{svg.name}</h3>
            <p className="text-xs text-muted-foreground">{svg.uploadedAt} • {svg.size}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {svg.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <div>{svg.views} views</div>
            <div>{svg.downloads} downloads</div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Heart className={`h-4 w-4 ${svg.favorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Move to Project</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className={`h-16 w-16 rounded-xl ${project.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">
                {project.name.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                  <ProjectSettings />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">SVGs</p>
                  <p className="font-semibold text-lg">{project.svgCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Views</p>
                  <p className="font-semibold text-lg">{project.totalViews.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Downloads</p>
                  <p className="font-semibold text-lg">{project.totalDownloads.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-semibold text-lg">{new Date(project.createdAt).getFullYear()}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {project.isPublic ? (
                  <Badge variant="default">Public</Badge>
                ) : (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search SVGs in this project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag === "all" ? "All Tags" : tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="downloads">Most Downloads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="flex items-center justify-between">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All SVGs ({project.svgCount})</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Add SVGs
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SVG Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {mockSVGs.map((svg) => (
            <SVGGridItem key={svg.id} svg={svg} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {mockSVGs.map((svg) => (
            <SVGListItem key={svg.id} svg={svg} />
          ))}
        </div>
      )}
    </div>
  );
}