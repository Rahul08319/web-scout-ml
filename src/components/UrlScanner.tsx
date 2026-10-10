import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, ArrowRight, Zap, CheckCircle2, AlertTriangle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractUrlState, evaluateUrlWithTypeSafe } from "@/core";

export interface ScanResultPayload {
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
  typeSafeAnalysis?: {
    recommendedTool: string;
    toolConfidence: number;
    phishingProbability: number;
    brandVerdict: string;
    entropy: number;
    yearBaseline: number;
  };
  scannedUrl?: string;
}

interface UrlScannerProps {
  onScanComplete: (result: ScanResultPayload) => void;
}

const SAMPLE_PRESETS = [
  {
    label: "Apple (Official)",
    url: "https://apple.com/iphone-16-pro",
    badge: "Verified Safe",
    type: "safe",
  },
  {
    label: "PayPal Phish",
    url: "http://paypa1-security-verification.xyz/login",
    badge: "Typosquat Phish",
    type: "danger",
  },
  {
    label: "IP Credential Trap",
    url: "http://192.168.1.185:8080/secure/bank/login.php",
    badge: "Direct IP Host",
    type: "danger",
  },
  {
    label: "DGA Phishing Domain",
    url: "https://x89q-secure-account-auth7812.tk/update",
    badge: "High Entropy",
    type: "warning",
  },
];

export const UrlScanner = ({ onScanComplete }: UrlScannerProps) => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const { toast } = useToast();

  const SCAN_STEPS = [
    "Establishing TLS cryptographic handshake...",
    "Computing Shannon lexical entropy...",
    "Executing TypeSafe System One Choice categorization...",
    "Evaluating Brand Impersonation & Typosquat distance...",
    "Finalizing threat severity vectors...",
  ];

  const handleScanWithUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid website URL to inspect.",
        variant: "destructive",
      });
      return;
    }

    const cleanUrl = targetUrl.trim().startsWith("http")
      ? targetUrl.trim()
      : `https://${targetUrl.trim()}`;

    try {
      new URL(cleanUrl);
    } catch {
      toast({
        title: "Invalid URL Format",
        description: "Please provide a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanStepIndex(0);

    // Realistic scanning step choreography (Apple spring timing)
    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      // 1. Compute local TypeSafe System One evaluation immediately
      const state = extractUrlState(cleanUrl);
      const localEvaluation = evaluateUrlWithTypeSafe(state);

      let finalResult: ScanResultPayload = {
        threatScore: localEvaluation.threatScore,
        threatLevel: localEvaluation.threatLevel,
        indicators: localEvaluation.indicators,
        recommendation: localEvaluation.recommendation,
        detectedIssues: localEvaluation.detectedIssues,
        safetyFeatures: localEvaluation.safetyFeatures,
        typeSafeAnalysis: localEvaluation.typeSafeAnalysis,
        scannedUrl: cleanUrl,
      };

      // 2. Try Supabase Edge Function if available
      try {
        const { data, error } = await supabase.functions.invoke("analyze-url", {
          body: { url: cleanUrl },
        });

        if (!error && data && typeof data.threatScore === "number") {
          finalResult = {
            ...data,
            typeSafeAnalysis: localEvaluation.typeSafeAnalysis,
            scannedUrl: cleanUrl,
          };
        }
      } catch (remoteError) {
        console.warn("Supabase remote endpoint bypassed, using TypeSafe System One local engine.", remoteError);
      }

      // Small delay to allow user to see the scanning choreography finish smoothly
      await new Promise((r) => setTimeout(r, 1600));

      // Persist in local storage for history
      try {
        const existingHistory = JSON.parse(localStorage.getItem("webscout_scans") || "[]");
        const newRecord = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: cleanUrl,
          threat_score: finalResult.threatScore,
          threat_level: finalResult.threatLevel,
          scanned_at: new Date().toISOString(),
        };
        localStorage.setItem(
          "webscout_scans",
          JSON.stringify([newRecord, ...existingHistory.slice(0, 19)])
        );
      } catch (e) {
        console.error("Local storage error:", e);
      }

      clearInterval(stepInterval);
      onScanComplete(finalResult);

      toast({
        title: "Triage Complete",
        description: `Threat score: ${finalResult.threatScore}/100 (${finalResult.threatLevel.toUpperCase()})`,
      });
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Scan error:", error);
      toast({
        title: "Inspection Encountered An Error",
        description: error instanceof Error ? error.message : "Failed to analyze URL",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanWithUrl(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Apple-Style Hero Headline */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass text-xs font-medium text-foreground tracking-wide mb-2 animate-in fade-in zoom-in duration-700">
          <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>Next-Generation Semantic URL Triage</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
          Intelligent URL Defense.
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Guaranteed by TypeSafe System One.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
          Zero-latency neural analysis for deceptive homoglyphs, brand spoofing, and credential harvesting using calibrated System One primitives.
        </p>
      </div>

      {/* Main Apple Search Capsule */}
      <div className="relative">
        <div className="liquid-glass-elevated rounded-2xl sm:rounded-full p-2.5 sm:p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter any domain or URL to inspect (e.g. https://apple.com)"
                className="pl-12 pr-4 h-13 sm:h-14 bg-transparent border-0 text-base sm:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 rounded-full"
                disabled={isScanning}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isScanning}
              className="w-full sm:w-auto h-12 sm:h-13 px-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm tracking-wide shadow-md shadow-blue-500/30 transition-all active:scale-95 duration-200"
            >
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inspecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Analyze URL</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Realistic Scanning Laser Feedback */}
        {isScanning && (
          <div className="mt-4 liquid-glass rounded-2xl p-4 text-center space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>{SCAN_STEPS[scanStepIndex]}</span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${((scanStepIndex + 1) / SCAN_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preset Sample Quick-Chips */}
      <div className="space-y-2 text-center pt-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quick Evaluation Presets
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isScanning}
              onClick={() => {
                setUrl(preset.url);
                handleScanWithUrl(preset.url);
              }}
              className="group liquid-glass hover:bg-white/80 dark:hover:bg-white/10 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-foreground transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {preset.type === "safe" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : preset.type === "danger" ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="font-medium">{preset.label}</span>
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};