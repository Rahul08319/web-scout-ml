import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScanResult {
  threatScore: number;
  threatLevel: string;
  indicators: Array<{
    category: string;
    description: string;
    severity: string;
  }>;
  recommendation: string;
  detectedIssues: string[];
  safetyFeatures: string[];
}

interface UrlScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export const UrlScanner = ({ onScanComplete }: UrlScannerProps) => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url: url.startsWith('http') ? url : `https://${url}` }
      });

      if (error) throw error;

      onScanComplete(data);
      
      toast({
        title: "Scan Complete",
        description: "URL analysis finished successfully",
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to analyze URL",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-cyber mb-6 shadow-glow-blue">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
          Phishing Detector
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered URL analysis to protect you from phishing attacks and malicious websites
        </p>
      </div>

      <form onSubmit={handleScan} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to scan (e.g., https://example.com)"
              className="pl-12 h-14 text-lg border-2 focus:border-primary transition-all"
              disabled={isScanning}
            />
          </div>
          <Button 
            type="submit" 
            size="lg"
            disabled={isScanning}
            className="h-14 px-8 bg-gradient-cyber hover:opacity-90 transition-all shadow-glow-blue"
          >
            {isScanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Scan URL
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};