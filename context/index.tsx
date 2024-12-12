"use client";
import { wagmiAdapter, projectId } from "@/config";
import { createAppKit } from "@reown/appkit/react";
import { cookieStorage, createStorage } from "wagmi";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
const queryClient = new QueryClient();
if (!projectId) {
  throw new Error("projectId is not set");
}

const metadata = {
  name: "QNodeSell",
  description: "QNodeSell NFT Sell",
  url: "https://example.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, sepolia],
  defaultNetwork: mainnet,
  projectId,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ["google", "x", "github", "discord", "farcaster"],
  },
  themeMode: "dark",
});
function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
export default ContextProvider;
