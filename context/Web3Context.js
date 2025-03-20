"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import MultiSigWallet from "../artifacts/contracts/MultiSignature.sol/MultiSigWallet.json";

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [owners, setOwners] = useState([]);
  const [threshold, setThreshold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // TBA states
  const [tbaAddress, setTbaAddress] = useState("");
  const [manualTbaAddress, setManualTbaAddress] = useState("");
  const [existingTbas, setExistingTbas] = useState([]);

  // Check if MetaMask is installed
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMetaMaskInstalled(!!window.ethereum);
    }
  }, []);

  // Initialize Web3 provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          setIsMetaMaskInstalled(true);
          
          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0] || null);
          });
          
          return web3Provider;
        } else {
          setError("MetaMask not installed. Please install MetaMask to use this application.");
          setIsMetaMaskInstalled(false);
          return null;
        }
      } catch (error) {
        console.error("Failed to initialize provider:", error);
        setError("Failed to initialize Web3 provider.");
        return null;
      } finally {
        setLoading(false);
      }
    };

    initProvider();
  }, []);

  // Load contract and wallet data if available in localStorage
  useEffect(() => {
    const loadContractAndData = async () => {
      if (!provider) return;
      
      try {
        const storedWalletAddress = localStorage.getItem("multisigWalletAddress");
        const storedSigners = localStorage.getItem("multisigSigners");
        const storedRequiredSignatures = localStorage.getItem("multisigRequiredSignatures");
        let signer = null;
        if (storedWalletAddress && storedSigners && storedRequiredSignatures) {
        try {
  signer = provider.getSigner();
} catch (error) {
  // Handle error if needed; signer will remain null
}

// Only set the contract if we can get a signer
if (signer) {
  // Your logic using the signer
}
          
          // Only set the contract if we can get a signer
          if (signer) {
            const multiSigContract = new ethers.Contract(
              storedWalletAddress,
              MultiSigWallet.abi,
              signer
            );
            setContract(multiSigContract);
          }
          
          setOwners(JSON.parse(storedSigners).map((s) => s.address) || []);
          setThreshold(parseInt(storedRequiredSignatures) || 1);
        }
      } catch (error) {
        console.error("Failed to load contract data:", error);
      }
    };
    
    loadContractAndData();
  }, [provider]);
  
  // Connect wallet function that can be called from UI
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      setAccount(accounts[0]);
      
      return accounts[0];
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet. " + error.message);
      return null;
    }
  };

  // Contract interaction functions
  const submitTransaction = async (to, value, data) => {
    if (!contract) throw new Error("Contract not initialized");
    if (!account) throw new Error("Wallet not connected");
    
    try {
      const estimatedGas = await contract.estimateGas.executeTransaction(transactionId);
const tx = await contract.executeTransaction(transactionId, {
  gasLimit: estimatedGas.mul(120).div(100), // +20% buffer
});

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      throw error;
    }
  };

  const confirmTransaction = async (transactionId) => {
    if (!contract) throw new Error("Contract not initialized");
    if (!account) throw new Error("Wallet not connected");
    
    try {
      const tx = await contract.confirmTransaction(transactionId, {
        gasLimit: 500000,
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to confirm transaction:", error);
      throw error;
    }
  };

  const executeTransaction = async (transactionId) => {
    if (!contract) throw new Error("Contract not initialized");
    if (!account) throw new Error("Wallet not connected");
    
    try {
      const tx = await contract.executeTransaction(transactionId, {
        gasLimit: 500000,
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to execute transaction:", error);
      throw error;
    }
  };

  const value = {
    account,
    contract,
    provider,
    owners,
    threshold,
    loading,
    error,
    isMetaMaskInstalled,
    connectWallet,
    submitTransaction,
    confirmTransaction,
    executeTransaction,
    tbaAddress,
    setTbaAddress,
    manualTbaAddress,
    setManualTbaAddress,
    existingTbas,
    setExistingTbas,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}