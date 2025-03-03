import { createAppKit } from "@reown/appkit/react";
import { cookieStorage, createStorage } from "wagmi";
import { WagmiProvider } from "wagmi";
<<<<<<< HEAD
import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";


export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "2bec402b7bd44404a790f12362989c84";

if (!projectId) {
  throw new Error("ProjectId is required");
}


export const networks = [mainnet, arbitrum, sepolia];


export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
=======
import { arbitrum, mainnet, sepolia, baseSepolia, holesky,avalancheFuji } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const projectId = "12a0349a5714aab24e52307456552557";
if (!projectId) {
  throw new Error("projectId is not set");
}

export const networks = [mainnet, arbitrum, sepolia, baseSepolia, holesky,avalancheFuji];

export const wagmiAdapter = new WagmiAdapter({
  // storage: createStorage({ storage: cookieStorage }),
>>>>>>> f868de1 (index-fund initial commit)
  networks,
  projectId,
  ssr: true,
});
<<<<<<< HEAD

=======
>>>>>>> f868de1 (index-fund initial commit)
export const config = wagmiAdapter.wagmiConfig;
