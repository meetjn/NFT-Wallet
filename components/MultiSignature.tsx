import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { X, ChevronLeft, AlertCircle, CheckCircle2, Users } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import {
  MULTISIG_WALLET_ABI,
  MULTISIG_WALLET_BYTECODE,
} from "../context/constant";
import { TransactionType } from "viem";

interface TransactionDetails {
  type: TransactionType | "";
  amount: string;
  to: string;
  tokenAddress?: string;
}

interface Signer {
  hasApproved: boolean;
  name: string;
  address: string;
}

interface MultiSigWalletCreatorProps {
  onComplete: () => void;
  tbaAddress: string;
  onApproval: () => void;
  transactionDetails: TransactionDetails;
}

const MultiSigWalletCreator: React.FC<MultiSigWalletCreatorProps> = ({
  onComplete,
  tbaAddress,
  onApproval,
  transactionDetails,
}) => {
  const { provider } = useWeb3();
  const [step, setStep] = useState(1);
  const [signers, setSigners] = useState<Signer[]>([
    {
      name: "",
      address: "",
      hasApproved: false,
    },
  ]);
  const [requiredSignatures, setRequiredSignatures] = useState(1);
  const [createdAddress, setCreatedAddress] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [approvalCount, setApprovalCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connectWallet = async (index: number) => {
    setLoading(true);
    setError("");

    try {
      if (!provider) {
        throw new Error("Please connect your wallet first");
      }

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const newSigners = [...signers];
      newSigners[index] = { ...newSigners[index], address };
      setSigners(newSigners);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const addSigner = () => {
    if (signers.length >= 5) {
      setError("Maximum 5 signers allowed");
      return;
    }
    const newSigners = [
      ...signers,
      { name: "", address: "", hasApproved: false },
    ];
    setSigners(newSigners);
    setRequiredSignatures(Math.min(newSigners.length, requiredSignatures));
  };

  const removeSigner = (index: number) => {
    if (signers.length <= 1) {
      setError("At least one signer is required");
      return;
    }

    const newSigners = signers.filter((_, i) => i !== index);
    setSigners(newSigners);
    setRequiredSignatures(Math.min(requiredSignatures, newSigners.length));
  };

  const validateSigners = () => {
    const allSignersComplete = signers.every(
      (signer) => signer.name && signer.address
    );
    if (!allSignersComplete) {
      setError("All signers must have names and connected wallets");
      return false;
    }

    const addresses = signers.map((signer) => signer.address.toLowerCase());
    const uniqueAddresses = new Set(addresses);
    if (addresses.length !== uniqueAddresses.size) {
      setError("Duplicate wallet addresses are not allowed");
      return false;
    }

    return true;
  };

  const createWallet = async () => {
    if (!validateSigners()) return;

    setLoading(true);
    setError("");

    try {
      if (!provider) {
        throw new Error("Please connect your wallet first");
      }

      const signer = provider.getSigner();
      const signerAddresses = signers.map((s) => s.address);
      const allSigners = [tbaAddress, ...signerAddresses];

      const factory = new ethers.ContractFactory(
        MULTISIG_WALLET_ABI,
        MULTISIG_WALLET_BYTECODE,
        signer
      );
      const newContract = await factory.deploy(allSigners, requiredSignatures);
      await newContract.deployed();

      setContract(newContract);
      setCreatedAddress(newContract.address);
      setWalletCreated(true);
      setStep(4);
    } catch (error: any) {
      console.error("Error creating MultiSig wallet:", error);
      setError("Failed to create MultiSig wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!walletCreated || !contract) {
      setError("MultiSig wallet must be created first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signer = provider?.getSigner();
      const signerAddress = await signer?.getAddress();

      // Find signer index
      const signerIndex = signers.findIndex(
        (s) => s.address.toLowerCase() === signerAddress.toLowerCase()
      );

      if (signerIndex === -1) {
        throw new Error("Not authorized to sign this transaction");
      }

      if (signers[signerIndex].hasApproved) {
        throw new Error("You have already approved this transaction");
      }

      // Submit transaction
      const tx = await contract.submitTransaction(
        transactionDetails.to,
        ethers.utils.parseEther(transactionDetails.amount),
        "0x",
        { gasLimit: 500000 }
      );

      await tx.wait();

      // Update signer approval status
      const updatedSigners = [...signers];
      updatedSigners[signerIndex].hasApproved = true;
      setSigners(updatedSigners);

      const newApprovalCount = approvalCount + 1;
      setApprovalCount(newApprovalCount);

      if (newApprovalCount >= requiredSignatures) {
        onApproval();
        onComplete();
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const BackButton = () => (
    <button
      onClick={() => setStep(step - 1)}
      className="mb-4 flex items-center text-gray-600 hover:text-black"
      disabled={loading}
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Authorized Signers</h2>
              <button
                onClick={addSigner}
                className="px-4 py-2 bg-gray-100 text-black hover:bg-gray-200 rounded-md transition-all flex items-center space-x-2"
                disabled={loading || signers.length >= 5}
              >
                <Users className="w-4 h-4" />
                <span>Add Signer</span>
              </button>
            </div>

            <div className="space-y-4">
              {signers.map((signer, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Signer name"
                        className="w-full p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={signer.name}
                        onChange={(e) => {
                          const newSigners = [...signers];
                          newSigners[index].name = e.target.value;
                          setSigners(newSigners);
                        }}
                        disabled={loading}
                      />
                    </div>
                    {signer.address ? (
                      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{`${signer.address.slice(
                          0,
                          6
                        )}...${signer.address.slice(-4)}`}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => connectWallet(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all flex items-center space-x-2"
                        disabled={loading}
                      >
                        <span>Connect Wallet</span>
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        onClick={() => removeSigner(index)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-all"
                        disabled={loading}
                      ></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-3">Required Signatures</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={requiredSignatures}
                  onChange={(e) =>
                    setRequiredSignatures(Number(e.target.value))
                  }
                  className="p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loading}
                >
                  {signers.map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
                <span className="text-gray-600">
                  out of {signers.length} signers
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              disabled={loading}
            >
              Continue
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <BackButton />
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Review MultiSig Setup</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Total Signers</span>
                  <span className="font-medium">
                    {signers.length + 1} (including TBA)
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Required Signatures</span>
                  <span className="font-medium">
                    {requiredSignatures} out of {signers.length + 1}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={createWallet}
                  className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-spin">⚡</span>
                      <span>Creating Wallet...</span>
                    </span>
                  ) : (
                    "Create MultiSig Wallet"
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <BackButton />
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <h2 className="text-2xl font-bold mb-4">Confirm Transaction</h2>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Wallet Address</p>
                <p className="font-mono bg-gray-100 p-2 rounded">
                  {createdAddress}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">Approval Progress</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-bold text-xl">{approvalCount}</span>
                  <span className="text-gray-500">of</span>
                  <span className="font-bold text-xl">
                    {requiredSignatures}
                  </span>
                  <span className="text-gray-500">required signatures</span>
                </div>
              </div>

              <button
                onClick={handleApproval}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="animate-spin">⚡</span>
                    <span>Processing...</span>
                  </span>
                ) : (
                  "Approve Transaction"
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold mb-4">Pending Transaction</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{transactionDetails.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {transactionDetails.amount} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-mono text-sm">{transactionDetails.to}</span>
            </div>
            {transactionDetails.tokenAddress && (
              <div className="flex justify-between">
                <span className="text-gray-600">Token Address:</span>
                <span className="font-mono text-sm">
                  {transactionDetails.tokenAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {renderStep()}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSigWalletCreator;
