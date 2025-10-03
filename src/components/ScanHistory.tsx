import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HistoryScan {
  id: string;
  url: string;
  threat_score: number;
  threat_level: string;
  scanned_at: string;
}

export const ScanHistory = () => {
  const [scans, setScans] = useState<HistoryScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('url_scans')
        .select('id, url, threat_score, threat_level, scanned_at')
        .order('scanned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatBadgeVariant = (level: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (level.toLowerCase()) {
      case 'safe': return 'outline';
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high':
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (scans.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Recent Scans
        </CardTitle>
        <CardDescription>Your last 10 URL scans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium truncate">{scan.url}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{scan.threat_score}/100</span>
                <Badge variant={getThreatBadgeVariant(scan.threat_level)}>
                  {scan.threat_level}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};