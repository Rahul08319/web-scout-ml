import { useEffect, useState } from "react";
import { History, Shield, Trash2, ArrowUpRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface HistoryScan {
  id: string;
  url: string;
  threat_score: number;
  threat_level: string;
  scanned_at: string;
}

interface ScanHistoryProps {
  onSelectUrl?: (url: string) => void;
}

export const ScanHistory = ({ onSelectUrl }: ScanHistoryProps) => {
  const [scans, setScans] = useState<HistoryScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    let loadedScans: HistoryScan[] = [];

    // 1. Try local storage first
    try {
      const local = localStorage.getItem("webscout_scans");
      if (local) {
        loadedScans = JSON.parse(local);
      }
    } catch (e) {
      console.warn("Could not read local scans:", e);
    }

    // 2. Try Supabase remote history if available
    try {
      const { data, error } = await supabase
        .from("url_scans")
        .select("id, url, threat_score, threat_level, scanned_at")
        .order("scanned_at", { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        // Merge without duplicates by URL and scanned_at
        const merged = [...data, ...loadedScans];
        const unique = Array.from(new Map(merged.map((item) => [item.url, item])).values());
        loadedScans = unique.slice(0, 10);
      }
    } catch {
      // Supabase is optional
    }

    setScans(loadedScans);
    setLoading(false);
  };

  const clearHistory = () => {
    localStorage.removeItem("webscout_scans");
    setScans([]);
  };

  const getThreatBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "safe":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "low":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "medium":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "high":
      case "critical":
        return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 text-center text-xs text-muted-foreground">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading inspection logs...</span>
      </div>
    );
  }

  if (scans.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pt-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent Audit Stream</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground font-mono">
            {scans.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-xs text-muted-foreground hover:text-destructive h-7 px-2.5 rounded-full"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      </div>

      <div className="liquid-glass rounded-3xl p-3 divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0 mr-4">
              <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium font-mono truncate text-foreground">
                  {scan.url}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(scan.scanned_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-mono font-bold text-foreground">
                {scan.threat_score}/100
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${getThreatBadgeVariant(
                  scan.threat_level
                )}`}
              >
                {scan.threat_level}
              </Badge>

              {onSelectUrl && (
                <button
                  onClick={() => onSelectUrl(scan.url)}
                  title="Rescan URL"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-primary hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};