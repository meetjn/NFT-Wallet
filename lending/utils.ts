import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { ethers, BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

export const submitTransaction = async ({ tx }:EthereumTransactionTypeExtended) => {
    const { isConnected, address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    useEffect(() => {
        if (walletClient && isConnected) {
          try {
            const Web3Provider = new ethers.providers.Web3Provider(
              walletClient.transport
            );
            const signerInstance = Web3Provider.getSigner();
            setProvider(Web3Provider);
            setSigner(signerInstance);
    
            console.log("Provider and signer initialized successfully.");
          } catch (error) {
            console.error("Error initializing provider and signer:", error);
          }
        }
      }, [walletClient, isConnected]);

    try {
      if (!provider) {
        console.error("Provider is not initialized.");
        return;
      }
  
      console.log("Fetching extended transaction data...");
      if (!tx || typeof tx.tx !== "function") {
        console.error("Error: tx object is invalid or does not have a tx() method.");
        return;
      }
      console.log("fetched lo ");
      const extendedTxData = await tx.tx();
      console.log("Extended Transaction Data:", extendedTxData);
  
      if (!extendedTxData) {
        console.error("Error: extendedTxData is undefined.");
        return;
      }
  
      const { from, ...txData } = extendedTxData;
  
      if (!signer) {
        console.error("Signer is not initialized.");
        return;
      }
  
      console.log("Final transaction data before sending:", txData);
  
      const txResponse = await signer.sendTransaction({
        ...txData,
        value: txData.value ? BigNumber.from(txData.value) : BigNumber.from("0"), // ✅ Ensure valid BigNumber
      });
  
      console.log("Transaction submitted successfully:", txResponse);
      return txResponse;
    } catch (error) {
      console.error("Error submitting transaction:", error);
      throw error;
    }
  };