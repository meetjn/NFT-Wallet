import React, { useState } from "react";
import { chains } from "../utils/chains";
import { deployTBA } from "../utils/deployTBA";
import NetworkSelector from "./NetworkSelector";

interface MultichainDeployerProps {
  tokenId: string;
  contractAddress: string;
}

export default function MultichainDeployer({
  tokenId,
  contractAddress,
}: MultichainDeployerProps) {
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
        console.error("Error deploying TBA:", error);
        alert("Failed to deploy TBA. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-urbanist-medium mb-2">
        Deploy Token Bound Account
      </h1>
      <div className="flex flex-col md:flex-row gap-4">
        <NetworkSelector onSelect={handleNetworkChange} />
        <button
          onClick={handleDeploy}
          className="py-2 px-6 bg-[#CE192D] font-urbanist-semibold rounded-lg text-white">
          Deploy on {selectedChain.name}
        </button>
      </div>
    </div>
  );
}
