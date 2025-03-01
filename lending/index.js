"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  EthereumTransactionTypeExtended,
  Pool
} from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";

const ContractContext = createContext();

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Initialize provider and signer
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

  useEffect(() => {
    if (provider) {
      console.log("Provider is set:", provider);
      fetchAaveData();
    }
  }, [provider]);

  const poolDataProvider = provider
    ? new UiPoolDataProvider({
        uiPoolDataProviderAddress:
          markets.AaveV3ArbitrumSepolia.UI_POOL_DATA_PROVIDER,
        provider,
        chainId: ChainId.arbitrum_sepolia,
      })
    : null;

  const incentiveDataProvider = provider
    ? new UiIncentiveDataProvider({
        uiIncentiveDataProviderAddress:
          markets.AaveV3ArbitrumSepolia.UI_INCENTIVE_DATA_PROVIDER,
        provider,
        chainId: ChainId.arbitrum_sepolia,
      })
    : null;

  const fetchAaveData = async () => {
    if (!poolDataProvider || !incentiveDataProvider) {
      console.error("Data providers are not initialized.");
      return;
    }
    if (!address) {
      console.error("User address is not available.");
      return;
    }

    try {
      console.log("Fetching reserves data...");
      const rawReserves = await poolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider:
          markets.AaveV3ArbitrumSepolia.POOL_ADDRESSES_PROVIDER,
      });

      console.log("Raw reserves data:", rawReserves);

      console.log("Fetching user reserves data...");
      const userReserves = await poolDataProvider.getUserReservesHumanized({
        lendingPoolAddressProvider:
          markets.AaveV3ArbitrumSepolia.POOL_ADDRESSES_PROVIDER,
        user: address,
      });
      console.log("User reserves data:", userReserves);
    } catch (error) {
      console.error("Error fetching Aave data:", error);
    }
  };

  //Txn setup:

  const submitTransaction = async ({ tx }) => {
    try {
      if (!provider) {
        console.error("Provider is not initialized.");
        return;
      }

      const extendedTxData = await tx.tx();
      const { from, ...txData } = extendedTxData;

      if (!signer) {
        console.error("Signer is not initialized.");
        return;
      }

      const txResponse = await signer.sendTransaction({
        ...txData,
        value: txData.value ? BigNumber.from(txData.value) : undefined,
      });

      console.log("Transaction submitted successfully:", txResponse);
      return txResponse;
    } catch (error) {
      console.error("Error submitting transaction:", error);
      throw error;
    }
  };

   // Initialize Pool instance
   const pool = provider
   ? new Pool(provider, {
       POOL: markets.AaveV3ArbitrumSepolia.POOL,
       WETH_GATEWAY: markets.AaveV3ArbitrumSepolia.WETH_GATEWAY,
     })
   : null;

 // Supply with permit
 const supplyWithPermit = async ({ reserve, amount, deadline }) => {
   if (!pool || !signer || !address) {
     console.error("Required dependencies are not initialized.");
     return;
   }

   try {
     console.log("Generating data to sign for permit...");
     const dataToSign = await pool.signERC20Approval({
       user: address,
       reserve,
       amount,
       deadline,
     });

     console.log("Requesting signature from user...");
     const signature = await provider.send("eth_signTypedData_v4", [
       address,
       dataToSign,
     ]);

     console.log("Performing supply with permit...");
     const txs = await pool.supplyWithPermit({
       user: address,
       reserve,
       amount,
       signature,
     });

     console.log("Submitting supplyWithPermit transaction...");
     const extendedTxData = await txs[0].tx();
     const { from, ...txData } = extendedTxData;

     const txResponse = await signer.submitTransaction({
       ...txData,
       value: txData.value ? BigNumber.from(txData.value) : undefined,
     });

     console.log("Transaction submitted successfully:", txResponse);
     return txResponse;
   } catch (error) {
     console.error("Error during supplyWithPermit:", error);
   }
 };

  return (
    <ContractContext.Provider value={{ fetchAaveData, submitTransaction, supplyWithPermit }}>
      {children}
    </ContractContext.Provider>
  );
};
