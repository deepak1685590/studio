"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "theme-nexus" | "theme-crimson" | "theme-amber" | "theme-cobalt";

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "theme-nexus",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== 'undefined' && (localStorage.getItem("vite-ui-theme") as Theme)) || "theme-nexus"
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("theme-nexus", "theme-crimson", "theme-amber", "theme-cobalt");

    if (theme === "theme-nexus") {
       // Default styles are applied, no class needed, but we could add one for consistency if desired
    } else {
        root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem("vite-ui-theme", newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
