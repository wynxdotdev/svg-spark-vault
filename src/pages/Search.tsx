import { useState, useEffect } from "react";
import { Search as SearchIcon, Filter, Grid, List, Download, Heart, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SVGData {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  tags: string[] | null;
  downloads: number | null;
  favorited: boolean | null;
  created_at: string;
  projects: {
    name: string;
  } | null;
}

interface ProjectData {
  id: string;
  name: string;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [svgs, setSvgs] = useState<SVGData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch SVGs with project names
      const { data: svgData, error: svgError } = await supabase
        .from('svgs')
        .select(`
          id,
          name,
          file_path,
          file_size,
          tags,
          downloads,
          favorited,
          created_at,
          projects (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (svgError) throw svgError;

      // Fetch projects
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (projectError) throw projectError;

      setSvgs(svgData || []);
      setProjects(projectData || []);

      // Extract unique tags
      const tags = new Set<string>();
      svgData?.forEach(svg => {
        svg.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load SVGs and projects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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

  // Filter SVGs based on search, project, and tags
  const filteredSVGs = svgs.filter(svg => {
    const matchesSearch = svg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         svg.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProject = selectedProject === "All Projects" || 
                          svg.projects?.name === selectedProject;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => svg.tags?.includes(tag));

    return matchesSearch && matchesProject && matchesTags;
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground">You need to be signed in to search SVGs.</p>
      </div>
    );
  }

  const SVGGridItem = ({ svg }: { svg: SVGData }) => (
    <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-square bg-muted/50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {/* SVG Preview placeholder */}
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">{svg.name.charAt(0).toUpperCase()}</span>
          </div>
          
          {/* Hover actions */}
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
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate">{svg.name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{svg.projects?.name || 'No Project'}</span>
            <span>{svg.file_size ? `${(svg.file_size / 1024).toFixed(1)}kb` : 'N/A'}</span>
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
            <p className="text-xs text-muted-foreground">{svg.projects?.name || 'No Project'} • {new Date(svg.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {(svg.tags || []).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground">{svg.file_size ? `${(svg.file_size / 1024).toFixed(1)}kb` : 'N/A'}</div>
          
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
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Search SVGs</h1>
          <p className="text-muted-foreground">Find and manage your SVG icons across all projects</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, tags, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Project Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Projects">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label htmlFor={tag} className="text-sm cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `Showing ${filteredSVGs.length} results`}
          </p>
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Filtered by:</span>
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p>Loading SVGs...</p>
        </div>
      ) : filteredSVGs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No SVGs found matching your criteria.</p>
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