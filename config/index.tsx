import { createAppKit } from "@reown/appkit/react";
import { cookieStorage, createStorage } from "wagmi";
import { WagmiProvider } from "wagmi";
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Push Protocol Demo Channel Configuration
export const PUSH_CHANNEL_ADDRESS =
  "0xD8634C39BBFd4033c0d3289C4515275102423681"; // demo channel address
export const PUSH_ENV = "staging";
export const PUSH_CHANNEL_CHAIN_ID = 5; // Goerli testnet

// Your existing configuration
export const projectId = "12a0349a5714aab24e52307456552557";
if (!projectId) {
  throw new Error("projectId is not set");
}

export const networks = [mainnet, arbitrum, sepolia];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});
export const config = wagmiAdapter.wagmiConfig;
