"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

const ORDER: Theme[] = ["light", "dark", "system"];

function nextTheme(current: string | undefined): Theme {
  const idx = ORDER.indexOf((current as Theme) ?? "system");
  return ORDER[(idx + 1) % ORDER.length];
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = !mounted
    ? Sun
    : theme === "dark"
      ? Moon
      : theme === "system"
        ? Monitor
        : Sun;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Ganti tema"
      title="Ganti tema"
      onClick={() => setTheme(nextTheme(theme))}
      className={className ?? "min-h-11 min-w-11"}
    >
      {mounted ? (
        <Icon className="size-5" aria-hidden="true" />
      ) : (
        <span className="size-5" aria-hidden="true" />
      )}
    </Button>
  );
}
