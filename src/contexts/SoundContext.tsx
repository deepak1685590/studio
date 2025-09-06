
"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import React, { createContext, useCallback, ReactNode, useRef, useEffect } from "react";

type SoundName = "signalDetected" | "loginWelcome";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (soundName: SoundName) => void;
}

export const SoundContext = createContext<SoundContextType | undefined>(
  undefined
);

const sounds: Record<SoundName, string> = {
  signalDetected: "/sounds/signal-detected.mp3",
  loginWelcome: "/sounds/login-welcome.mp3",
};

const backgroundMusicSrc = "/sounds/matrix-loop.mp3";

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [isMuted, setIsMuted] = useLocalStorage("sound-muted", false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Background music is disabled by default to prevent errors if file is missing.
    // To enable, uncomment the following lines and ensure matrix-loop.mp3 is in public/sounds
    /*
    if (typeof Audio !== "undefined") {
      if (!backgroundMusicRef.current) {
        const audio = new Audio(backgroundMusicSrc);
        audio.loop = true;
        audio.volume = 0.3; // Lower volume for background music
        backgroundMusicRef.current = audio;
      }

      if (!isMuted) {
        backgroundMusicRef.current.play().catch(e => console.error("Background music play failed:", e));
      } else {
        backgroundMusicRef.current.pause();
      }
    }
    */
  }, [isMuted]);


  const playSound = useCallback((soundName: SoundName) => {
      if (!isMuted) {
        try {
          const audio = new Audio(sounds[soundName]);
          audio.play().catch(e => console.error(`Audio play failed for ${soundName}:`, e));
        } catch (error) {
          console.error(`Failed to play sound ${soundName}:`, error);
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
