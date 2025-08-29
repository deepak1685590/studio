"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const themes = [
  { name: "Nexus", value: "theme-nexus", color: "hsl(180, 100%, 45%)" },
  { name: "Crimson", value: "theme-crimson", color: "hsl(0, 85%, 65%)" },
  { name: "Amber", value: "theme-amber", color: "hsl(38, 92%, 50%)" },
  { name: "Cobalt", value: "theme-cobalt", color: "hsl(217, 91%, 60%)" },
];

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex items-center gap-2">
          {themes.map((theme) => (
            <Button
              key={theme.value}
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme.value)}
              className="h-8 w-8"
              style={{ backgroundColor: theme.color, borderColor: theme.color }}
              aria-label={`Switch to ${theme.name} theme`}
            >
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
