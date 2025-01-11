
"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NavBar from "../components/navbar";
import TokenBoundInterface from "../components/swap";

import { useAccount } from "wagmi";
import { TokenboundClient } from "@tokenbound/sdk";
import { sepolia } from "viem/chains";
import NetworkSelector from "@/components/NetworkSelector";
import MultichainDeployer from "@/components/MultichainDeployer";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [tokenBoundClient, setTokenBoundClient] =
    useState<TokenboundClient | null>(null);
  const [tbaAddress, setTbaAddress] = useState<string | null>(null);
  const [existingTbas, setExistingTbas] = useState<string[]>([]);
  const [fundingAmount, setFundingAmount] = useState<string>("0.01");
  const [erc20Address, setErc20Address] = useState<string>("");
  const [manualTbaAddress, setManualTbaAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [erc20Balance, setErc20Balance] = useState<string>("0");
  const [selectedChainId, setSelectedChainId] = useState<number>(sepolia.id); 
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
  const fetchBalances = async () => {
    if (!manualTbaAddress) return;
    console.log("tba address", manualTbaAddress);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      // Fetch ETH Balance
      const ethBalanceWei = await provider.getBalance(manualTbaAddress);
      setEthBalance(ethers.utils.formatEther(ethBalanceWei));

      // Fetch ERC20 Token Balance
      if (erc20Address) {
        const erc20Abi = [
          "function balanceOf(address account) view returns (uint256)",
        ];
        const erc20Contract = new ethers.Contract(
          erc20Address,
          erc20Abi,
          provider
        );
        const erc20BalanceWei = await erc20Contract.balanceOf(manualTbaAddress);
        setErc20Balance(ethers.utils.formatUnits(erc20BalanceWei, 18)); // Assuming 18 decimals
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [manualTbaAddress]);

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
        console.log(
          "Token Bound Account created:",
          account,
          "Tx Hash:",
          txHash
        );
        fetchExistingTbas();
      } catch (error) {
        console.error("Error creating Token Bound Account:", error);
      }
    }
  };

  const fundWithEth = async () => {
    if (!manualTbaAddress) return alert("Please enter a valid TBA address.");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const tx = await signer.sendTransaction({
        to: manualTbaAddress,
        value: ethers.utils.parseEther(fundingAmount),
      });
      console.log("Transaction sent:", tx.hash);
      alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Error sending ETH:", error);
      alert("Failed to send ETH.");
    }
  };

  const fundWithErc20 = async () => {
    if (!manualTbaAddress || !erc20Address)
      return alert("TBA and ERC20 token address are required.");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const erc20Abi = [
        "function transfer(address to, uint amount) returns (bool)",
      ];
      const erc20Contract = new ethers.Contract(erc20Address, erc20Abi, signer);

      const tx = await erc20Contract.transfer(
        manualTbaAddress,
        ethers.utils.parseUnits(fundingAmount, 18)
      );
      console.log("ERC20 transfer transaction:", tx.hash);
      alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Error sending ERC20 tokens:", error);
      alert("Failed to send ERC20 tokens.");
    }
  };

  return (
    <div className="w-full pt-4">
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

        <h3>Enter Token Bound Account (TBA) Address</h3>
        <input
          type="text"
          placeholder="Enter TBA Address"
          value={manualTbaAddress}
          onChange={(e) => setManualTbaAddress(e.target.value)}
          style={{ width: "400px", marginBottom: "10px" }}
        />
        <button onClick={fetchBalances}>Fetch Balances</button>
        <h3>Balances:</h3>
        <p>ETH Balance: {ethBalance}</p>
        <p>ERC20 Balance: {erc20Balance}</p>

        <h3>Fund TBA with ETH</h3>
        <input
          type="text"
          placeholder="ETH Amount"
          value={fundingAmount}
          onChange={(e) => setFundingAmount(e.target.value)}
        />
        <button onClick={fundWithEth}>Send ETH</button>

        <h3>Fund TBA with ERC20 Tokens</h3>
        <input
          type="text"
          placeholder="ERC20 Contract Address"
          value={erc20Address}
          onChange={(e) => setErc20Address(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token Amount"
          value={fundingAmount}
          onChange={(e) => setFundingAmount(e.target.value)}
        />
        <button onClick={fundWithErc20}>Send ERC20 Tokens</button>
        <TokenBoundInterface />
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
