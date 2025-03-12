import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { AlertCircle, Copy, X } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { MULTISIG_WALLET_ABI } from "../context/constant";

interface TransactionDetails {
  type: string;
  amount: string;
  to: string;
  tokenAddress?: string;
  inputTokenAddress?: string;
  outputTokenAddress?: string;
  swapAmount?: string;
  slippage?: string;
}

interface Signer {
  name: string;
  address: string;
}

interface TransactionApprovalProps {
  transactionDetails: TransactionDetails;
  tbaAddress: string;
  onApproval: () => void;
  onComplete: () => void;
}

const TransactionApproval: React.FC<TransactionApprovalProps> = ({
  transactionDetails,
  tbaAddress,
  onApproval,
  onComplete,
}) => {
  console.log("TransactionApproval Component Rendered");
  console.log("Transaction Details:", transactionDetails);
  console.log("TBA Address:", tbaAddress);
  const { provider } = useWeb3();
  const [walletAddress, setWalletAddress] = useState("");
  const [signers, setSigners] = useState<Signer[]>([]);
  const [requiredSignatures, setRequiredSignatures] = useState(0);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");
  // Track only external approvers (TBA is auto-approved)
  const [approvers, setApprovers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [transactionApproved, setTransactionApproved] = useState(false);

  // Load multisig data from localStorage and initialize contract
  const loadData = useCallback(async () => {
    try {
      const storedWalletAddress = localStorage.getItem("multisigWalletAddress");
      const storedSignersJson = localStorage.getItem("multisigSigners");
      const storedRequiredSignatures = localStorage.getItem(
        "multisigRequiredSignatures"
      );

      if (!storedWalletAddress) {
        throw new Error("No wallet address found");
      }
      setWalletAddress(storedWalletAddress);

      let parsedSigners: Signer[] = [];
      try {
        parsedSigners = JSON.parse(storedSignersJson || "[]");
      } catch (parseError) {
        console.error("Failed to parse signers:", parseError);
        throw new Error("Invalid signers data");
      }
      if (!parsedSigners || parsedSigners.length === 0) {
        throw new Error("No signers found");
      }
      const parsedRequiredSignatures = parseInt(
        storedRequiredSignatures || "0",
        10
      );
      if (isNaN(parsedRequiredSignatures)) {
        throw new Error("Invalid required signatures");
      }
      setSigners(parsedSigners);
      setRequiredSignatures(parsedRequiredSignatures);

      if (provider) {
        const signer = provider.getSigner();
        const multisigContract = new ethers.Contract(
          storedWalletAddress,
          MULTISIG_WALLET_ABI,
          signer
        );
        setContract(multisigContract);
        const signerAddress = await signer.getAddress();
        setCurrentSignerAddress(signerAddress);

        const isAuthorized = parsedSigners.some(
          (s) => s.address.toLowerCase() === signerAddress.toLowerCase()
        );
        if (!isAuthorized) {
          throw new Error(
            "Current account is not among the authorized signers. Please switch accounts."
          );
        }
      }
    } catch (err: any) {
      console.error("Error in loadData:", err);
      setError(err.message || "Failed to load wallet data");
    }
  }, [provider]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // "accountsChanged" event triggers whenever user switches accounts in MetaMask
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          console.log("Switched to account:", accounts[0]);
          setCurrentSignerAddress(accounts[0]);

          // Re-initialize the contract with the new signer
          if (provider && walletAddress) {
            const newSigner = new ethers.providers.Web3Provider(
              window.ethereum
            ).getSigner();
            const newContract = new ethers.Contract(
              walletAddress,
              MULTISIG_WALLET_ABI,
              newSigner
            );
            setContract(newContract);
          }
          await loadData(); // NEW: re-run loadData to validate the new account.
        } else {
          setCurrentSignerAddress("");
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      // Cleanup: remove the listener on unmount
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [provider, walletAddress, loadData]);

  // Total signers count = external signers + TBA. We want to show progress as (external approvals + 1) / (total signers)
  const totalSignersCount = signers.length + 1; // external + TBA
  const approvalProgressNumerator = approvers.length + 1; // +1 because TBA is auto-approved

  // Check if current signer is a valid external signer (must be in signers array)
  const isValidSigner = () =>
    signers.some(
      (s) => s.address.toLowerCase() === currentSignerAddress.toLowerCase()
    );

  // Check if current external signer has already approved
  const hasCurrentSignerApproved = () =>
    approvers.some(
      (addr) => addr.toLowerCase() === currentSignerAddress.toLowerCase()
    );

  // Helper for local ephemeral transaction ID tracking
  const getLocalTxCount = () =>
    parseInt(localStorage.getItem("localTxCount") || "0", 10);
  const setLocalTxCount = (value: number) => {
    localStorage.setItem("localTxCount", value.toString());
  };

  const handleApproval = async () => {
    if (!contract) {
      setError("Contract not initialized");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Re-fetch the current signer so we have the updated account.
      const newSigner = new ethers.providers.Web3Provider(
        window.ethereum
      ).getSigner();
      const updatedAddress = await newSigner.getAddress();
      setCurrentSignerAddress(updatedAddress);

      if (!isValidSigner()) {
        throw new Error("You're not an authorized external signer");
      }
      if (hasCurrentSignerApproved()) {
        throw new Error("You have already approved this transaction");
      }

      if (transactionId === null) {
        // First external signer: submit the transaction.
        const tx = await contract.submitTransaction(
          transactionDetails.to,
          ethers.utils.parseEther(transactionDetails.amount),
          "0x",
          { gasLimit: 500000 }
        );
        await tx.wait();

        // Use localStorage to track transaction ID
        const localTxCount = getLocalTxCount();
        setTransactionId(localTxCount);
        setLocalTxCount(localTxCount + 1);
      } else {
        // Subsequent external signers confirm the transaction.
        const tx = await contract.confirmTransaction(transactionId, {
          gasLimit: 500000,
        });
        await tx.wait();
      }

      // Update our external approvers list.
      const newApprovers = [...approvers, updatedAddress];
      setApprovers(newApprovers);

      if (newApprovers.length + 1 >= totalSignersCount) {
        setTransactionApproved(true);
        onApproval();
        setTimeout(onComplete, 2000);
      }
    } catch (err: any) {
      console.error("Transaction approval failed:", err);
      setError(err.message || "Transaction approval failed");
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return transactionId !== null
      ? `${baseUrl}?walletAddress=${walletAddress}&txId=${transactionId}`
      : "";
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(`${type} copied!`);
        setTimeout(() => setCopySuccess(""), 3000);
      },
      (err) => {
        console.error("Could not copy text:", err);
        setCopySuccess("Failed to copy");
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative p-6 max-w-2xl w-full bg-white rounded-lg shadow-lg space-y-4">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={() => onComplete()}
        >
          <X className="w-6 h-6" />
        </button>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <h2 className="text-2xl font-bold">Transaction Approval</h2>

        <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-2">
          <p>
            <b>Type:</b> {transactionDetails.type}
          </p>
          <p>
            <b>Amount:</b> {transactionDetails.amount} {transactionDetails.type}
          </p>
          <p>
            <b>To:</b> {transactionDetails.to}
          </p>
          {transactionDetails.tokenAddress && (
            <p>
              <b>Token Address:</b> {transactionDetails.tokenAddress}
            </p>
          )}
          <p>
            <b>TBA Address:</b> {tbaAddress} (Auto-approved)
          </p>
        </div>

        <div>
          <p className="text-gray-600">
            Approval Progress:{" "}
            <span className="font-bold text-xl">
              {approvalProgressNumerator} / {totalSignersCount}
            </span>{" "}
            signatures
          </p>
        </div>

        <div>
          <h4 className="font-medium">Current Approvals:</h4>
          {/* Display TBA first */}
          <p>
            {tbaAddress.slice(0, 6)}...{tbaAddress.slice(-4)} (TBA -
            Auto-approved) ✓
          </p>
          {/* Then list external approvers */}
          {approvers.map((addr, idx) => {
            const found = signers.find(
              (s) => s.address.toLowerCase() === addr.toLowerCase()
            );
            return (
              <p key={idx}>
                {found
                  ? `${found.name} (${addr.slice(0, 6)}...${addr.slice(-4)})`
                  : addr.slice(0, 6) + "..." + addr.slice(-4)}{" "}
                ✓
              </p>
            );
          })}
        </div>

        <button
          onClick={handleApproval}
          className={`w-full px-4 py-2 mt-4 rounded ${
            !hasCurrentSignerApproved() && isValidSigner()
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={loading || hasCurrentSignerApproved() || !isValidSigner()}
        >
          {loading ? "Processing..." : "Approve Transaction"}
        </button>

        {walletAddress && transactionId !== null && (
          <div className="space-y-2 mt-4">
            <h4 className="font-medium">Share with other signers:</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generateShareLink()}
                readOnly
                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
              />
              <button
                onClick={() => copyToClipboard(generateShareLink(), "Link")}
                className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-all"
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copySuccess && (
              <p className="text-green-500 text-sm">{copySuccess}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionApproval;
