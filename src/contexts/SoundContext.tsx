"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import React, { createContext, useCallback, ReactNode } from "react";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (soundName: "signalDetected") => void;
}

export const SoundContext = createContext<SoundContextType | undefined>(
  undefined
);

const sounds: Record<"signalDetected", string> = {
  signalDetected: "/sounds/signal-detected.mp3",
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [isMuted, setIsMuted] = useLocalStorage("sound-muted", false);

  const playSound = useCallback((soundName: keyof typeof sounds) => {
      if (!isMuted) {
        try {
          const audio = new Audio(sounds[soundName]);
          audio.play().catch(e => console.error("Audio play failed:", e));
        } catch (error) {
          console.error("Failed to play sound:", error);
        }
      }
    },
    [isMuted]
  );

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const value = {
    isMuted,
    toggleMute,
    playSound,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};
