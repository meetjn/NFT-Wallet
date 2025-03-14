"use client"; // Make sure this is client-side code

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const OrderBook: React.FC<{ pair: string }> = ({ pair }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      // Check if Ethereum is available(Mainnet)
      if (window.ethereum) {
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);

        const contractAddress = "0xYourContractAddress"; 
        const contractABI = "#"

        try {
          // Initializing the contract
          const orderBookContract = new ethers.Contract(
            contractAddress,
            contractABI,
            ethersProvider.getSigner()
          );
          setContract(orderBookContract);
        } catch (error) {
          console.error("Failed to initialize contract", error);
        }
      } else {
        console.error("Ethereum provider is not available.");
      }
    };

    initializeContract();
  }, []);

  return (
    <div>
      <h2>Order Book</h2>
      {/* order book data will go here */}
    </div>
  );
};

export default OrderBook;
