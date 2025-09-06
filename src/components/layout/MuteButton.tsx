"use client";

import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export function MuteButton() {
  const { isMuted, toggleMute } = useSound();

  return (
    <Button variant="ghost" size="icon" onClick={toggleMute}>
      {isMuted ? (
        <VolumeX className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Volume2 className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle sound</span>
    </Button>
  );
}
