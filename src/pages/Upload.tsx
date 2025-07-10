import { useState, useCallback, useEffect } from "react";
import { Upload as UploadIcon, File, X, FolderPlus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProjectData {
  id: string;
  name: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
}

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
      
      // Set first project as default if available
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'image/svg+xml' || file.name.endsWith('.svg')
    );
    
    if (files.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload only SVG files.",
        variant: "destructive",
      });
      return;
    }

    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files).filter(file => 
      file.type === 'image/svg+xml' || file.name.endsWith('.svg')
    );
    
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select SVG files to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "No project selected",
        description: "Please select a project for your SVGs.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to upload SVGs.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        // Create unique file path
        const fileExt = uploadedFile.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('svg-files')
          .upload(fileName, uploadedFile.file);

        if (uploadError) throw uploadError;

        // Save SVG metadata to database
        const { error: dbError } = await supabase
          .from('svgs')
          .insert({
            user_id: user.id,
            project_id: selectedProject,
            name: uploadedFile.file.name,
            file_path: fileName,
            file_size: uploadedFile.file.size,
            tags: tags.length > 0 ? tags : null,
            description: description || null,
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Upload successful!",
        description: `${uploadedFiles.length} SVG${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully.`,
      });
      
      // Reset form
      setUploadedFiles([]);
      setTags([]);
      setDescription("");
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload one or more files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload SVGs</h1>
        <p className="text-muted-foreground">Add new SVG icons to your collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
              <CardDescription>Upload SVG files to your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
              >
                <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Drop SVG files here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                
                <input
                  type="file"
                  multiple
                  accept=".svg,image/svg+xml"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {uploadedFiles.map((uploadedFile) => (
                    <div key={uploadedFile.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{uploadedFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFile(uploadedFile.id)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upload Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full">
                  <FolderPlus className="h-4 w-4" />
                  Create New Project
                </Button>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="icon" variant="outline">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Add a description for these SVGs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Button */}
          <Button 
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || !selectedProject || uploading}
            className="w-full"
            size="lg"
            variant="gradient"
          >
            <UploadIcon className="h-4 w-4" />
            {uploading ? 'Uploading...' : `Upload ${uploadedFiles.length > 0 ? `${uploadedFiles.length} ` : ''}SVG${uploadedFiles.length !== 1 ? 's' : ''}`}
          </Button>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Only SVG files are supported</p>
              <p>• Maximum file size: 5MB per SVG</p>
              <p>• Files will be automatically optimized</p>
              <p>• Add relevant tags for better organization</p>
              <p>• Use descriptive filenames</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}