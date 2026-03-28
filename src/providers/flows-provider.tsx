"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FlowsProvider } from "@flows/react";
import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";

import "@flows/react-components/index.css";

export function FlowsWrapper({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  const userId = session?.user?.id ?? session?.user?.email ?? undefined;

  if (!userId) {
    return <>{children}</>;
  }

  return (
    <FlowsProvider
      organizationId="4b5e26d2-02a3-40e5-85a1-03b21cb0d959"
      userId={userId}
      environment="production"
      components={{ ...components }}
      tourComponents={{ ...tourComponents }}
      LinkComponent={Link}
    >
      {children}
    </FlowsProvider>
  );
}
