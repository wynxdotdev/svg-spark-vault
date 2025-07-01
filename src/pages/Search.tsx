import { useState } from "react";
import { Search as SearchIcon, Filter, Grid, List, Download, Heart, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock SVG data
const mockSVGs = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `icon-${i + 1}.svg`,
  project: ["UI Icons", "Illustrations", "Logos", "Social"][i % 4],
  tags: ["interface", "arrow", "navigation", "ui"].slice(0, Math.floor(Math.random() * 3) + 1),
  size: `${(Math.random() * 3 + 0.5).toFixed(1)}kb`,
  uploadedAt: `${Math.floor(Math.random() * 30) + 1} days ago`,
  favorited: Math.random() > 0.7,
  downloads: Math.floor(Math.random() * 100) + 10,
}));

const mockProjects = ["All Projects", "UI Icons", "Illustrations", "Logos", "Social", "E-commerce", "Random"];

const mockTags = ["interface", "arrow", "navigation", "ui", "social", "ecommerce", "illustration", "logo"];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const SVGGridItem = ({ svg }: { svg: typeof mockSVGs[0] }) => (
    <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-square bg-muted/50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {/* SVG Preview placeholder */}
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">{svg.name.charAt(0).toUpperCase()}</span>
          </div>
          
          {/* Hover actions */}
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
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate">{svg.name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{svg.project}</span>
            <span>{svg.size}</span>
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
            <p className="text-xs text-muted-foreground">{svg.project} • {svg.uploadedAt}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {svg.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground">{svg.size}</div>
          
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
                  {mockProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag) => (
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
            Showing {mockSVGs.length} results
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