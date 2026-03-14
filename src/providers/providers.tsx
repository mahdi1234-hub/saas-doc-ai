"use client";

import { ReactNode, useEffect } from "react";
import { SessionProvider } from "./session-provider";
import { FlowsWrapper } from "./flows-provider";
import { EdgeStoreProvider } from "@/lib/edgestore-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

function useFetchPatch() {
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      if (typeof input === "string" && input.startsWith("/")) {
        input = window.location.origin + input;
        const headers = new Headers(init?.headers);
        if (!headers.has("Authorization")) {
          headers.set("Authorization", "Basic " + btoa("user:1ef3be41f01cb482900f5e8e2e9e2c3d"));
        }
        init = { ...init, headers };
      }
      return originalFetch.call(this, input, init);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

export function Providers({ children }: { children: ReactNode }) {
  useFetchPatch();
  return (
    <SessionProvider>
      <FlowsWrapper>
        <EdgeStoreProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" />
          </TooltipProvider>
        </EdgeStoreProvider>
      </FlowsWrapper>
    </SessionProvider>
  );
}
