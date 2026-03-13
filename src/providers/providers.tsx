"use client";

import { ReactNode } from "react";
import { SessionProvider } from "./session-provider";
import { EdgeStoreProvider } from "@/lib/edgestore-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <EdgeStoreProvider>
        <TooltipProvider>
          {children}
          <Toaster position="top-right" />
        </TooltipProvider>
      </EdgeStoreProvider>
    </SessionProvider>
  );
}
