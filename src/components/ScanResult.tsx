import { AlertTriangle, CheckCircle, Shield, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Indicator {
  category: string;
  description: string;
  severity: string;
}

interface ScanResultProps {
  result: {
    threatScore: number;
    threatLevel: string;
    indicators: Indicator[];
    recommendation: string;
    detectedIssues: string[];
    safetyFeatures: string[];
  };
}

const getThreatColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'safe': return 'bg-gradient-safe';
    case 'low': return 'bg-yellow-500';
    case 'medium': return 'bg-orange-500';
    case 'high': return 'bg-red-500';
    case 'critical': return 'bg-gradient-danger';
    default: return 'bg-gray-500';
  }
};

const getThreatIcon = (level: string) => {
  switch (level.toLowerCase()) {
    case 'safe': return <CheckCircle className="w-6 h-6" />;
    case 'low': return <Shield className="w-6 h-6" />;
    case 'medium': return <AlertTriangle className="w-6 h-6" />;
    case 'high': return <AlertTriangle className="w-6 h-6" />;
    case 'critical': return <XCircle className="w-6 h-6" />;
    default: return <Shield className="w-6 h-6" />;
  }
};

const getSeverityBadgeVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (severity.toLowerCase()) {
    case 'safe': return 'outline';
    case 'low': return 'secondary';
    case 'medium': return 'default';
    case 'high':
    case 'critical': return 'destructive';
    default: return 'default';
  }
};

export const ScanResult = ({ result }: ScanResultProps) => {
  const isSafe = result.threatLevel.toLowerCase() === 'safe';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Threat Score Card */}
      <Card className={`border-2 ${isSafe ? 'shadow-glow-green' : 'shadow-glow-red'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getThreatColor(result.threatLevel)} text-white`}>
                {getThreatIcon(result.threatLevel)}
              </div>
              <div>
                <CardTitle className="text-2xl">Threat Assessment</CardTitle>
                <CardDescription>Analysis complete</CardDescription>
              </div>
            </div>
            <Badge 
              variant={isSafe ? "outline" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {result.threatLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Threat Score</span>
              <span className="font-bold">{result.threatScore}/100</span>
            </div>
            <Progress 
              value={result.threatScore} 
              className="h-3"
            />
          </div>
          <div className={`p-4 rounded-lg ${isSafe ? 'bg-safe/10' : 'bg-destructive/10'}`}>
            <p className="font-medium mb-1">Recommendation:</p>
            <p className="text-sm">{result.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Security Indicators</CardTitle>
          <CardDescription>Detailed analysis of potential threats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.indicators.map((indicator, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <Badge variant={getSeverityBadgeVariant(indicator.severity)} className="mt-1">
                {indicator.severity}
              </Badge>
              <div className="flex-1">
                <p className="font-medium">{indicator.category}</p>
                <p className="text-sm text-muted-foreground">{indicator.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Issues and Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {result.detectedIssues.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Detected Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.detectedIssues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.safetyFeatures.length > 0 && (
          <Card className="border-safe/50">
            <CardHeader>
              <CardTitle className="text-safe flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Safety Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.safetyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-safe mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};