"use client";
<<<<<<< HEAD

import { wagmiAdapter, projectId } from "@/config";
import { createAppKit } from "@reown/appkit/react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { arbitrum, mainnet, sepolia, arbitrumSepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";


const queryClient = new QueryClient();


if (!projectId) {
  throw new Error("ProjectId is required");
}

// Define metadata
=======
import { wagmiAdapter, projectId } from "@/config";
import { createAppKit } from "@reown/appkit/react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { arbitrum, mainnet, sepolia,arbitrumSepolia,baseSepolia, avalancheFuji, holesky} from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
const queryClient = new QueryClient();
if (!projectId) {
  throw new Error("projectId is not set");
}

>>>>>>> f868de1 (index-fund initial commit)
const metadata = {
  name: "NFT-Wallet",
  description: "NFT-Wallet",
  url: "https://example.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};
<<<<<<< HEAD


export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, sepolia, arbitrumSepolia],
=======
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum, sepolia, arbitrumSepolia,baseSepolia, avalancheFuji, holesky],
>>>>>>> f868de1 (index-fund initial commit)
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
<<<<<<< HEAD

interface ContextProviderProps {
  children: ReactNode;
  cookies: string | null;
}

function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookies 
    ? cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
    : undefined;

  return (
    <WagmiProvider 
      config={wagmiAdapter.wagmiConfig as Config} 
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

=======
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
>>>>>>> f868de1 (index-fund initial commit)
export default ContextProvider;
