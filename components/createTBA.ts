import { SUPPORTED_CHAINS, SupportedChain } from "../utils/chains";
import { TokenboundClient } from "@tokenbound/sdk";
import { WalletClient } from "viem";
import { Signer, providers } from "ethers";

// Constant
const NFT_CONTRACT = "0xe4d54752B3c6786851c2F8336743367458835c5C";
  //"0x1894CA318597538418607bFB3933f44b8F2B6d91", // NFT contract address of avax-fuji-chain
const TOKEN_ID = "1";
const FIXED_SALT = 7;
const NFT_NATIVE_CHAIN_ID = 11155111;

export async function createTBA(
  selectedChain: SupportedChain,
  walletClient: WalletClient | null
): Promise<string> {
  if (!walletClient) {
    throw new Error("No wallet client found. Ensure your wallet is connected.");
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

  const tokenboundClient = new TokenboundClient({
    signer,
    chain: chainData,
    chainId: id,
    registryAddress,
    implementationAddress: accountImplementation,
  });

  //  Compute the deterministic TBA address
  const tbaAddress = await tokenboundClient.getAccount({
    tokenContract: "0xe4d54752B3c6786851c2F8336743367458835c5C",
    tokenId: "1",
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  });
  console.log(`Computed TBA address on ${selectedChain}:`, tbaAddress);

  // Check if the account is already deployed
  const isDeployed = await tokenboundClient.checkAccountDeployment({
    accountAddress: tbaAddress,
  });

  if (isDeployed) {
    console.log("TBA is already deployed at:", tbaAddress);
    return tbaAddress;
  }

  //  Deploy the account
  const { txHash } = await tokenboundClient.createAccount({
    tokenContract: "0xe4d54752B3c6786851c2F8336743367458835c5C",
    tokenId: "1",
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  });

  console.log("Deploy transaction sent. Waiting for confirmation...", txHash);

  // Wait for the transaction to be confirmed on the correct network
  await provider.waitForTransaction(txHash);
  console.log("TBA deployed successfully at:", tbaAddress);

  return tbaAddress;
}

export function getTBAAddress(selectedChain: SupportedChain): string {
  const { registryAddress, accountImplementation, id, chain: chainData } =
    SUPPORTED_CHAINS[selectedChain];

  const tokenboundClient = new TokenboundClient({
    chain: chainData,
    chainId: id,
    registryAddress,
    implementationAddress: accountImplementation,
  });

  return tokenboundClient.getAccount({
    tokenContract: NFT_CONTRACT,
    tokenId: TOKEN_ID,
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  });
}

 