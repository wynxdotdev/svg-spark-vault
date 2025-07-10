import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_public: boolean | null;
  created_at: string;
  updated_at: string;
}

interface SVGData {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  tags: string[] | null;
  downloads: number | null;
  favorited: boolean | null;
  views: number | null;
  created_at: string;
}

export default function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [svgs, setSvgs] = useState<SVGData[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const allTags = ["all", ...Array.from(new Set(svgs.flatMap(svg => svg.tags || [])))];

  useEffect(() => {
    if (user && projectId) {
      fetchProjectData();
    }
  }, [user, projectId]);

  const fetchProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      // Fetch SVGs for this project
      const { data: svgData, error: svgError } = await supabase
        .from('svgs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (svgError) throw svgError;

      setProject(projectData);
      setSvgs(svgData || []);
      
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (svg: SVGData) => {
    try {
      const { data } = supabase.storage
        .from('svg-files')
        .getPublicUrl(svg.file_path);

      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = svg.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      await supabase
        .from('svgs')
        .update({ downloads: (svg.downloads || 0) + 1 })
        .eq('id', svg.id);

      toast({
        title: "Downloaded",
        description: `${svg.name} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download SVG.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (svg: SVGData) => {
    try {
      const { data } = supabase.storage
        .from('svg-files')
        .getPublicUrl(svg.file_path);

      await navigator.clipboard.writeText(data.publicUrl);
      toast({
        title: "Copied",
        description: "SVG URL copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL.",
        variant: "destructive",
      });
    }
  };

  const handleFavorite = async (svg: SVGData) => {
    try {
      const newFavorited = !svg.favorited;
      await supabase
        .from('svgs')
        .update({ favorited: newFavorited })
        .eq('id', svg.id);

      setSvgs(prev => prev.map(s => 
        s.id === svg.id ? { ...s, favorited: newFavorited } : s
      ));

      toast({
        title: newFavorited ? "Favorited" : "Unfavorited",
        description: `${svg.name} has been ${newFavorited ? 'added to' : 'removed from'} favorites.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  // Filter SVGs based on search and tags
  const filteredSVGs = svgs.filter(svg => {
    const matchesSearch = svg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (svg.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = filterTag === "all" || (svg.tags || []).includes(filterTag);

    return matchesSearch && matchesTags;
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground">You need to be signed in to view projects.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading project...</p>
      </div>
    );
  }

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
              {project.is_public ? "Public" : "Private"}
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

  const SVGGridItem = ({ svg }: { svg: SVGData }) => (
    <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-square bg-muted/50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">{svg.name.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleDownload(svg)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleCopy(svg)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleFavorite(svg)}>
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
            <span>{svg.file_size ? `${(svg.file_size / 1024).toFixed(1)}kb` : 'N/A'}</span>
            <span>{svg.views || 0} views</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(svg.tags || []).slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SVGListItem = ({ svg }: { svg: SVGData }) => (
    <Card className="group hover:shadow-soft transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">{svg.name.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{svg.name}</h3>
            <p className="text-xs text-muted-foreground">{new Date(svg.created_at).toLocaleDateString()} • {svg.file_size ? `${(svg.file_size / 1024).toFixed(1)}kb` : 'N/A'}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {(svg.tags || []).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <div>{svg.views || 0} views</div>
            <div>{svg.downloads || 0} downloads</div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(svg)}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(svg)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleFavorite(svg)}>
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
            <div className={`h-16 w-16 rounded-xl ${project.color || 'bg-blue-500'} flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">
                {project.name.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground">{project.description || 'No description'}</p>
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
                  <p className="font-semibold text-lg">{svgs.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Views</p>
                  <p className="font-semibold text-lg">{svgs.reduce((sum, svg) => sum + (svg.views || 0), 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Downloads</p>
                  <p className="font-semibold text-lg">{svgs.reduce((sum, svg) => sum + (svg.downloads || 0), 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-semibold text-lg">{new Date(project.created_at).getFullYear()}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {project.is_public ? (
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
            <TabsTrigger value="all">All SVGs ({svgs.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/upload')}>
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
      {filteredSVGs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No SVGs found in this project.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/upload')}>
            <Plus className="h-4 w-4 mr-2" />
            Upload your first SVG
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredSVGs.map((svg) => (
            <SVGGridItem key={svg.id} svg={svg} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSVGs.map((svg) => (
            <SVGListItem key={svg.id} svg={svg} />
          ))}
        </div>
      )}
    </div>
  );
}