/*
* This file contains the logic to create a Multichain Tokenbound Account (TBA) for an NFT.
* Little work is left to be done here.
*/

import { SUPPORTED_CHAINS, SupportedChain } from "../utils/chains";
import { TokenboundClient } from "@tokenbound/sdk";
import { WalletClient, createPublicClient, http } from "viem";
import { Signer, providers } from "ethers";
import { sepolia } from "viem/chains";
import NftAbi from "./ABI/MyNFT.json";


const FIXED_SALT = 7;
const NFT_NATIVE_CHAIN_ID = 11155111;

const NFT_ABI = NftAbi as any;

export async function createTBA(
  selectedChain: SupportedChain,
  walletClient: WalletClient | null,
  tokenId: string,
  nftContract?: string
): Promise<string> {
  if (!walletClient) {
    throw new Error("No wallet client found. Ensure your wallet is connected.");
  }
  
  const EXISTING_NFT_CONTRACT = "0xc7186EcDC29c8047C095C9170e67d96D3c99e317";
  const NEW_NFT_CONTRACT = "0xEFefcfb5E8dB1cd664BaA8b706f49D9bB02694B7";
  // Use the provided NFT contract or fall back to the default
  const NFT_CONTRACT = EXISTING_NFT_CONTRACT || NEW_NFT_CONTRACT;
  // (nftContract || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) as `0x${string}`;
  
  if (!NFT_CONTRACT) {
    throw new Error("NFT contract address is required");  
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const provider = new providers.Web3Provider(window.ethereum);
  await provider.getNetwork();
  const signer: Signer = provider.getSigner();

  if (!signer) {
    throw new Error("No signer available. Ensure your wallet is connected and unlocked.");
  }

  const { registryAddress, accountImplementation, id, chain: chainData } =
    SUPPORTED_CHAINS[selectedChain];

  if (!chainData) {
    throw new Error(`Chain configuration not found for ${selectedChain}`);
  }

  const detectedNetwork = await provider.getNetwork();
  if (detectedNetwork.chainId !== id) {
    throw new Error(`Signer is on the wrong network. Expected: ${id}, Got: ${detectedNetwork.chainId}`);
  }

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http("https://eth-sepolia.g.alchemy.com/v2/EIOdaYqWdQmC604QqW6iNERdWcTaqfQi"), 
  });

  try {
    const owner = await publicClient.readContract({
      address: NFT_CONTRACT as `0x${string}`,
      abi: NFT_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    if (owner === "0x0000000000000000000000000000000000000000") {
      throw new Error(`NFT with tokenId ${tokenId} does not exist`);
    }
  } catch (error) {
    throw new Error(`NFT with tokenId ${tokenId} does not exist or cannot be verified`);
  }

  const tokenboundClient = new TokenboundClient({
    signer,
    chain: chainData,
    chainId: id,
    registryAddress,
    implementationAddress: accountImplementation,
  });

  const tbaAddress = await tokenboundClient.getAccount({
    tokenContract: NFT_CONTRACT as `0x${string}`,
    tokenId,
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  });
  console.log(`Computed TBA address on ${selectedChain} for tokenId ${tokenId}:`, tbaAddress);

  const isDeployed = await tokenboundClient.checkAccountDeployment({
    accountAddress: tbaAddress,
  });

  if (isDeployed) {
    console.log(`TBA is already deployed at ${tbaAddress} for tokenId ${tokenId}`);
    return tbaAddress;
  }

  const { txHash } = await tokenboundClient.createAccount({
    tokenContract: NFT_CONTRACT,
    tokenId,
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  });

  console.log("Deploy transaction sent. Waiting for confirmation...", txHash);
  await provider.waitForTransaction(txHash);
  console.log(`TBA deployed successfully at ${tbaAddress} for tokenId ${tokenId}`);

  return tbaAddress;
}

export function getTBAAddress(
  selectedChain: SupportedChain, 
  tokenId: string,
  nftContract?: string
): string {
  const NFT_CONTRACT = "0xEFefcfb5E8dB1cd664BaA8b706f49D9bB02694B7";
  //nftContract || process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  
  if (!NFT_CONTRACT) {
    throw new Error("NFT contract address is required");
  }
  
  const { registryAddress, accountImplementation, id, chain: chainData } =
    SUPPORTED_CHAINS[selectedChain];

  const tokenboundClient = new TokenboundClient({
    chain: chainData,
    chainId: id,
    registryAddress,
    implementationAddress: accountImplementation,
  });

  return tokenboundClient.getAccount({
    tokenContract: NFT_CONTRACT as `0x${string}`,
    tokenId,
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  });
}
