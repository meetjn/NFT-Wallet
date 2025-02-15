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
      </Web3Provider>
    </div>
  );
}
