"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { X, ChevronLeft } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useRouter } from "next/navigation";

import {
  MULTISIG_WALLET_ABI,
  MULTISIG_WALLET_BYTECODE,
} from "../context/constant";

interface Signer {
  name: string;
  address: string;
}
interface MultiSigWalletCreatorProps {
  onComplete: () => void; // Callback to notify when the setup is complete
}

const MultiSigWalletCreator: React.FC<MultiSigWalletCreatorProps> = ({
  onComplete,
}) => {
  const { provider } = useWeb3();
  const [step, setStep] = useState(1);
  const [signers, setSigners] = useState<Signer[]>([{ name: "", address: "" }]);
  const [requiredSignatures, setRequiredSignatures] = useState(1);
  const [createdAddress, setCreatedAddress] = useState("");
  const router = useRouter();
  const [activeSignerAddress, setActiveSignerAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLetsGo = () => {
    onComplete(); // Notify parent component that setup is complete
  };

  const connectWallet = async (index: number) => {
    setLoading(true);
    setError("");

    try {
      if (!provider) {
        throw new Error("Please connect your wallet first");
      }

      // Ensure MetaMask prompts for wallet selection
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Update active signer address when a wallet is connected
      setActiveSignerAddress(address); // Added

      const newSigners = [...signers];
      newSigners[index] = { ...newSigners[index], address };
      setSigners(newSigners);

      console.log("Connected wallet address:", address); // Added
      console.log("Updated signers array:", newSigners); // Added
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const addSigner = () => {
    const newSigners = [...signers, { name: "", address: "" }];
    setSigners(newSigners);
    setRequiredSignatures(newSigners.length);
    console.log("Signer added. Total signers:", newSigners.length); // Added
  };

  const removeSigner = (index: number) => {
    const signerToRemove = signers[index];

    // If the removed signer is the active signer, reset the active signer address
    if (signerToRemove.address === activeSignerAddress) {
      setActiveSignerAddress(""); // Added
    }

    const newSigners = signers.filter((_, i) => i !== index);
    setSigners(newSigners);

    // Adjust the required signatures to match the new number of signers
    const updatedThreshold = Math.min(requiredSignatures, newSigners.length);
    setRequiredSignatures(updatedThreshold);

    console.log("Signer removed. Updated signers:", newSigners); // Added
    console.log("Updated Threshold:", updatedThreshold); // Added
  };

  const createWallet = async () => {
    setLoading(true);
    setError("");

    try {
      if (!provider) {
        throw new Error("Please connect your wallet first");
      }

      const signer = provider.getSigner();

      console.log(
        "Deploying Wallet with Threshold:",
        requiredSignatures,
        "Signers:",
        signers.map((s) => s.address)
      ); // Added

      const factory = new ethers.ContractFactory(
        MULTISIG_WALLET_ABI,
        MULTISIG_WALLET_BYTECODE,
        signer
      );

      const contract = await factory.deploy(
        signers.map((s) => s.address),
        requiredSignatures // Pass the threshold
      );

      await contract.deployed();

      console.log("Wallet created successfully at:", contract.address); // Added
      setCreatedAddress(contract.address);

      setStep(4);
    } catch (error: any) {
      console.error("Error creating wallet:", error);

      if (error.code === "ACTION_REJECTED") {
        setError("Transaction rejected by the user.");
      } else {
        setError("Failed to create wallet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="">
            <h2 className="text-xl font-urbanist-bold">Create New Wallet</h2>
            <button
              onClick={() => setStep(2)}
              className="py-3 px-6 bg-[#CE192D] font-urbanist-semibold rounded-lg text-white mt-2"
            >
              Create account
            </button>
          </div>
        );

      case 2:
        console.log(
          "Authorized Signers Step: Current Threshold:",
          requiredSignatures
        ); // Added

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Authorized Signers</h2>
              <button
                onClick={addSigner}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                + Add Signer
              </button>
            </div>
            {signers.map((signer, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Signer name"
                  className="p-2 bg-gray-800 rounded"
                  value={signer.name}
                  onChange={(e) => {
                    const newSigners = [...signers];
                    newSigners[index].name = e.target.value;
                    setSigners(newSigners);
                  }}
                />
                {signer.address ? (
                  <span className="text-gray-300">{signer.address}</span>
                ) : (
                  <button
                    onClick={() => connectWallet(index)}
                    className="flex-1 p-2 bg-blue-900 text-blue-300 rounded"
                  >
                    Connect Wallet
                  </button>
                )}
                {index > 0 && (
                  <button onClick={() => removeSigner(index)}>
                    <X className="text-gray-400" />
                  </button>
                )}
              </div>
            ))}
            <div className="space-y-2">
              <h3 className="text-lg">Threshold</h3>
              <select
                value={requiredSignatures}
                onChange={(e) => {
                  const newThreshold = Number(e.target.value);
                  setRequiredSignatures(newThreshold);
                  console.log("Updated Threshold:", newThreshold); // Added
                }}
                className="p-2 bg-gray-800 rounded"
              >
                {signers.map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <span className="ml-2">Threshold limit {signers.length}</span>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center px-4 py-2 text-gray-400"
              >
                <ChevronLeft className="mr-1" /> Previous Step
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        console.log(
          "Review Step: Required Signatures:",
          requiredSignatures,
          "Total Signers:",
          signers.length
        ); // Added
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Review</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Network</span>
                <span>Ethereum</span>
              </div>
              <div className="flex justify-between">
                <span>Threshold</span>
                <span>
                  {requiredSignatures} out of {signers.length} signers
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-green-500 text-green-500 rounded-lg"
              >
                Back
              </button>
              <button
                onClick={createWallet}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Create Wallet
              </button>
            </div>
          </div>
        );

      case 4:
        console.log("Wallet Created Successfully!"); // Added
        console.log("Contract Address:", createdAddress); // Added
        console.log("Threshold (Required Signatures):", requiredSignatures); // Added
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">Your account is almost set!</h2>
            <p>Use your wallet to receive funds on Ethereum.</p>
            <p className="text-gray-500">{createdAddress}</p>
            <button
              onClick={handleLetsGo}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Let’s Go
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const errorDisplay = error && (
    <div className="text-red-500 mt-2">{error}</div>
  );

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
        {renderStep()}
        {errorDisplay}
    </div>
  );
};

export default MultiSigWalletCreator;
