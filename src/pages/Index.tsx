import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { UrlScanner, ScanResultPayload } from "@/components/UrlScanner";
import { ScanResult } from "@/components/ScanResult";
import { ScanHistory } from "@/components/ScanHistory";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Lock, 
  Layers, 
  Calendar,
  Sparkles,
  ExternalLink 
} from "lucide-react";
import { getCurrentIntelligenceYear, getThreatEngineVersion } from "@/lib/threatDatabase";

const Index = () => {
  const [scanResult, setScanResult] = useState<ScanResultPayload | null>(null);
  const currentYear = getCurrentIntelligenceYear();
  const engineVersion = getThreatEngineVersion();

  const handleNewScan = () => {
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-blue-500/20 selection:text-blue-600">
      {/* Top Apple-Style Translucent Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-16 space-y-12">
        {!scanResult ? (
          <>
            {/* Primary Scanner Section */}
            <UrlScanner onScanComplete={setScanResult} />

            {/* Apple Bento Feature Cards */}
            <div className="pt-8 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Architecture Overview
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Engineered with Apple HIG Discipline & TypeSafe AI
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                {/* Bento Card 1 */}
                <div className="liquid-glass rounded-3xl p-6 space-y-3 hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    TypeSafe System One
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Employs discrete <span className="text-foreground font-medium">Choice</span>, <span className="text-foreground font-medium">Noul</span>, and <span className="text-foreground font-medium">Score</span> primitives from TypeSafe Jev model to ensure zero generative drift and instant tool categorization.
                  </p>
                </div>

                {/* Bento Card 2 */}
                <div className="liquid-glass rounded-3xl p-6 space-y-3 hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Deep Heuristics & Homoglyphs
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluates Shannon lexical entropy, Punycode (<span className="font-mono text-foreground">xn--</span>) unicode homograph attacks, and Levenshtein distance against major protected banking and cloud targets.
                  </p>
                </div>

                {/* Bento Card 3 */}
                <div className="liquid-glass rounded-3xl p-6 space-y-3 hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    Evergreen Self-Updating
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dynamic time engine synchronizes threat databases and scheduled GitHub Actions workflows automatically across <span className="text-foreground font-medium">{currentYear}</span>, <span className="text-foreground font-medium">{currentYear + 1}</span>, and beyond.
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Stream History */}
            <ScanHistory />
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Back Action Bar */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handleNewScan}
                variant="outline"
                size="sm"
                className="rounded-full gap-2 liquid-glass hover:bg-black/5 dark:hover:bg-white/10 text-xs h-9 px-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Scan Another URL</span>
              </Button>

              <span className="text-xs font-mono text-muted-foreground">
                Engine {engineVersion}
              </span>
            </div>

            {/* Render Bento Assessment Result */}
            <ScanResult result={scanResult} />

            {/* Bottom Centered Reset Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleNewScan}
                size="lg"
                className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm tracking-wide shadow-md shadow-blue-500/30 transition-all active:scale-95 duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Inspect New Destination
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Auto-Updating Footer */}
      <footer className="w-full border-t border-black/5 dark:border-white/5 py-8 mt-auto bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              &copy; 2024&ndash;{currentYear} WebScout ML. Developed by{" "}
              <a 
                href="https://github.com/Rahul08319" 
                target="_blank" 
                rel="noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                Rahul08319
              </a>.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">
              TypeSafe Jev v1
            </span>
            <a
              href="https://github.com/Rahul08319/web-scout-ml"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
