-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create tables for projects and SVGs
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-blue-500',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.svgs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  tags TEXT[],
  description TEXT,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  favorited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.svgs ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for SVGs
CREATE POLICY "Users can view their own SVGs" 
ON public.svgs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SVGs" 
ON public.svgs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SVGs" 
ON public.svgs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SVGs" 
ON public.svgs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for SVG files
INSERT INTO storage.buckets (id, name, public)
VALUES ('svg-files', 'svg-files', true);

-- Create storage policies for SVG uploads
CREATE POLICY "SVG files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'svg-files');

CREATE POLICY "Users can upload their own SVGs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'svg-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own SVGs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'svg-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own SVGs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'svg-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at columns
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_svgs_updated_at
BEFORE UPDATE ON public.svgs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();