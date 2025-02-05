"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import {
  LegacyUiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  EthereumTransactionTypeExtended,
  Pool
} from "@aave/contract-helpers";
import {formatReserves} from '@aave/math-utils'
import dayjs from 'dayjs'
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

  //checking wallet balance for specific token:

  const checkWalletBalance =  async (tokenAddress) => {
    if(!provider || !address){
      console.log("Provider or user address is not initialised!");
      return BigNumber.from(0);
    }
    try {
      const tokenContract = new ethers.Contract(tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );

      const balance = await tokenContract.balanceOf(address);
      console.log("wallet balance: ", balance.toString());
      return balance;
    } catch (error) {
      console.error("Error fetching wallet balance: ", error)
      return BigNumber.from(0);
    }

  }

  useEffect(() => {
    if (provider) {
      console.log("Provider is set:", provider);
      fetchAaveData();
    }
  }, [provider]);

  const poolDataProvider = provider
    ? new LegacyUiPoolDataProvider({
        uiPoolDataProviderAddress:
          markets.AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
        provider,
        chainId: ChainId.sepolia,
      })
    : null;

  const incentiveDataProvider = provider
    ? new UiIncentiveDataProvider({
        uiIncentiveDataProviderAddress:
          markets.AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
        provider,
        chainId: ChainId.sepolia,
      })
    : null;

    const fetchAaveData = async () => {
      if (!poolDataProvider || !incentiveDataProvider) {
        console.error("Data providers are not initialized.");
        return null;
      }
      if (!address) {
        console.error("User address is not available.");
        return null;
      }
    
      try {
        // Object containing array of pool reserves and market base currency data
        console.log("Fetching reserves data...");
        const reserves = await poolDataProvider.getReservesHumanized({
          lendingPoolAddressProvider:
            markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
        });
    
        console.log("reserves data:", reserves);
    
        //object containing array of user's aave position
        console.log("Fetching user reserves data...");
        const userReserves = await poolDataProvider.getUserReservesHumanized({
          lendingPoolAddressProvider:
            markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
          user: address,
        });
        console.log("User reserves data:", userReserves);

        //formatting fetched reserves data:
        const reservesArray = reserves.reservesData;
        const baseCurrencyData = reserves.baseCurrencyData;
        const currentTimestamp = dayjs().unix();

        const formattedPoolReserves = formatReserves({
          reserves: reservesArray,
          currentTimestamp,
          marketReferenceCurrencyDecimals:
            baseCurrencyData.marketReferenceCurrencyDecimals,
          marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        });

        console.log("meow meow formatted reserves: ", formattedPoolReserves);
    
        return { formattedPoolReserves };
      } catch (error) {
        console.error("Error fetching Aave data:", error);
        return null; 
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
       POOL: markets.AaveV3Sepolia.POOL,
       WETH_GATEWAY: markets.AaveV3Sepolia.WETH_GATEWAY,
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
    <ContractContext.Provider value={{ fetchAaveData, submitTransaction, supplyWithPermit, checkWalletBalance}}>
      {children}
    </ContractContext.Provider>
  );
};
