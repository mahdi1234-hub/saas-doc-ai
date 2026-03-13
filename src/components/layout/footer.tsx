"use client";

import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          Powered By Louati Mahdi
          <Heart className="h-4 w-4 text-red-500 animate-pulse" style={{ animation: "heartbeat 1.2s ease-in-out infinite" }} />
          &copy; 2026 All Rights Reserved to Louati Mahdi
        </p>
      </div>
      <style jsx global>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
      `}</style>
    </footer>
  );
}
