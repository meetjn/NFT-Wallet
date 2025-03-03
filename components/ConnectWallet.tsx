// ConnectWallet.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWallet: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to connect to the wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No Ethereum wallet detected. Please install MetaMask!');
      return;
    }
    try {
      // Request wallet connection
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      setAddress(account);
      setError(null);
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet.');
    }
  };

  // Note: Programmatic disconnect is not supported by most wallets (like MetaMask).
  // To "disconnect", you can simply clear the local state.
  const disconnectWallet = () => {
    setAddress(null);
  };

  // Optionally, you can check if a wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
      {address ? (
        <div className="text-center">
          <p className="mb-2 text-lg">Connected: {address}</p>
          <button
            onClick={disconnectWallet}
            className="px-6 py-3 bg-red-500 text-white rounded-lg"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default ConnectWallet;
