"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { TokenboundClient } from "@tokenbound/sdk";
import { sepolia } from "viem/chains";
import { Web3Provider } from "@/context/Web3Context";
import Image from "next/image";
import { Coins } from "lucide-react";
import AddFundsModal from "@/components/AddFundsModal";
import MultiSigWalletCreator from "@/components/MultiSignature"; // Ensure this is correct
import TransactionApproval from "@/components/MultisigApproval";

enum TransactionType {
  ETH = "ETH",
  ERC20 = "ERC20",
}

export interface TransactionDetails {
  type: "ETH" | "ERC20" | "SWAP" | "";
  amount: string;
  to: string;
  tokenAddress?: string;
  inputTokenAddress?: string;
  outputTokenAddress?: string;
  swapAmount?: string;
  slippage?: string;
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
  const [showMultisigCreator, setShowMultisigCreator] = useState(false);
  const [showMultisigApproval, setShowMultisigApproval] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [currentTbaAddress, setCurrentTbaAddress] = useState("");

  const [isMultiSigApproved, setIsMultiSigApproved] = useState(false);
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionDetails>({
      type: "",
      amount: "",
      to: "",
    });
  const [showTransactionTypeModal, setShowTransactionTypeModal] =
    useState(false);

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
    console.log("MultiSig States Updated:", {
      showMultisigCreator,
      showMultisigApproval,
      pendingTransaction: {
        type: pendingTransaction.type,
        amount: pendingTransaction.amount,
        to: pendingTransaction.to,
      },
    });
  }, [showMultisigCreator, showMultisigApproval, pendingTransaction]);

  useEffect(() => {
    console.log("Detailed MultiSig States:", {
      showMultisigApproval,
      showMultisigCreator,
      pendingTransaction: {
        type: pendingTransaction.type,
        amount: pendingTransaction.amount,
        to: pendingTransaction.to,
      },
      currentTbaAddress,
      manualTbaAddress,
      isTransactionPending,
    });
  }, [
    showMultisigApproval,
    showMultisigCreator,
    pendingTransaction,
    currentTbaAddress,
    manualTbaAddress,
    isTransactionPending,
  ]);

  useEffect(() => {
    fetchExistingTbas();
  }, [tokenBoundClient]);

  const fetchBalances = async () => {
    if (!manualTbaAddress) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const ethBalanceWei = await provider.getBalance(manualTbaAddress);
      setEthBalance(ethers.utils.formatEther(ethBalanceWei));
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
        setErc20Balance(ethers.utils.formatUnits(erc20BalanceWei, 18));
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
        const { account } = await tokenBoundClient.createAccount({
          tokenContract: tokenContractAddress,
          tokenId: currentTokenId.toString(),
        });
        setTbaAddress(account);
        setCurrentTbaAddress(account);
        setCurrentTokenId((prevId) => prevId + 1);
        fetchExistingTbas();
      } catch (error) {
        console.error("Error creating Token Bound Account:", error);
      }
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
    setIsEthModalOpen(false);
    setShowTransactionTypeModal(true);
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
    setIsErc20ModalOpen(false);
    setShowTransactionTypeModal(true);
  };

  const handleTransactionTypeSelect = (type: "normal" | "multisig") => {
    console.log("Transaction Type Selected:", type);
    console.error("DEBUG: Current States Before Selection", {
      showTransactionTypeModal,
      showMultisigCreator,
      showMultisigApproval,
      pendingTransaction,
      currentTbaAddress,
      manualTbaAddress,
    });

    setShowTransactionTypeModal(false);
    if (type === "normal") {
      executeDirectTransaction();
      return;
    } else if (type === "multisig") {
      const storedWalletAddress = localStorage.getItem("multisigWalletAddress");
      const storedSigners = localStorage.getItem("multisigSigners");
      const storedRequiredSignatures = localStorage.getItem(
        "multisigRequiredSignatures"
      );
      console.error("DEBUG: All localStorage items:", {
        multisigWalletAddress: localStorage.getItem("multisigWalletAddress"),
        multisigSigners: localStorage.getItem("multisigSigners"),
        multisigRequiredSignatures: localStorage.getItem(
          "multisigRequiredSignatures"
        ),
      });

      // Attempt to set states explicitly and log
      console.error("DEBUG: Attempting to set MultiSig states");

      // Temporarily remove localStorage check for debugging
      setShowMultisigApproval(true);
      setShowMultisigCreator(false);
      setIsTransactionPending(true);

      console.error("DEBUG: States After MultiSig Selection", {
        showMultisigCreator,
        showMultisigApproval,
        isTransactionPending: true,
      });
    }
  };
  const executeDirectTransaction = async () => {
    if (!pendingTransaction) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      if (pendingTransaction.type === TransactionType.ETH) {
        const tx = await signer.sendTransaction({
          to: pendingTransaction.to,
          value: ethers.utils.parseEther(pendingTransaction.amount),
        });
        await tx.wait();
        alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
      } else if (
        pendingTransaction.type === TransactionType.ERC20 &&
        pendingTransaction.tokenAddress
      ) {
        const erc20Abi = [
          "function transfer(address to, uint amount) returns (bool)",
        ];
        const erc20Contract = new ethers.Contract(
          pendingTransaction.tokenAddress,
          erc20Abi,
          signer
        );
        const tx = await erc20Contract.transfer(
          pendingTransaction.to,
          ethers.utils.parseUnits(pendingTransaction.amount, 18)
        );
        await tx.wait();
        alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
      }
      fetchBalances();
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed.");
    } finally {
      setIsTransactionPending(false);
    }
  };

  const executeTransaction = async () => {
    if (!pendingTransaction || !isMultiSigApproved) {
      console.error("Transaction cannot be executed", {
        pendingTransaction,
        isMultiSigApproved,
      });
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      if (pendingTransaction.type === "ETH") {
        const tx = await signer.sendTransaction({
          to: pendingTransaction.to,
          value: ethers.utils.parseEther(pendingTransaction.amount),
        });
        await tx.wait();
        alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
      } else if (
        pendingTransaction.type === "ERC20" &&
        pendingTransaction.tokenAddress
      ) {
        const erc20Abi = [
          "function transfer(address to, uint amount) returns (bool)",
        ];
        const erc20Contract = new ethers.Contract(
          pendingTransaction.tokenAddress,
          erc20Abi,
          signer
        );
        const tx = await erc20Contract.transfer(
          pendingTransaction.to,
          ethers.utils.parseUnits(pendingTransaction.amount, 18)
        );
        await tx.wait();
        alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
      }
      fetchBalances();
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed.");
    } finally {
      setIsTransactionPending(false);
      setShowMultisigApproval(false);
      setPendingTransaction({ type: "", amount: "", to: "" });
      setIsMultiSigApproved(false);
    }
  };

  useEffect(() => {
    if (isMultiSigApproved && pendingTransaction.type !== "") {
      executeTransaction();
    }
  }, [isMultiSigApproved, pendingTransaction]);

  const handleMultisigCreatorComplete = () => {
    setShowMultisigCreator(false);
    setShowMultisigApproval(true);
    // No need to parse anything here, just transition to approval screen
  };

  const handleMultisigApproval = () => {
    setIsMultiSigApproved(true);
    executeTransaction();
  };

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
            className="font-urbanist-medium rounded-lg bg-[#CE192D] h-full px-6 text-white"
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

      {showMultisigCreator && (
        <Web3Provider key="multisig-creator">
          <MultiSigWalletCreator onComplete={handleMultisigCreatorComplete} />
        </Web3Provider>
      )}
      {showMultisigApproval && (
        <Web3Provider key="multisig-approval">
          <TransactionApproval
            tbaAddress={currentTbaAddress || manualTbaAddress}
            transactionDetails={{
              type: pendingTransaction.type,
              amount: pendingTransaction.amount,
              to: pendingTransaction.to,
              tokenAddress: pendingTransaction.tokenAddress,
            }}
            onApproval={handleMultisigApproval}
            onComplete={() => {}}
          />
        </Web3Provider>
      )}

      <AddFundsModal
        isOpen={isEthModalOpen}
        onClose={() => setIsEthModalOpen(false)}
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

      {showTransactionTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Choose Transaction Type</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleTransactionTypeSelect("normal")}
                className="w-full px-6 py-3 bg-[#CE192D] text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Normal Transaction
              </button>
              <button
                onClick={() => handleTransactionTypeSelect("multisig")}
                className="w-full px-6 py-3 bg-[#CE192D] text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Multisig Transaction
              </button>
            </div>
            <button
              onClick={() => setShowTransactionTypeModal(false)}
              className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
