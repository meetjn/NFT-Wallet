"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { X, AlertCircle, CheckCircle2, Users } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import {
  MULTISIG_WALLET_ABI,
  MULTISIG_WALLET_BYTECODE,
} from "../context/constant";

interface Signer {
  name: string;
  address: string;
}

interface MultiSigCreatorProps {
  onComplete?: (
    walletAddress: string,
    signers: Signer[],
    requiredSignatures: number
  ) => void;
}

const MultiSigCreator: React.FC<MultiSigCreatorProps> = ({ onComplete }) => {
  const { provider } = useWeb3();
  const [signers, setSigners] = useState<Signer[]>([{ name: "", address: "" }]);
  const [requiredSignatures, setRequiredSignatures] = useState(1);
  const [createdAddress, setCreatedAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Removed auto-connection: currentSignerAddress will be set on click of "Connect Wallet"
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Remove auto-connection useEffect
  // useEffect(() => {
  //   const getCurrentWallet = async () => {
  //     if (provider) {
  //       try {
  //         const signer = provider.getSigner();
  //         const address = await signer.getAddress();
  //         setCurrentSignerAddress(address);
  //         setIsConnected(true);
  //       } catch (error) {
  //         console.error("Error getting current wallet:", error);
  //       }
  //     }
  //   };
  //   getCurrentWallet();
  // }, [provider]);

  // In your MultiSigCreator.tsx component

  const connectWallet = async (index: number) => {
    setLoading(true);
    setError("");

    try {
      // Check for MetaMask by verifying window.ethereum exists
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask.");
      }

      // Force MetaMask to prompt the user for permission
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = new ethers.providers.Web3Provider(
        window.ethereum
      ).getSigner();
      const address = await signer.getAddress();

      // Update the corresponding signer with the connected address
      const newSigners = [...signers];
      newSigners[index] = { ...newSigners[index], address };
      setSigners(newSigners);
      setCurrentSignerAddress(address);
      setIsConnected(true);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        setError("Transaction was rejected by the user.");
      } else {
        setError("Failed to connect wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  const addSigner = () => {
    if (signers.length >= 5) {
      setError("Maximum 5 signers allowed");
      return;
    }
    const newSigners = [...signers, { name: "", address: "" }];
    setSigners(newSigners);
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
      if (!provider) throw new Error("Provider not connected");

      const signer = provider.getSigner();
      const signerAddresses = signers.map((s) => s.address);

      const factory = new ethers.ContractFactory(
        MULTISIG_WALLET_ABI,
        MULTISIG_WALLET_BYTECODE,
        signer
      );

      const contract = await factory.deploy(
        signerAddresses,
        requiredSignatures
      );
      await contract.deployed();

      setCreatedAddress(contract.address);
      localStorage.setItem("multisigWalletAddress", contract.address);
      localStorage.setItem("multisigSigners", JSON.stringify(signers));
    } catch (error) {
      console.error("Deployment error:", error);
      setError(`Failed to create MultiSig wallet:`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl  pt-24 pl-48">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Create MultiSig Wallet
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Authorized Signers</h3>
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
                    <span className="text-sm text-gray-600">
                      {signer.address.slice(0, 6)}...
                      {signer.address.slice(-4)}
                    </span>
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
                  >
                    <X className="w-4 h-4" />
                  </button>
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
              onChange={(e) => setRequiredSignatures(Number(e.target.value))}
              className="p-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
            >
              {Array.from({ length: signers.length }).map((_, index) => (
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

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {createdAddress && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-green-700">
            Wallet Created!
          </h3>
          <p className="text-sm mb-2">Your MultiSig wallet address:</p>
          <p className="font-mono bg-gray-100 p-2 rounded overflow-x-auto break-all">
            {createdAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiSigCreator;
