import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SVGDisplayProps {
  svgId: string;
  filePath: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function SVGDisplay({ svgId, filePath, className = "", fallback }: SVGDisplayProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadSVG() {
      try {
        setIsLoading(true);
        setError("");
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('svg-files')
          .download(filePath);

        if (downloadError || !fileData) {
          throw new Error('Failed to load SVG file');
        }

        const text = await fileData.text();
        setSvgContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SVG');
      } finally {
        setIsLoading(false);
      }
    }

    loadSVG();
  }, [filePath]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return fallback || (
      <div className={`flex items-center justify-center text-muted-foreground ${className}`}>
        <span className="text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}