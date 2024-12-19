import React, { useState } from 'react';
import { chains } from '../utils/chains';
import { deployTBA } from '../utils/deployTBA';
import NetworkSelector from './NetworkSelector';

interface MultichainDeployerProps {
  tokenId: string;
  contractAddress: string;
}

export default function MultichainDeployer({ tokenId, contractAddress }: MultichainDeployerProps) {
  const [selectedChain, setSelectedChain] = useState(chains[0]);

  const handleNetworkChange = (chainId: number) => {
    const chain = chains.find((c) => c.id === chainId);
    if (chain) setSelectedChain(chain);
  };

  const handleDeploy = async () => {
    if (selectedChain) {
      try {
        const rpcUrl = selectedChain.rpcUrls.default.http[0];

        const accountAddress = await deployTBA(
          selectedChain.id,
          rpcUrl,
          tokenId,
          contractAddress
        );

        alert(`TBA deployed at: ${accountAddress}`);
      } catch (error) {
        console.error('Error deploying TBA:', error);
        alert('Failed to deploy TBA. Please try again.');
      }
    }
  };

  return (
    <div>
      <h1>Deploy Token Bound Account</h1>
      <NetworkSelector onSelect={handleNetworkChange} />
      <button onClick={handleDeploy}>Deploy on {selectedChain.name}</button>
    </div>
  );
}
