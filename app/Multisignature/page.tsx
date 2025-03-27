"use client";

import React, { useState } from "react";
import MultisigWalletCreator from "@/components/MultiSignature"; // Adjust path if needed
import { Web3Provider } from "@/context/Web3Context"; // Adjust path if needed
import { Loader2 } from "lucide-react";

const MultisigPage = () => {
  const [walletCreated, setWalletCreated] = useState(false);
  const [createdWalletAddress, setCreatedWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Called when the MultiSigWalletCreator finishes creating a wallet
  const handleWalletComplete = (
    walletAddress: string,
    signers: { name: string; address: string }[],
    requiredSignatures: number
  ) => {
    setWalletCreated(true);
    setCreatedWalletAddress(walletAddress);
  };

  // Optional: If you have an async flow, show a spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <Web3Provider>
      {/* Full screen gray background, center content */}

      <div className="w-full max-w-4xl px-4">
        {!walletCreated ? (
          /* If wallet not created yet, show the creator form */
          <MultisigWalletCreator onComplete={handleWalletComplete} />
        ) : (
          /* Otherwise, show success screen */
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Wallet Successfully Created!
            </h2>
            <p className="text-gray-600 mb-4">
              Your multisig wallet has been created at:
            </p>
            <p className="font-mono bg-gray-100 p-3 rounded break-all text-sm mx-auto max-w-xl mb-6">
              {createdWalletAddress}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  // Reset to create another wallet
                  setWalletCreated(false);
                  setCreatedWalletAddress("");
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Create Another Wallet
              </button>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(createdWalletAddress)
                }
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Copy Address
              </button>
            </div>
          </div>
        )}
      </div>
    </Web3Provider>
  );
};

export default MultisigPage;
