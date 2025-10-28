"use client";

import { Provider as JotaiProvider } from "jotai";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "./trpc-client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TRPCReactProvider>
        <NuqsAdapter>
          <JotaiProvider>{children}</JotaiProvider>
        </NuqsAdapter>
      </TRPCReactProvider>
    </>
  );
}
