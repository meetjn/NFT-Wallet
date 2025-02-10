import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";
import { TokenboundClient } from "@tokenbound/sdk";
import { SUPPORTED_CHAINS, SupportedChain } from "../utils/chains";
import { avalancheFuji } from "viem/chains";

// Constants
const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";
const IMPLEMENTATION_ADDRESS = "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC";
const NFT_CONTRACT = "0xe4d54752B3c6786851c2F8336743367458835c5C";
const TOKEN_ID = 1; // Make sure this matches your actual token ID
const FIXED_SALT = 7;
const NFT_NATIVE_CHAIN_ID = 11155111; // Avalanche Fuji chain ID where NFT exists


interface TBAConfig {
  tokenContract: `0x${string}`;
  tokenId: number;
  salt: number;
  chainId: number;
}

export function getStandardizedConfig(chainId: number): TBAConfig {
  return {
    tokenContract: NFT_CONTRACT,
    tokenId: TOKEN_ID,
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID, // This is the chain ID where the NFT exists
  };
}

export function getTBAAddress(selectedChain: SupportedChain): `0x${string}` {
  const chain = SUPPORTED_CHAINS[selectedChain];
  
  if (!chain) {
    throw new Error(`Unsupported chain: ${selectedChain}`);
  }

  const client = new TokenboundClient({
    chainId: chain.id,
    registryAddress: REGISTRY_ADDRESS,
    implementationAddress: IMPLEMENTATION_ADDRESS,
    chain: chain.chain,
  });

  const config = getStandardizedConfig(chain.id);

  return client.getAccount({
    tokenContract: config.tokenContract,
    tokenId: config.tokenId.toString(),
    salt: config.salt,
    chainId: NFT_NATIVE_CHAIN_ID,
  });
}

// Helper function to verify addresses match across chains
export function verifyTBAAddressesMatch(chains: SupportedChain[]): boolean {
  if (chains.length < 2) return true;
  
  const firstAddress = getTBAAddress(chains[0]);
  return chains.every(chain => getTBAAddress(chain) === firstAddress);
}
export function hexSaltToNumber(hexSalt: `0x${string}`): number {
  return parseInt(hexSalt, 16);
}
export function numberSaltToHex(numberSalt: number): `0x${string}` {
  return `0x${numberSalt.toString(16).padStart(64, '0')}` as `0x${string}`;
}