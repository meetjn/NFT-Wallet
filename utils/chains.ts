<<<<<<< HEAD
// utils/chains.ts
import { Chain } from 'viem';

export const chains: Chain[] = [
  {
    id: 1, // Ethereum Mainnet
    name: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
      },
    },
  },
  {
    id: 137, // Polygon Mainnet
    name: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://polygon-rpc.com'],
      },
    },
  },
  {
    id: 11155111, // Sepolia Testnet
    name: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
      },
    },
  },
  {
    id: 84531, // Base Sepolia Testnet
    name: 'Base Sepolia',
    nativeCurrency: {
      name: 'Base Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://base-sepolia.public.blastapi.io'],
      },
    },
  },
];
=======
import { sepolia } from "viem/chains";
import { avalancheFuji } from "viem/chains";
import { baseSepolia } from "viem/chains";
import { holesky } from "viem/chains";


export type SupportedChain = "sepolia"  | "avalancheFuji" | "baseSepolia"| "holesky"; // etc.

export const SUPPORTED_CHAINS: Record<SupportedChain, {
  id: number;
  name: string;
  registryAddress: `0x${string}`;
  accountImplementation: `0x${string}`;
  chain?: any;
}> = {
  sepolia: {
    id: sepolia.id,
    name: sepolia.name,
    registryAddress: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC",
    chain: sepolia,
  },
  avalancheFuji: {
    id: avalancheFuji.id,
    name: "Avalanche Fuji",
    registryAddress: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC",
    chain: avalancheFuji,
  },
  baseSepolia: {
    id: baseSepolia.id,
    name: baseSepolia.name,
    registryAddress: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC",
    chain: baseSepolia,
  },
  holesky: {
    id: holesky.id,
    name: holesky.name,
    registryAddress: "0x000000006551c19487814612e58FE06813775758",
    accountImplementation: "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC",
    chain: holesky,
  },
};


// 
>>>>>>> f868de1 (index-fund initial commit)
