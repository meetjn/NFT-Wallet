"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { TokenboundClient } from "@tokenbound/sdk";
import { sepolia } from "viem/chains";
import NetworkSelector from "@/components/NetworkSelector";
import MultichainDeployer from "@/components/MultichainDeployer";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [tokenBoundClient, setTokenBoundClient] = useState<TokenboundClient | null>(null);
  const [tbaAddress, setTbaAddress] = useState<string | null>(null);
  const [existingTbas, setExistingTbas] = useState<string[]>([]);
  const [selectedChainId, setSelectedChainId] = useState<number>(sepolia.id); 
  //const [rpcUrl, setRpcUrl] = useState<string>(""); // Selected network RPC URL

  useEffect(() => {
    if (isConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const client = new TokenboundClient({
        signer: provider.getSigner(),
        chainId: selectedChainId,
      });
      setTokenBoundClient(client);
    }
  }, [isConnected, selectedChainId]);

  const fetchExistingTbas = async () => {
    if (tokenBoundClient && address) {
      const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
      const tokenIds = ["1"]; 

      try {
        const tbas = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const account = await tokenBoundClient.getAccount({
              tokenContract: tokenContractAddress,
              tokenId: tokenId,
            });
            return account;
          })
        );
        setExistingTbas(tbas.filter((account) => account)); 
      } catch (error) {
        console.error("Error fetching existing TBAs:", error);
      }
    }
  };

  useEffect(() => {
    fetchExistingTbas();
  }, [tokenBoundClient]);

  
  const handleNetworkChange = (chainId: number) => {
    setSelectedChainId(chainId);
    
  };

  const createTba = async () => {
    if (tokenBoundClient && address) {
      const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
      const tokenId = "1";

      try {
        const { account, txHash } = await tokenBoundClient.createAccount({
          tokenContract: tokenContractAddress,
          tokenId: tokenId,
        });
        setTbaAddress(account);
        console.log("Token Bound Account created:", account, "Tx Hash:", txHash);
        fetchExistingTbas();
      } catch (error) {
        console.error("Error creating Token Bound Account:", error);
      }
    }
  };

  return (
    <div className="w-full pl-4 pt-4">
      <h1 className="text-2xl font-bold">TBA Platform</h1>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Wallet Connected: {address}</h2>
        <br />
        <h3 className="text-lg font-medium">Default Chain: Sepolia</h3>
        <button 
          onClick={createTba} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Token Bound Account (TBA)
        </button>
        {tbaAddress && (
          <p className="mt-2 text-green-600">New Token Bound Account: {tbaAddress}</p>
        )}
        <h3 className="mt-6 text-lg font-medium">Existing TBAs:</h3>
        {existingTbas.length > 0 ? (
          <ul className="mt-2 list-disc list-inside">
            {existingTbas.map((tba, index) => (
              <li key={index}>{tba}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-gray-500">No existing TBAs found.</p>
        )}
      </div>
  
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Deploy on Multiple Chains</h2>
        <div className="mt-4">
          <NetworkSelector onSelect={handleNetworkChange} />
        </div>
        <div className="mt-4">
          <MultichainDeployer
            tokenId="1"
            contractAddress="0xE767739f02A6693d5D38B922324Bf19d1cd0c554"
          />
        </div>
      </div>
    </div>
  );
}  

