import {
  createWalletClient,
  createPublicClient,
  http,
  custom,
  type WalletClient,
  type Chain,
} from "viem";
import { SUPPORTED_CHAINS, SupportedChain } from "../utils/chains";
import { TokenboundClient } from "@tokenbound/sdk";

export async function getClients(chain: SupportedChain) {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask and try again."
    );
  }

  const {
    id,
    registryAddress,
    accountImplementation,
    chain: chainData,
  } = SUPPORTED_CHAINS[chain];

  if (!chainData) {
    throw new Error(`Chain configuration not found for ${chain}`);
  }

  const chainConfig = chainData as Chain;

  const publicClient = createPublicClient({
    chain: chainConfig,
    transport: http(chainConfig.rpcUrls.default.http[0]),
  });

  const walletClient: WalletClient = createWalletClient({
    chain: chainConfig,
    transport: custom(window.ethereum),
  });

  const [account] = await walletClient.getAddresses();
  if (!account) {
    throw new Error("No connected account found. Please connect your wallet.");
  }

  // console.log("Chain ID:", id);
  // console.log("RPC URL:", chainConfig.rpcUrls.default.http[0]);
  // console.log("Registry Address:", registryAddress);
  // console.log("Account Implementation:", accountImplementation);
  // console.log("Connected account:", account);

  const tokenboundClient = new TokenboundClient({
    walletClient,
    chain: chainConfig,
    chainId: id,
    publicClient,
    registryAddress,
    implementationAddress: accountImplementation,
  });

  return { publicClient, walletClient, tokenboundClient };
}
