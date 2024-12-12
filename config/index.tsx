import { createAppKit } from "@reown/appkit/react";
import { cookieStorage, createStorage } from "wagmi";
import { WagmiProvider } from "wagmi";
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const projectId = "12a0349a5714aab24e52307456552557";
if (!projectId) {
  throw new Error("projectId is not set");
}

export const networks = [mainnet, arbitrum, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  // storage: createStorage({ storage: cookieStorage }),
  networks,
  projectId,
  ssr: true,
});
export const config = wagmiAdapter.wagmiConfig;
