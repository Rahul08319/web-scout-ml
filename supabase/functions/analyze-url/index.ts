import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Analyzing URL:', url);

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Analyze URL with AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert cybersecurity analyst specializing in phishing detection. Analyze URLs for phishing indicators and provide a detailed security assessment.

Return ONLY valid JSON with this exact structure:
{
  "threatScore": <number 0-100>,
  "threatLevel": "<safe|low|medium|high|critical>",
  "indicators": [
    { "category": "<string>", "description": "<string>", "severity": "<safe|low|medium|high|critical>" }
  ],
  "recommendation": "<string>",
  "detectedIssues": ["<string>"],
  "safetyFeatures": ["<string>"]
}

Analyze based on:
- Domain legitimacy and age
- URL structure and obfuscation
- HTTPS presence
- Known phishing patterns
- Suspicious keywords
- Typosquatting attempts
- URL shorteners
- IP addresses instead of domains
- Suspicious TLDs (.tk, .ml, .ga, etc.)
- Homograph attacks (using similar-looking characters)`
          },
          {
            role: 'user',
            content: `Analyze this URL for phishing indicators: ${url}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const analysisText = aiData.choices[0].message.content;
    
    // Parse the JSON response from AI
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    // Store the scan result in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from('url_scans')
      .insert({
        url,
        threat_score: analysis.threatScore,
        threat_level: analysis.threatLevel,
        analysis_result: analysis,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if DB insert fails
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-url function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});