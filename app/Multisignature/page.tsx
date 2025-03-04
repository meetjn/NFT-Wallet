"use client";

import React, { useState } from "react";
import { Web3Provider } from "@/context/Web3Context";
import MultiSigWalletCreator from "@/components/MultiSignature";
import Link from "next/link"; // Import Link component

export default function CreateAccount() {
  const [isWalletCreated, setIsWalletCreated] = useState(false);

  return (
    <div className="w-full h-screen">
      <Web3Provider>
        <MultiSigWalletCreator
          onComplete={() => {
            console.log("MultiSig Wallet Creation Complete");
            // When the wallet creation is complete, update the state
            setIsWalletCreated(true);
          }}
        />

        {/* Conditional rendering based on wallet creation */}
        {isWalletCreated ? (
          <Link href="/some-other-page">
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Go to Another Page
            </button>
          </Link>
        ) : (
          <p>Creating your MultiSig Wallet...</p>
        )}

        {/* Add a button that navigates to the home page */}
        <Link href="/" passHref>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Go to Home
          </button>
        </Link>
      </Web3Provider>
    </div>
  );
}
