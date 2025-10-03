-- Create table for storing URL scan results
CREATE TABLE public.url_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  threat_score INTEGER NOT NULL CHECK (threat_score >= 0 AND threat_score <= 100),
  threat_level TEXT NOT NULL CHECK (threat_level IN ('safe', 'low', 'medium', 'high', 'critical')),
  analysis_result JSONB NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.url_scans ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for demonstration)
CREATE POLICY "Anyone can view scans"
ON public.url_scans
FOR SELECT
USING (true);

-- Create policy for public insert (for demonstration)
CREATE POLICY "Anyone can create scans"
ON public.url_scans
FOR INSERT
WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX idx_url_scans_created_at ON public.url_scans(created_at DESC);
CREATE INDEX idx_url_scans_threat_level ON public.url_scans(threat_level);