import { Shield, Sparkles, Sun, Moon, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { getThreatEngineVersion, getCurrentIntelligenceYear } from "@/lib/threatDatabase";

export const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const version = getThreatEngineVersion();
  const year = getCurrentIntelligenceYear();

  useEffect(() => {
    // Check initial system or stored theme
    const isDarkMode = document.documentElement.classList.contains("dark") || 
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-4 z-50 w-full max-w-5xl mx-auto px-4 mb-8">
      <nav className="liquid-glass-elevated rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300">
        {/* Brand & Symbol */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight">WebScout ML</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" />
                TypeSafe System One
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Neural Phishing & Threat Triage
            </span>
          </div>
        </div>

        {/* Status Pill & Engine Version */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs text-muted-foreground border border-black/5 dark:border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">{version}</span>
            <span className="text-[10px] text-muted-foreground/75 font-sans">({year})</span>
          </div>

          <a
            href="https://github.com/Rahul08319/web-scout-ml"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>GitHub</span>
          </a>

          {/* Cupertino Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground transition-transform active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </nav>
    </header>
  );
};
