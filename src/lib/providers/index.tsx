"use client";

import { TRPCReactProvider } from "./trpc-client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </>
  );
}
