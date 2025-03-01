"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, providers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import {
  LegacyUiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  Pool,
  InterestRate,
} from "@aave/contract-helpers";
import { formatReserves, formatReservesAndIncentives, formatUserSummary, formatUserSummaryAndIncentives } from "@aave/math-utils";
import dayjs from "dayjs";
import * as markets from "@bgd-labs/aave-address-book";
import { submitTransaction } from "./utils/submitTransaction";
import { supplyWithPermit } from "./utils/supplyWithPermit";
import { borrow } from "./utils/borrow"; 
import { withdraw } from "./utils/withdraw";
import { repay, repayWithATokens } from "./utils/repay"; 

interface ContractContextType {
  fetchAaveData: () => Promise<{ formattedReserves: any } | null>;
  submitTransaction: ({ tx }: { tx: any }) => Promise<providers.TransactionResponse>;
  supplyWithPermit: ({
    reserve,
    amount,
    deadline,
  }: {
    reserve: string;
    amount: string;
    deadline: number;
  }) => Promise<providers.TransactionResponse>;
  borrow: ({
    reserve,
    amount,
    interestRateMode,
    onBehalfOf,
  }: {
    reserve: string;
    amount: string;
    interestRateMode: InterestRate;
    onBehalfOf?: string;
  }) => Promise<providers.TransactionResponse>;
  checkWalletBalance: (tokenAddress: string) => Promise<ethers.BigNumber>;
  withdraw: ({
    reserve,
    amount,
    aTokenAddress,
    onBehalfOf,
  }: {
    reserve: string;
    amount: string;
    aTokenAddress: string;
    onBehalfOf?: string;
  }) => Promise<providers.TransactionResponse>; 
  repay: ({
    reserve,
    amount,
    interestRateMode,
    onBehalfOf,
  }: {
    reserve: string;
    amount: string;
    interestRateMode: InterestRate;
    onBehalfOf?: string;
  }) => Promise<providers.TransactionResponse>; // Add repay function
  repayWithATokens: ({
    reserve,
    amount,
    rateMode,
  }: {
    reserve: string;
    amount: string;
    rateMode: InterestRate;
  }) => Promise<providers.TransactionResponse>; // Add repayWithATokens function
}

const ContractContext = createContext<ContractContextType | null>(null);

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};

export const ContractProvider = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<providers.JsonRpcSigner | null>(null);
  const [pool, setPool] = useState<Pool | null>(null);

  // Initialize provider, signer, and pool
  useEffect(() => {
    if (walletClient && isConnected) {
      try {
        const Web3Provider = new providers.Web3Provider(walletClient.transport);
        const signerInstance = Web3Provider.getSigner();
        setProvider(Web3Provider);
        setSigner(signerInstance);

        const poolInstance = new Pool(Web3Provider, {
          POOL: markets.AaveV3Sepolia.POOL,
          WETH_GATEWAY: markets.AaveV3Sepolia.WETH_GATEWAY,
        });
        setPool(poolInstance);

        console.log("Provider, signer, and pool initialized successfully.");
      } catch (error) {
        console.error("Error initializing provider, signer, or pool:", error);
      }
    }
  }, [walletClient, isConnected]);

  // Check wallet balance for a specific token
  const checkWalletBalance = async (tokenAddress: string): Promise<ethers.BigNumber> => {
    if (!provider || !address) {
      console.error("Provider or user address is not initialized.");
      return ethers.BigNumber.from(0);
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );

      const balance = await tokenContract.balanceOf(address);
      console.log("Wallet balance:", balance.toString());
      return balance;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      return ethers.BigNumber.from(0);
    }
  };

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

  // Fetch Aave data
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
      console.log("Fetching reserves data...");
      const reserves = await poolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider:
          markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      });

      console.log("reserves data:", reserves);

      console.log("Fetching user reserves data...");
      const userReserves = await poolDataProvider.getUserReservesHumanized({
        lendingPoolAddressProvider:
          markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
        user: address,
      });
      console.log("User reserves data:", userReserves);

      const reservesArray = reserves.reservesData;
      const baseCurrencyData = reserves.baseCurrencyData;
      const userReserveArray = userReserves.userReserves;

      const currentTimestamp = dayjs().unix();

      const formattedReserves = formatReserves({
        reserves: reservesArray,
        currentTimestamp,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      });

      console.log("Formatted reserves: ", formattedReserves);
  
     const userSummary = formatUserSummary({
      currentTimestamp,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReserveArray,
      formattedReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,

     })

     console.log("User summary: ", userSummary);
      return { formattedReserves,userSummary, baseCurrencyData };
    } catch (error) {
      console.error("Error fetching Aave data:", error);
      return null; 
    }
  };

  return (
    <ContractContext.Provider
      value={{
        fetchAaveData,
        submitTransaction: ({ tx }) => {
          if (!provider || !signer) {
            throw new Error("Provider or signer is not initialized.");
          }
          return submitTransaction({ tx, provider, signer });
        },
        supplyWithPermit: ({ reserve, amount, deadline }) => {
          if (!pool || !provider || !signer || !address) {
            throw new Error("Required dependencies are not initialized.");
          }
          return supplyWithPermit({
            reserve,
            amount,
            deadline,
            pool,
            provider,
            signer,
            user: address,
          });
        },
        borrow: ({ reserve, amount, interestRateMode, onBehalfOf }) => {
          if (!pool || !provider || !signer || !address) {
            throw new Error("Required dependencies are not initialized.");
          }
          return borrow({
            user: address,
            reserve,
            amount,
            pool,
            provider,
            signer,
            interestRateMode,
            onBehalfOf,
          });
        },
        checkWalletBalance,
        withdraw: ({ reserve, amount, aTokenAddress, onBehalfOf }) => {
          if (!pool || !provider || !signer || !address) {
            throw new Error("Required dependencies are not initialized.");
          }
          return withdraw({
            user: address,
            reserve,
            amount,
            aTokenAddress,
            pool,
            provider,
            signer,
            onBehalfOf,
          });
        },
        repay: ({ reserve, amount, interestRateMode, onBehalfOf }) => {
          if (!pool || !provider || !signer || !address) {
            throw new Error("Required dependencies are not initialized.");
          }
          return repay({
            user: address,
            reserve,
            amount,
            interestRateMode,
            pool,
            provider,
            signer,
            onBehalfOf,
          });
        },
        repayWithATokens: ({ reserve, amount, rateMode }) => {
          if (!pool || !provider || !signer || !address) {
            throw new Error("Required dependencies are not initialized.");
          }
          return repayWithATokens({
            user: address,
            reserve,
            amount,
            rateMode,
            pool,
            provider,
            signer,
          });
        },
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
