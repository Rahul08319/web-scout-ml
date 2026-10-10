/**
 * WebScout ML - TypeSafe AI Core System One Engine
 *
 * Implements TypeSafe System One judgments (Jev model primitives: Choice, Noul, Score)
 * for high-speed URL semantic triage, tool categorization, and phishing compaction.
 *
 * Designed according to TypeSafe prompting best practices:
 * - Atomic, coherent judgments per question
 * - Explicit typed state referencing via backticked paths (`state.hostname`, etc.)
 * - Defined criteria with concrete semantic boundaries and edge cases
 * - Guaranteed type contracts with calibrated distribution probabilities
 */

// ---------------------------------------------------------------------------
// TypeSafe System One Primitives & Contracts
// ---------------------------------------------------------------------------

export type PrimitiveType = 'choice' | 'noul' | 'score';

export interface ChoiceCriterion {
  id: string;
  label: string;
  description: string;
  examples?: string[];
}

export interface ChoiceQuestion<TState = unknown> {
  id: string;
  primitive: 'choice';
  instructions: string;
  criteria: ChoiceCriterion[];
  fallbackChoiceId?: string;
}

export interface NoulQuestion<TState = unknown> {
  id: string;
  primitive: 'noul';
  instructions: string;
  condition: string;
}

export interface ScoreLevel {
  value: number;
  label: string;
  description: string;
}

export interface ScoreQuestion<TState = unknown> {
  id: string;
  primitive: 'score';
  instructions: string;
  levels: ScoreLevel[];
}

export type TypeSafeQuestion<TState = unknown> =
  | ChoiceQuestion<TState>
  | NoulQuestion<TState>
  | ScoreQuestion<TState>;

// ---------------------------------------------------------------------------
// URL Inspection State Schema
// ---------------------------------------------------------------------------

export interface UrlInspectionState {
  raw_url: string;
  hostname: string;
  protocol: string;
  pathname: string;
  search_params: string;
  subdomain_depth: number;
  entropy: number;
  has_ip_literal: boolean;
  has_punycode_homograph: boolean;
  tld: string;
  is_known_suspicious_tld: boolean;
  suspicious_keywords: string[];
  target_brand_candidate?: string;
  levenshtein_distance_to_target?: number;
  has_ssl: boolean;
  url_length: number;
  created_year: number;
}

// ---------------------------------------------------------------------------
// TypeSafe Question Definitions
// Adhering strictly to TypeSafe prompting standards:
// 1. One atomic judgment per question
// 2. Concrete state backticking
// 3. Clear mutually-exclusive criteria with explicit fallbacks
// ---------------------------------------------------------------------------

export const TOOL_CATEGORIZATION_QUESTION: ChoiceQuestion<UrlInspectionState> = {
  id: "tool_categorization",
  primitive: "choice",
  instructions:
    "Evaluate the primary operational capability required to analyze `state.raw_url` based on observed indicators such as `state.has_ip_literal`, `state.has_punycode_homograph`, and `state.entropy`. Assign exactly one operational module.",
  criteria: [
    {
      id: "heuristic_inspector",
      label: "Heuristic Structural Inspector",
      description:
        "Fast local cryptographic entropy, character composition, homoglyph detection, and URL-encoding structural parsing.",
      examples: ["Punycode domains", "IP-based URLs", "High entropy paths"],
    },
    {
      id: "reputation_feed_lookup",
      label: "Reputation Threat Feed Lookup",
      description:
        "Deterministic querying of known phishing blacklists, newly registered domain (NRD) feeds, and ASN telemetry.",
      examples: ["Newly registered TLDs", "Known phishing domain hits"],
    },
    {
      id: "content_deep_scanner",
      label: "Deep Content DOM & OCR Scanner",
      description:
        "Headless browser emulation, login form credential harvesting inspection, and brand logo visual matching.",
      examples: ["Legitimate brand clone pages", "Fake OAuth login forms"],
    },
    {
      id: "remediation_actor",
      label: "Remediation & Takedown Actor",
      description:
        "Post-classification enforcement: generating firewall rules, reporting to domain registrars, or blocking browser navigation.",
      examples: ["High-confidence active phishing blocks", "SIEM incident escalation"],
    },
  ],
  fallbackChoiceId: "heuristic_inspector",
};

export const PHISHING_INTENT_QUESTION: NoulQuestion<UrlInspectionState> = {
  id: "phishing_intent",
  primitive: "noul",
  instructions:
    "Determine whether `state.raw_url` exhibits deceptive intent intended to harvest credentials, deceive users into downloading malware, or spoof trusted identity infrastructure.",
  condition:
    "`state.has_punycode_homograph` is true OR `state.levenshtein_distance_to_target` <= 2 OR `state.is_known_suspicious_tld` is true with brand keywords in `state.suspicious_keywords`",
};

export const BRAND_IMPERSONATION_QUESTION: ChoiceQuestion<UrlInspectionState> = {
  id: "brand_impersonation",
  primitive: "choice",
  instructions:
    "Analyze `state.hostname` against the detected target brand candidate `state.target_brand_candidate`. Decide whether the domain is an authentic brand property, an adversarial typosquatting attempt, or an unrelated neutral entity.",
  criteria: [
    {
      id: "authentic_brand",
      label: "Authentic Official Domain",
      description:
        "The domain is the verified authoritative digital property of the identified brand.",
      examples: ["apple.com", "accounts.google.com", "paypal.com"],
    },
    {
      id: "adversarial_typosquat",
      label: "Adversarial Typosquat / Lookalike",
      description:
        "The domain mimics a recognizable brand through character omission, replacement, sub-domain prepend, or homoglyph spoofing.",
      examples: ["paypa1-security.com", "apple-id-verify.top", "g00gle.support"],
    },
    {
      id: "unrelated_neutral",
      label: "Unrelated Neutral Entity",
      description:
        "The domain does not intentionally impersonate the candidate brand and operates as a benign or unrelated site.",
      examples: ["appleorchardfarm.org", "pine-mountain.net"],
    },
    {
      id: "inconclusive",
      label: "Inconclusive / Insufficient Evidence",
      description:
        "The domain contains generic terms without unambiguous brand attribution.",
      examples: ["secure-portal-login.xyz"],
    },
  ],
  fallbackChoiceId: "inconclusive",
};

export const THREAT_SEVERITY_SCORE_QUESTION: ScoreQuestion<UrlInspectionState> = {
  id: "threat_severity_score",
  primitive: "score",
  instructions:
    "Evaluate the aggregate threat severity level of `state.raw_url` based on combined signals from `state.entropy`, `state.subdomain_depth`, and SSL status `state.has_ssl`.",
  levels: [
    {
      value: 0,
      label: "Benign / Verified Safe",
      description:
        "No indicators of compromise detected; reputable domain with valid TLS/SSL and legitimate naming structure.",
    },
    {
      value: 25,
      label: "Low Risk / Informational",
      description:
        "Minor atypical patterns detected, such as excessive query parameters or newly assigned generic TLD.",
    },
    {
      value: 50,
      label: "Suspicious / Moderate Risk",
      description:
        "Multiple anomalous signals detected: high entropy, multiple sub-domain redirects, or unverified SSL.",
    },
    {
      value: 75,
      label: "High Risk / Probable Phish",
      description:
        "Strong heuristic match for credential phishing, deceptive brand mimicry, or IP-direct URL.",
    },
    {
      value: 100,
      label: "Critical / Confirmed Malicious",
      description:
        "Confirmed phishing infrastructure, known active zero-day campaign, or homograph credential trap.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Client-Side TypeSafe Evaluation Engine (Deterministic ML / Heuristics)
// Provides instant offline fallback and real-time telemetry when Supabase
// edge function is unreachable or running in preview mode.
// ---------------------------------------------------------------------------

const TARGET_BRANDS = [
  "apple",
  "google",
  "microsoft",
  "paypal",
  "netflix",
  "amazon",
  "chase",
  "wellsfargo",
  "bankofamerica",
  "instagram",
  "facebook",
  "twitter",
  "coinbase",
  "binance",
  "dropbox",
  "github",
  "steam",
];

const SUSPICIOUS_TLDS = [
  "zip",
  "mov",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "top",
  "xyz",
  "click",
  "link",
  "country",
  "kim",
  "science",
  "work",
];

const PHISHING_KEYWORDS = [
  "login",
  "verify",
  "account",
  "security",
  "banking",
  "update",
  "confirm",
  "password",
  "recover",
  "billing",
  "suspended",
  "wallet",
  "support",
  "auth",
  "signin",
  "portal",
];

function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies = new Map<string, number>();
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function extractUrlState(rawInput: string): UrlInspectionState {
  const normalized = rawInput.trim().startsWith("http")
    ? rawInput.trim()
    : `https://${rawInput.trim()}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    parsed = new URL("https://invalid-url.local");
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;
  const parts = hostname.split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "";
  const subdomainCount = Math.max(0, parts.length - 2);

  // Check for IP literal
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hasIpLiteral = ipRegex.test(hostname);

  // Check for Punycode / Homograph
  const hasPunycode = hostname.includes("xn--");

  // Entropy of domain + path
  const entropy = calculateEntropy(hostname + pathname);

  // Suspicious keywords found
  const fullUrlLower = normalized.toLowerCase();
  const matchedKeywords = PHISHING_KEYWORDS.filter((kw) =>
    fullUrlLower.includes(kw)
  );

  // Typosquat brand check
  let targetBrandCandidate: string | undefined;
  let minDistance = 999;
  for (const brand of TARGET_BRANDS) {
    if (hostname.includes(brand)) {
      targetBrandCandidate = brand;
      minDistance = 0;
      break;
    }
    // Check segments for fuzzy distance
    for (const segment of parts) {
      if (segment.length >= 4) {
        const dist = levenshteinDistance(segment, brand);
        if (dist > 0 && dist <= 2 && dist < minDistance) {
          minDistance = dist;
          targetBrandCandidate = brand;
        }
      }
    }
  }

  return {
    raw_url: normalized,
    hostname,
    protocol: parsed.protocol,
    pathname,
    search_params: parsed.search,
    subdomain_depth: subdomainCount,
    entropy,
    has_ip_literal: hasIpLiteral,
    has_punycode_homograph: hasPunycode,
    tld,
    is_known_suspicious_tld: SUSPICIOUS_TLDS.includes(tld),
    suspicious_keywords: matchedKeywords,
    target_brand_candidate: targetBrandCandidate,
    levenshtein_distance_to_target:
      minDistance < 999 ? minDistance : undefined,
    has_ssl: parsed.protocol === "https:",
    url_length: normalized.length,
    created_year: new Date().getFullYear(),
  };
}

export interface SecurityEvaluationResult {
  threatScore: number;
  threatLevel: "safe" | "low" | "medium" | "high" | "critical";
  recommendation: string;
  detectedIssues: string[];
  safetyFeatures: string[];
  indicators: Array<{
    category: string;
    description: string;
    severity: "safe" | "low" | "medium" | "high" | "critical";
  }>;
  typeSafeAnalysis: {
    recommendedTool: string;
    toolConfidence: number;
    phishingProbability: number;
    brandVerdict: string;
    entropy: number;
    yearBaseline: number;
  };
}

/**
 * Execute TypeSafe System One judgments against extracted state
 */
export function evaluateUrlWithTypeSafe(
  state: UrlInspectionState
): SecurityEvaluationResult {
  let score = 0;
  const detectedIssues: string[] = [];
  const safetyFeatures: string[] = [];
  const indicators: SecurityEvaluationResult["indicators"] = [];

  // 1. SSL / Protocol check
  if (state.has_ssl) {
    safetyFeatures.push("Valid HTTPS transport layer encryption detected");
  } else {
    score += 25;
    detectedIssues.push("Unencrypted HTTP transmission protocol");
    indicators.push({
      category: "Transport Security",
      description: "URL operates over plain HTTP without TLS encryption",
      severity: "high",
    });
  }

  // 2. Punycode / Homograph attack
  if (state.has_punycode_homograph) {
    score += 45;
    detectedIssues.push("Internationalized Domain Name (Punycode / Homograph) spoofing detected");
    indicators.push({
      category: "Domain Spoofing",
      description: "Host uses xn-- encoding to visually mimic legitimate Latin letters",
      severity: "critical",
    });
  }

  // 3. IP address literal
  if (state.has_ip_literal) {
    score += 40;
    detectedIssues.push("Direct raw IP address in URL hostname bypasses standard DNS resolution");
    indicators.push({
      category: "URL Obfuscation",
      description: "Direct IP address usage is commonly linked to unindexed credential harvest servers",
      severity: "high",
    });
  }

  // 4. Typosquatting / Brand impersonation
  if (
    state.target_brand_candidate &&
    state.levenshtein_distance_to_target !== undefined &&
    state.levenshtein_distance_to_target > 0 &&
    state.levenshtein_distance_to_target <= 2
  ) {
    score += 45;
    detectedIssues.push(
      `Typosquatting detected: Spoofs brand '${state.target_brand_candidate}' (Levenshtein distance: ${state.levenshtein_distance_to_target})`
    );
    indicators.push({
      category: "Brand Mimicry",
      description: `Domain subtly mimics legitimate brand '${state.target_brand_candidate}' to deceive users`,
      severity: "critical",
    });
  } else if (
    state.target_brand_candidate &&
    state.levenshtein_distance_to_target === 0
  ) {
    // Exact brand match
    if (
      state.hostname === `${state.target_brand_candidate}.com` ||
      state.hostname.endsWith(`.${state.target_brand_candidate}.com`)
    ) {
      safetyFeatures.push(`Authoritative verified domain for ${state.target_brand_candidate}`);
    } else {
      score += 20;
      detectedIssues.push(
        `Brand name '${state.target_brand_candidate}' embedded in third-party or sub-domain structure`
      );
      indicators.push({
        category: "Subdomain Phishing",
        description: `Legitimate brand name placed in subdomain to mislead user about origin`,
        severity: "medium",
      });
    }
  }

  // 5. Suspicious TLD
  if (state.is_known_suspicious_tld) {
    score += 25;
    detectedIssues.push(`Top-Level Domain (.${state.tld}) has high statistical malware & phishing abuse rate`);
    indicators.push({
      category: "TLD Reputation",
      description: `Domain uses high-abuse TLD (.${state.tld}) frequently leveraged by disposable campaigns`,
      severity: "high",
    });
  }

  // 6. Keywords
  if (state.suspicious_keywords.length > 0) {
    if (state.suspicious_keywords.length >= 2) {
      score += 20;
    } else {
      score += 10;
    }
    detectedIssues.push(`Sensitive authentication keywords found: ${state.suspicious_keywords.join(", ")}`);
    indicators.push({
      category: "Content Intent",
      description: `URL contains sensitive action triggers: ${state.suspicious_keywords.join(", ")}`,
      severity: state.suspicious_keywords.length >= 2 ? "high" : "medium",
    });
  }

  // 7. Entropy & structure
  if (state.entropy > 4.2) {
    score += 15;
    detectedIssues.push(`High Shannon entropy (${state.entropy} bits) indicating algorithmic pseudo-random generation`);
    indicators.push({
      category: "Structural Entropy",
      description: "Path and subdomain characters exhibit characteristics of automated DGA generation",
      severity: "medium",
    });
  } else {
    safetyFeatures.push("Normal linguistic character distribution and low algorithmic entropy");
  }

  if (state.subdomain_depth > 2) {
    score += 15;
    detectedIssues.push(`Excessive subdomain nesting depth (${state.subdomain_depth} levels)`);
  }

  // Clamp threat score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine threat level
  let threatLevel: SecurityEvaluationResult["threatLevel"] = "safe";
  let recommendation = "This URL appears authentic and safe to browse.";

  if (finalScore >= 80) {
    threatLevel = "critical";
    recommendation =
      "CRITICAL DANGER: High probability of phishing or credential theft. Do NOT visit this link or enter passwords.";
  } else if (finalScore >= 55) {
    threatLevel = "high";
    recommendation =
      "WARNING: Strong malicious indicators detected. Exercise extreme caution; do not submit sensitive data.";
  } else if (finalScore >= 30) {
    threatLevel = "medium";
    recommendation =
      "CAUTION: Several suspicious indicators observed. Verify the destination identity before proceeding.";
  } else if (finalScore > 10) {
    threatLevel = "low";
    recommendation =
      "LOW RISK: Minor anomalies detected, but no clear deception signature. Safe for regular browsing with standard caution.";
  } else {
    threatLevel = "safe";
    if (safetyFeatures.length === 0) {
      safetyFeatures.push("Clean domain structure with no known threat telemetry markers");
    }
  }

  // TypeSafe Tool Selection & Compaction Choice
  let recommendedTool = "reputation_feed_lookup";
  let toolConfidence = 0.88;
  if (state.has_ip_literal || state.has_punycode_homograph || state.entropy > 4.2) {
    recommendedTool = "heuristic_inspector";
    toolConfidence = 0.96;
  } else if (finalScore >= 75) {
    recommendedTool = "remediation_actor";
    toolConfidence = 0.94;
  } else if (state.suspicious_keywords.length > 0) {
    recommendedTool = "content_deep_scanner";
    toolConfidence = 0.91;
  }

  const phishingProb = Number((finalScore / 100).toFixed(2));
  const brandVerdict = state.target_brand_candidate
    ? (state.levenshtein_distance_to_target === 0
      ? "authentic_brand"
      : "adversarial_typosquat")
    : "unrelated_neutral";

  return {
    threatScore: finalScore,
    threatLevel,
    recommendation,
    detectedIssues,
    safetyFeatures,
    indicators,
    typeSafeAnalysis: {
      recommendedTool,
      toolConfidence,
      phishingProbability: phishingProb,
      brandVerdict,
      entropy: state.entropy,
      yearBaseline: state.created_year,
    },
  };
}
