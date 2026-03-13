"use client";

import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>Powered By Louati Mahdi</span>
        <Heart className="h-4 w-4 text-red-500 animate-heartbeat" />
        <span className="mx-2">|</span>
        <span>&copy; 2026 Louati Mahdi. All rights reserved.</span>
      </div>

      <style jsx global>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.3); }
          70% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}
