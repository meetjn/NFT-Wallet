import { isAddress } from 'ethers/lib/utils';
import { createTokenboundClient } from './tokenboundClient';

export const deployTBA = async (chainId: number, rpcUrl: string, tokenId: string, contractAddress: string) => {
  if (!isAddress(contractAddress)) {
    throw new Error('Invalid contract address');
  }

  const tokenboundClient = createTokenboundClient(chainId, rpcUrl);

  const accountAddress = tokenboundClient.getAccount({
    tokenContract: contractAddress as `0x${string}`,
    tokenId,
  });

  console.log('TBA Address:', accountAddress);
  return accountAddress;
};
