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
