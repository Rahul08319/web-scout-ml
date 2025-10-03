import { useState } from "react";
import { UrlScanner } from "@/components/UrlScanner";
import { ScanResult } from "@/components/ScanResult";
import { ScanHistory } from "@/components/ScanHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ScanResultData {
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

const Index = () => {
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);

  const handleNewScan = () => {
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {!scanResult ? (
          <>
            <UrlScanner onScanComplete={setScanResult} />
            <ScanHistory />
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <Button 
                onClick={handleNewScan}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Scan Another URL
              </Button>
            </div>
            <ScanResult result={scanResult} />
            <div className="flex justify-center">
              <Button 
                onClick={handleNewScan}
                size="lg"
                className="bg-gradient-cyber hover:opacity-90 transition-all shadow-glow-blue"
              >
                Scan Another URL
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
