// contexts/Web3Context.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MultiSigWallet from '../artifacts/contracts/MultiSignature.sol/MultiSigWallet.json';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [owners, setOwners] = useState([]);
  const [threshold, setThreshold] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize Web3
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          // Replace with your deployed contract address
          const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
          const multiSigContract = new ethers.Contract(
            contractAddress,
            MultiSigWallet.abi,
            signer
          );

          setAccount(accounts[0]);
          setContract(multiSigContract);
          setProvider(provider);

          // Load initial contract data
          await loadContractData(multiSigContract);
        }
      } catch (error) {
        console.error("Failed to initialize Web3:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Load contract data
  const loadContractData = async (contract) => {
    try {
      // Get owners array
      let ownersArray = [];
      let index = 0;
      while (true) {
        try {
          const owner = await contract.owners(index);
          ownersArray.push(owner);
          index++;
        } catch (error) {
          break;
        }
      }
      setOwners(ownersArray);

      // Get threshold
      const threshold = await contract.threshold();
      setThreshold(threshold.toNumber());

      // Load transactions (you might want to limit this or paginate)
      await loadTransactions(contract);
    } catch (error) {
      console.error("Failed to load contract data:", error);
    }
  };

  // Load transactions
  const loadTransactions = async (contract) => {
    try {
      // You'll need to implement your own logic to get transactions
      // This is just an example structure
      const txs = []; // This would be populated from contract events/state
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  // Contract interaction functions
  const submitTransaction = async (to, value, data) => {
    try {
      const tx = await contract.submitTransaction(to, value, data);
      await tx.wait();
      await loadTransactions(contract);
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      throw error;
    }
  };

  const confirmTransaction = async (transactionId) => {
    try {
      const tx = await contract.confirmTransaction(transactionId);
      await tx.wait();
      await loadTransactions(contract);
    } catch (error) {
      console.error("Failed to confirm transaction:", error);
      throw error;
    }
  };

  const executeTransaction = async (transactionId) => {
    try {
      const tx = await contract.executeTransaction(transactionId);
      await tx.wait();
      await loadTransactions(contract);
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
    transactions,
    loading,
    submitTransaction,
    confirmTransaction,
    executeTransaction,
    loadContractData,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

// Custom hook to use the Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}