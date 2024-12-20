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
    <div style={{ fontFamily: "'Arial', sans-serif" }}>
      <h1>TBA Platform</h1>
      <div>
        <h2>Wallet Connected: {address}</h2>
        <br />
        <h3>Default Chain: Sepolia</h3>
        <button onClick={createTba}>Create Token Bound Account (TBA)</button>
        {tbaAddress && <p>New Token Bound Account: {tbaAddress}</p>}
        <h3>Existing TBAs:</h3>
        {existingTbas.length > 0 ? (
          <ul>
            {existingTbas.map((tba, index) => (
              <li key={index}>{tba}</li>
            ))}
          </ul>
        ) : (
          <p>No existing TBAs found.</p>
        )}
      </div>

      <div>
        <h2>Deploy on Multiple Chains</h2>
        <NetworkSelector onSelect={handleNetworkChange} />
        <MultichainDeployer
          tokenId="1"
          contractAddress="0xE767739f02A6693d5D38B922324Bf19d1cd0c554"
        />
      </div>
    </div>
  );
}

