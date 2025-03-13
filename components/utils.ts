import { TokenboundClient } from "@tokenbound/sdk";
import { SUPPORTED_CHAINS, SupportedChain } from "../utils/chains";

// Constants
const REGISTRY_ADDRESS = "0x000000006551c19487814612e58FE06813775758";
const IMPLEMENTATION_ADDRESS = "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC";
const NFT_CONTRACT = "0xc7186EcDC29c8047C095C9170e67d96D3c99e317" as `0x${string}`;
const FIXED_SALT = 7;
const NFT_NATIVE_CHAIN_ID = 11155111;

interface TBAConfig {
  tokenContract: `0x${string}`;
  tokenId: string;
  salt: number;
  chainId: number;
}

export function getStandardizedConfig(tokenId: string, chainId: number): TBAConfig {
  return {
    tokenContract: NFT_CONTRACT,
    tokenId,
    salt: FIXED_SALT,
    chainId: NFT_NATIVE_CHAIN_ID,
  };
}

export function getTBAAddress(selectedChain: SupportedChain, tokenId: string): `0x${string}` {
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

  const config = getStandardizedConfig(tokenId, chain.id);

  return client.getAccount({
    tokenContract: config.tokenContract,
    tokenId: config.tokenId,
    salt: config.salt,
    chainId: NFT_NATIVE_CHAIN_ID,
  });
}

export function verifyTBAAddressesMatch(chains: SupportedChain[], tokenId: string): boolean {
  if (chains.length < 2) return true;

  const firstAddress = getTBAAddress(chains[0], tokenId);
  return chains.every((chain) => getTBAAddress(chain, tokenId) === firstAddress);
}

export function hexSaltToNumber(hexSalt: `0x${string}`): number {
  return parseInt(hexSalt, 16);
}

export function numberSaltToHex(numberSalt: number): `0x${string}` {
  return `0x${numberSalt.toString(16).padStart(64, '0')}` as `0x${string}`;
}
