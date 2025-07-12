import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings, Lock, Unlock, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface SVGSettingsProps {
  svg: any;
}

export function SVGSettings({ svg }: SVGSettingsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: svg.name,
    description: svg.description || "",
    project_id: svg.project_id,
    tags: svg.tags?.join(", ") || ""
  });

  // Only show if user owns the SVG
  if (!user || user.id !== svg.user_id) {
    return null;
  }

  const { data: userProjects } = useQuery({
    queryKey: ['user-projects', user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, name, color')
        .eq('user_id', user.id)
        .order('name');
      return data || [];
    }
  });

  const updateSVGMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('svgs')
        .update(updates)
        .eq('id', svg.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['svg-preview', svg.id] });
      toast({
        title: "SVG updated",
        description: "Your changes have been saved"
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update SVG",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    const updates = {
      name: formData.name,
      description: formData.description || null,
      project_id: formData.project_id,
      tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean) : null
    };
    
    updateSVGMutation.mutate(updates);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>SVG Settings</DialogTitle>
          <DialogDescription>
            Manage your SVG details and project assignment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="SVG name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select 
              value={formData.project_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {userProjects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${project.color || 'bg-blue-500'}`} />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateSVGMutation.isPending || !formData.name}
            >
              {updateSVGMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}