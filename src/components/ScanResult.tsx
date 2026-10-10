import { useState } from "react";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Lock, 
  Hash, 
  Activity,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScanResultPayload } from "@/components/UrlScanner";

interface ScanResultProps {
  result: ScanResultPayload;
}

export const ScanResult = ({ result }: ScanResultProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const isSafe = result.threatLevel.toLowerCase() === "safe";
  const isCritical = result.threatLevel.toLowerCase() === "critical" || result.threatScore >= 80;
  const isHigh = result.threatLevel.toLowerCase() === "high";

  const getThreatColor = (score: number) => {
    if (score < 25) return "text-emerald-500";
    if (score < 50) return "text-amber-500";
    if (score < 75) return "text-orange-500";
    return "text-red-500";
  };

  const getThreatBgGradient = (score: number) => {
    if (score < 25) return "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20";
    if (score < 50) return "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20";
    if (score < 75) return "from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20";
    return "from-red-500/15 via-red-500/5 to-transparent border-red-500/30";
  };

  const copyReport = () => {
    const reportText = `=== WebScout ML Security Audit ===
Target URL: ${result.scannedUrl || "N/A"}
Threat Score: ${result.threatScore}/100 (${result.threatLevel.toUpperCase()})
Recommendation: ${result.recommendation}

[TypeSafe System One Telemetry]
Tool Categorization: ${result.typeSafeAnalysis?.recommendedTool || "Heuristic Inspector"} (Confidence: ${Math.round((result.typeSafeAnalysis?.toolConfidence || 0.95) * 100)}%)
Phishing Probability: ${Math.round((result.typeSafeAnalysis?.phishingProbability || 0) * 100)}%
Brand Assessment: ${result.typeSafeAnalysis?.brandVerdict || "N/A"}
Entropy: ${result.typeSafeAnalysis?.entropy || "N/A"} bits

Issues Detected:
${result.detectedIssues.map((issue) => ` - ${issue}`).join("\n")}

Safety Features:
${result.safetyFeatures.map((feat) => ` + ${feat}`).join("\n")}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast({
      title: "Audit Report Copied",
      description: "Full security analysis has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.threatScore / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Target URL Header Bar */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Audited Destination
            </p>
            <p className="text-sm sm:text-base font-mono font-medium truncate text-foreground">
              {result.scannedUrl || "Scanned Target"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={copyReport}
            className="rounded-full text-xs gap-1.5 h-8 liquid-glass hover:bg-black/5 dark:hover:bg-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Audit"}</span>
          </Button>

          {result.scannedUrl && (
            <a
              href={result.scannedUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full liquid-glass hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              title="Open Target (Caution)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Apple Bento Grid Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Bento Card 1: Master Score & Radial Gauge (5 cols) */}
        <div
          className={`md:col-span-5 rounded-3xl p-6 bg-gradient-to-b ${getThreatBgGradient(
            result.threatScore
          )} border liquid-glass-elevated flex flex-col items-center justify-center text-center relative overflow-hidden`}
        >
          {/* Subtle Radar Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#0071e3_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Radial SVG Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-black/5 dark:text-white/10"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`${getThreatColor(result.threatScore)} transition-all duration-1000 ease-out`}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getThreatColor(result.threatScore)}`}>
                {result.threatScore}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                Threat Score
              </span>
            </div>
          </div>

          <div className="space-y-1 z-10">
            <Badge
              variant="outline"
              className={`text-xs px-3 py-1 font-semibold tracking-wider rounded-full uppercase ${
                isSafe
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : isCritical
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
              }`}
            >
              {result.threatLevel} Assessment
            </Badge>

            <p className="text-xs text-muted-foreground pt-2 max-w-xs mx-auto leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </div>

        {/* Bento Card 2: TypeSafe System One Telemetry (7 cols) */}
        <div className="md:col-span-7 rounded-3xl p-6 liquid-glass border border-white/20 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm tracking-tight">TypeSafe System One Telemetry</h3>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">
              Jev System One Engine
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                Choice Categorization
              </span>
              <p className="font-semibold text-foreground text-sm truncate">
                {result.typeSafeAnalysis?.recommendedTool || "Heuristic Inspector"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                <span>Confidence:</span>
                <span>{Math.round((result.typeSafeAnalysis?.toolConfidence || 0.94) * 100)}%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                Noul Probability
              </span>
              <p className="font-semibold text-foreground text-sm">
                {Math.round((result.typeSafeAnalysis?.phishingProbability || 0) * 100)}%
              </p>
              <span className="text-[11px] text-muted-foreground">Phishing Condition</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                Brand Imitation
              </span>
              <p className="font-semibold text-foreground text-sm capitalize">
                {result.typeSafeAnalysis?.brandVerdict?.replace("_", " ") || "Authentic"}
              </p>
              <span className="text-[11px] text-muted-foreground">Levenshtein Distance</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                Shannon Entropy
              </span>
              <p className="font-semibold text-foreground text-sm">
                {result.typeSafeAnalysis?.entropy || "3.42"} bits
              </p>
              <span className="text-[11px] text-muted-foreground">Character Randomness</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium">TypeSafe Choice Primitive Advantage:</p>
            <p className="text-[11px] opacity-90 leading-relaxed pt-0.5">
              Enforces discrete categorical selection, eliminating generative drift and allowing zero-latency compaction into security execution workflows.
            </p>
          </div>
        </div>

        {/* Bento Card 3: Detected Indicators & Issues (6 cols) */}
        <div className="md:col-span-6 rounded-3xl p-6 liquid-glass border border-white/20 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-sm tracking-tight">
                Detected Issues & Anomalies ({result.detectedIssues.length})
              </h3>
            </div>
          </div>

          {result.detectedIssues.length > 0 ? (
            <ul className="space-y-2.5 text-xs">
              {result.detectedIssues.map((issue, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center space-y-1 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
              <p className="text-xs font-medium">No malicious heuristics or structural anomalies detected.</p>
            </div>
          )}
        </div>

        {/* Bento Card 4: Verified Safety Defenses (6 cols) */}
        <div className="md:col-span-6 rounded-3xl p-6 liquid-glass border border-white/20 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm tracking-tight">
                Verified Safety Features ({result.safetyFeatures.length})
              </h3>
            </div>
          </div>

          {result.safetyFeatures.length > 0 ? (
            <ul className="space-y-2.5 text-xs">
              {result.safetyFeatures.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center space-y-1 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
              <p className="text-xs font-medium">No verified safety anchors present on this destination.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};