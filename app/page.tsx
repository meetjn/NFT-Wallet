"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NavBar from "../components/navbar";
import TokenBoundInterface from "../components/swap";
import { useAccount, useSwitchChain, useConnect, useDisconnect } from "wagmi";
import { TokenboundClient } from "@tokenbound/sdk";
import MultiSigWalletCreator from "@/components/MultiSignature";
import { Web3Provider } from "@/context/Web3Context";
import Image from "next/image";
import { Coins } from "lucide-react";
import AddFundsModal from "@/components/AddFundsModal";
import { SUPPORTED_CHAINS, SupportedChain } from "@/utils/chains";
import { createTBA } from "@/components/createTBA";
import { getTBAAddress } from "@/components/utils";
import { transferFromTBA } from "@/components/transferETH";
import { useWalletClient } from "wagmi";
import { injected } from "wagmi";





import router from "next/router";
import Sidebar from "@/components/sidebar";

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
  const [currentTokenId, setCurrentTokenId] = useState(0);
  const [showMultiSigWalletCreator, setShowMultiSigWalletCreator] =
    useState(true);
  const [isEthModalOpen, setIsEthModalOpen] = useState(false);
  const [isErc20ModalOpen, setIsErc20ModalOpen] = useState(false);

  const [selectedChain, setSelectedChain] = useState<SupportedChain>("sepolia");
  const [isDeploying, setIsDeploying] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  //const [transactionHash, setTransactionHash] = useState<string | null>(null);
  //const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const { chain } = useAccount(); // Get the connected chain
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient(); 

useEffect(() => {
  if (!isConnected) return;

  const fetchTBA = async () => {
    try {
      console.log("Fetching TBA Address for:", selectedChain);
      const address = getTBAAddress(selectedChain);
      setTbaAddress(address);
    } catch (err) {
      console.error("Error fetching TBA:", err);
      setError("Failed to fetch TBA address.");
    }
  };

  fetchTBA();
}, [isConnected, selectedChain]);

const handleCreateTBA = async () => {
  if (!isConnected || !walletClient) {
    console.error("No wallet client available.");
    setError("Please connect your wallet first.");
    return;
  }

  setIsDeploying(true);
  setError(null);

  try {
    if (!SUPPORTED_CHAINS[selectedChain]) {
      throw new Error("Invalid chain selection");
    }
    const expectedChainId = SUPPORTED_CHAINS[selectedChain].id;

    // Using MetaMask directly instead of `switchChain()`
    if (chain?.id !== expectedChainId) {
      console.log(`Switching network to ${SUPPORTED_CHAINS[selectedChain].name}...`);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const newTbaAddress = await createTBA(selectedChain, walletClient);
    console.log(`TBA deployed successfully on ${selectedChain}: ${newTbaAddress}`);
    setTbaAddress(newTbaAddress);
  } catch (error: any) {
    console.error("Error creating TBA:", error);
    setError(error.message || "Failed to create TBA.");
  } finally {
    setIsDeploying(false);
  }
};

  const handleTransfer = async () => {
    if (!isConnected || !tbaAddress) {
      setError("Please ensure wallet is connected and TBA is deployed");
      return;
    }

    try {
      console.log(`Transferring ${transferAmount} ETH to ${recipientAddress} from TBA:`, tbaAddress);
      const txHash = await transferFromTBA(
        selectedChain,
        transferAmount,
        recipientAddress as `0x${string}`
      );
      console.log("Transfer successful:", txHash);
    } catch (error) {
      console.error("Error transferring:", error);
      if (error instanceof Error) {
        setError(error.message || "Failed to transfer funds");
      } else {
        setError("Failed to transfer funds");
      }
    }
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

  const handleMultiSigWalletComplete = () => {
    localStorage.setItem("multiSigCompleted", "true");
    setShowMultiSigWalletCreator(false);

    // Hide the MultiSigWalletCreator
  };

  if (showMultiSigWalletCreator) {
    return (
      <div className="w-screen h-screen fixed top-0 left-0 bg-white z-50">
        <Web3Provider>
          <MultiSigWalletCreator onComplete={handleMultiSigWalletComplete} />
        </Web3Provider>
      </div>
    );
  }

  return (
    <section className="pt-8 p-responsive flex flex-col gap-10 w-full pb-10">
      <div className="flex flex-col gap-8 justify-start items-start">
        <div className="text-2xl font-semibold">
          {address ? <> {address}</> : <h1>Wallet Not connected</h1>}
        </div>
        <button
          onClick={handleCreateTBA} disabled={isDeploying}
          className="py-3 px-6 bg-[#CE192D] font-urbanist-semibold rounded-lg text-white"
        >
              {isDeploying ? "Deploying...":"" }
          Create TBA
        </button>
        {tbaAddress && (
          <h2 className="text-xl font-urbanist-medium">
            New Token Bound Account for Token ID {currentTokenId - 1}:{" "}
            {tbaAddress}
          </h2>
        )}
      </div>
         
      <div className="flex gap-5 items-center">
        <h3 className="font-urbanist-medium text-lg">Existing TBAs:</h3>
        {existingTbas.length > 0 ? (
          <ul className="list-disc list-inside">
            {existingTbas.map((tba, index) => (
              <li key={index} className="mt-2">
                {tba}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#3f3f3f]">No existing TBAs found</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">
          Enter Token Bound Account (TBA) Address
        </h2>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Enter TBA Address"
            value={manualTbaAddress}
            onChange={(e) => setManualTbaAddress(e.target.value)}
            className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
          />
          <button
            onClick={fetchBalances}
            className="font-urbanist-medium rounded-lg bg-[#CE192D] h-full px-6 text-white "
          >
            Fetch Balances
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-urbanist-semibold">Balances</h2>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div className="flex justify-between flex-col p-6 border border-opacity-10 rounded-2xl min-h-96 hover-scale-on">
            <div className="flex gap-3 text-xl font-urbanist-semibold items-center">
              <Image
                src="/ethereum.png"
                height={60}
                width={60}
                className="p-2 border border-opacity-10 rounded-md"
                alt="eth"
              />
              ETH Balance
              <p className="ml-auto">{ethBalance}</p>
            </div>
            <button
              onClick={() => setIsEthModalOpen(true)}
              className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
            >
              Add Funds
            </button>
          </div>
          <div className="flex justify-between flex-col p-6 border border-opacity-10 rounded-2xl min-h-96 hover-scale-on">
            <div className="flex gap-3 text-xl font-urbanist-semibold items-center">
              <Coins
                height={60}
                width={60}
                className="p-2 border border-opacity-10 rounded-md"
              />
              ERC20 Balance
              <p className="ml-auto">{erc20Balance}</p>
            </div>
            <button
              onClick={() => setIsErc20ModalOpen(true)}
              className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
            >
              Add Funds
            </button>
          </div>
        </div>
      </div>

          <div>
            <h2 className="text-2xl font-urbanist-semibold">Deploy on Multiple Chains</h2>
            <div className="mt-4">
            <div className="my-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Token Bound Account Manager</h2>
          
          {/* Chain Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Network
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
              className="w-full p-2 border rounded"
            >
              {Object.keys(SUPPORTED_CHAINS).map((chain) => (
                <option key={chain} value={chain}>
                  {SUPPORTED_CHAINS[chain as SupportedChain].name}
                </option>
              ))}
            </select>
          </div>

          {/* NFT Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">NFT Details</h3>
            <p>Contract: 0x1894CA318597538418607bFB3933f44b8F2B6d91</p>
            <p>Token ID: 1</p>
          </div>

          {/* TBA Address Display */}
          {tbaAddress && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">TBA Address</h3>
              <p className="font-mono break-all">{tbaAddress}</p>
            </div>
          )}

          {/* Deploy Button */}
          <button
            onClick={handleCreateTBA}
            disabled={isDeploying || !isConnected}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 mb-4"
          >
            {isDeploying ? "Deploying..." : "Deploy TBA"}
          </button>

          
          {/* Transfer Section  
          // Currently transfer fund section is disabled temporarily, will be enabled in future.
          {tbaAddress && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Transfer Funds</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleTransfer}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Transfer
                </button>
              </div>
            </div>
          )}
            */}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    
            </div>
            <div className="mt-4">
             
            </div>
          </div>

      <AddFundsModal
        isOpen={isEthModalOpen}
        onClose={() => {
          setIsEthModalOpen(false);
        }}
        manualTbaAddress={manualTbaAddress}
        fundingAmount={fundingAmount}
        setFundingAmount={setFundingAmount}
        onFund={fundWithEth}
        fundingType="ETH"
      />

      <AddFundsModal
        isOpen={isErc20ModalOpen}
        onClose={() => setIsErc20ModalOpen(false)}
        manualTbaAddress={manualTbaAddress}
        fundingAmount={fundingAmount}
        setFundingAmount={setFundingAmount}
        onFund={fundWithErc20}
        fundingType="ERC20 Token"
        erc20Address={erc20Address}
        setErc20Address={setErc20Address}
      />
    </section>
  );
}
