import { createAppKit } from "@reown/appkit/react";
import { cookieStorage, createStorage } from "wagmi";
import { WagmiProvider } from "wagmi";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";


export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "2bec402b7bd44404a790f12362989c84";

if (!projectId) {
  throw new Error("ProjectId is required");
}

export const networks = [mainnet, arbitrum, sepolia,arbitrumSepolia];


export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  networks,
  projectId,
  ssr: true,
});

export const config = wagmiAdapter.wagmiConfig;
