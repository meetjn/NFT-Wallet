import { TokenboundClient } from '@tokenbound/sdk';
import { createPublicClient, http, Chain } from 'viem';

export const createTokenboundClient = (chainId: number, rpcUrl: string) => {
  const publicClient = createPublicClient({
    chain: {
      id: chainId,
      rpcUrls: {
        default: {
          http: [rpcUrl],
        },
      },
      name: 'Custom Chain', // Optional: Add a name for the chain
      nativeCurrency: {
        name: 'Ether', // Replace with appropriate native currency for the chain
        symbol: 'ETH', // Replace with appropriate symbol (e.g., ETH, MATIC)
        decimals: 18, // Standard is 18 decimals
      },
    },
    transport: http(rpcUrl),
  });

  return new TokenboundClient({ publicClient });
};
