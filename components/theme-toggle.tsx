"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-sm font-medium text-foreground shadow-sm transition hover:bg-card"
      aria-label="Toggle theme"
    >
      <span className="text-lg" role="img" aria-hidden>
        {mounted && isDark ? "🌙" : "☀️"}
      </span>
      <span className="hidden sm:inline">{mounted && isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
