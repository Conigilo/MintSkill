"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle({ className, showLabel, iconSize = "h-5 w-5" }: { className?: string, showLabel?: boolean, iconSize?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={className || "fixed top-4 right-4 z-[9999] p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-105 transition-transform"}
      aria-label="Toggle Dark Mode"
    >
      <div className="flex items-center justify-center gap-2">
        {resolvedTheme === "dark" ? (
          <Sun className={`${iconSize} text-yellow-500`} />
        ) : (
          <Moon className={`${iconSize} text-slate-700`} />
        )}
        {showLabel && (
          <span className="text-sm whitespace-nowrap overflow-hidden">
            {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        )}
      </div>
    </button>
  );
}
