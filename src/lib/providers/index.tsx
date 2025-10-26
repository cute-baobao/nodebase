"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "./trpc-client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TRPCReactProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TRPCReactProvider>
    </>
  );
}
