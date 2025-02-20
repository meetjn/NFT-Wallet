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
import MultiSigWalletCreator from "@/components/MultiSignature";
import { Web3Provider } from "@/context/Web3Context";
import Image from "next/image";
import { Coins } from "lucide-react";
import AddFundsModal from "@/components/AddFundsModal";
import router from "next/router";
import Sidebar from "@/components/sidebar";

enum TransactionType {
  ETH = "ETH",
  ERC20 = "ERC20",
}

interface TransactionDetails {
  type: TransactionType | "";
  amount: string;
  to: string;
  tokenAddress?: string;
}

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
  const [selectedChainId, setSelectedChainId] = useState<number>(sepolia.id);
  const [isEthModalOpen, setIsEthModalOpen] = useState(false);
  const [isErc20ModalOpen, setIsErc20ModalOpen] = useState(false);
  const [showMultisig, setShowMultisig] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [currentTbaAddress, setCurrentTbaAddress] = useState("");
  const [pendingTx, setPendingTx] = useState<{
    type: "ETH" | "ERC20";
    amount: string;
    to: string;
    tokenAddress?: string;
  } | null>(null);
  const [isMultiSigApproved, setIsMultiSigApproved] = useState(false);
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionDetails>({
      type: "",
      amount: "",
      to: "",
    });
  const [showMetamaskPrompt, setShowMetamaskPrompt] = useState(false);
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
      const tokenIds = ["0", "1", "2"];

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

      try {
        const { account, txHash } = await tokenBoundClient.createAccount({
          tokenContract: tokenContractAddress,
          tokenId: currentTokenId.toString(), // Use the current token ID
        });

        setTbaAddress(account); // Save the newly created TBA address
        console.log(
          `Token Bound Account created for Token ID ${currentTokenId}:`,
          account,
          "Tx Hash:",
          txHash
        );

        setCurrentTokenId((prevId) => prevId + 1); // Increment the token ID for the next call
        fetchExistingTbas(); // Refresh the list of existing TBAs
      } catch (error) {
        console.error("Error creating Token Bound Account:", error);
      }
    } else {
      console.error(
        "Wallet not connected or TokenboundClient not initialized."
      );
    }
  };

  const fundWithEth = async () => {
    if (!manualTbaAddress) return alert("Please enter a valid TBA address.");

    setPendingTransaction({
      type: TransactionType.ETH,
      amount: fundingAmount,
      to: manualTbaAddress,
    });

    setCurrentTbaAddress(manualTbaAddress);
    setShowMultisig(true);
    setIsTransactionPending(true);
    setIsEthModalOpen(false);
  };

  const fundWithErc20 = async () => {
    if (!manualTbaAddress || !erc20Address)
      return alert("TBA and ERC20 token address are required.");

    setPendingTransaction({
      type: TransactionType.ERC20,
      amount: fundingAmount,
      to: manualTbaAddress,
      tokenAddress: erc20Address,
    });

    setCurrentTbaAddress(manualTbaAddress);
    setShowMultisig(true);
    setIsTransactionPending(true);
    setIsErc20ModalOpen(false);
  };

  const executeTransaction = async () => {
    if (!pendingTx || !isMultiSigApproved) {
      console.log("Cannot execute: transaction not approved or missing");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      if (pendingTx.type === "ETH") {
        const tx = await signer.sendTransaction({
          to: pendingTx.to,
          value: ethers.utils.parseEther(pendingTx.amount),
        });
        console.log("ETH Transaction sent:", tx.hash);
        await tx.wait();

        alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
      } else {
        const erc20Abi = [
          "function transfer(address to, uint amount) returns (bool)",
        ];
        const erc20Contract = new ethers.Contract(
          pendingTx.tokenAddress!,
          erc20Abi,
          signer
        );
        const tx = await erc20Contract.transfer(
          pendingTx.to,
          ethers.utils.parseUnits(pendingTx.amount, 18)
        );
        await tx.wait();
        console.log("ERC20 Transaction sent:", tx.hash);
        alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed.");
    } finally {
      setIsTransactionPending(false);
      setShowMultisig(false);
      setPendingTx(null);
      setIsMultiSigApproved(false);
    }
  };

  // Add useEffect to handle transaction execution after MultiSig approval
  useEffect(() => {
    if (isMultiSigApproved && pendingTx) {
      executeTransaction();
    }
  }, [isMultiSigApproved]);

  return (
    <section className="pt-8 p-responsive flex flex-col gap-10 w-full pb-10">
      <div className="flex flex-col gap-8 justify-start items-start">
        <div className="text-2xl font-semibold">
          {address ? <> {address}</> : <h1>Wallet Not connected</h1>}
        </div>
        <button
          onClick={createTba}
          className="py-3 px-6 bg-[#CE192D] font-urbanist-semibold rounded-lg text-white"
        >
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
        <h2 className="text-2xl font-urbanist-semibold">
          Deploy on Multiple Chains
        </h2>
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
      {showMultisig && (
        <Web3Provider>
          <MultiSigWalletCreator
            onComplete={() => {
              if (!isTransactionPending) {
                setShowMultisig(false);
                setIsTransactionPending(false);
                setPendingTransaction(null);
              }
            }}
            onApproval={() => {
              executeTransaction();
            }}
            tbaAddress={currentTbaAddress}
            transactionDetails={pendingTransaction}
          />
        </Web3Provider>
      )}
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
function setIsTransactionPending(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setShowMultisig(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setCurrentTbaAddress(manualTbaAddress: string) {
  throw new Error("Function not implemented.");
}
