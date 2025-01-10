import { useState } from "react";
import { Plus, ArrowLeft, Info, X, Copy, CheckCircle } from "lucide-react";

// Success Modal Component
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

function SuccessModal({ isOpen, onClose, walletAddress }: SuccessModalProps) {
  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress).catch((err) => {
      console.error("Failed to copy", err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div
        className="fixed inset-0 bg-black" // Changed to bg-black for full opacity
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md p-6 mx-auto bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Check Icon */}
          <div className="p-4 bg-green-600/20 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-white">
            Your account is almost set!
          </h2>

          {/* Description */}
          <p className="text-center text-gray-400">
            Activate the account per network to unlock all features of your
            smart wallet.
          </p>

          {/* Wallet Address Section */}
          <div className="w-full p-4 bg-[#2C2C2C] rounded-lg border border-gray-700">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Wallet Address
              </span>
              <button
                onClick={handleCopyAddress}
                className="flex items-center space-x-1 text-green-500 hover:text-green-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="text-sm font-mono text-gray-300 break-all">
              {walletAddress}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 text-white transition-colors duration-300 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Let's Go
          </button>
        </div>
      </div>
    </div>
  );
}

// Main MultisigSetup Component
export default function MultisigSetup() {
  const [signers, setSigners] = useState([{ name: "Signer 1", address: "" }]);
  const [threshold, setThreshold] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const addSigner = () => {
    setSigners([
      ...signers,
      { name: `Signer ${signers.length + 1}`, address: "" },
    ]);
  };

  const removeSigner = (index: number) => {
    const newSigners = signers.filter((_, i) => i !== index);
    setSigners(newSigners);
    if (threshold > newSigners.length) setThreshold(newSigners.length);
  };

  const updateSigner = (
    index: number,
    field: "name" | "address",
    value: string
  ) => {
    const newSigners = [...signers];
    newSigners[index][field] = value;
    setSigners(newSigners);
  };

  const connectWallet = async (index: number) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        updateSigner(index, "address", accounts[0]);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleContinue = () => {
    // Update walletAddress based on the first signer's address
    const firstSignerAddress = signers[0]?.address; // Default if no address
    setWalletAddress(firstSignerAddress);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12">
          Multi-Signature Setup
        </h1>

        {/* Signers Section */}
        <div className="space-y-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white">Authorized Signers</h2>
              <button
                onClick={addSigner}
                className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Plus size={18} />
                Add Signer
              </button>
            </div>

            <div className="space-y-4">
              {signers.map((signer, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 flex gap-4"
                >
                  <input
                    type="text"
                    value={signer.name}
                    onChange={(e) =>
                      updateSigner(index, "name", e.target.value)
                    }
                    className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white flex-1"
                    placeholder="Signer Name"
                  />

                  {signer.address ? (
                    <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 flex-[2]">
                      <span className="truncate text-gray-300">
                        {signer.address}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => connectWallet(index)}
                      className="bg-blue-500/20 text-blue-400 px-4 rounded hover:bg-blue-500/30 transition-colors flex-[2]"
                    >
                      Connect Wallet
                    </button>
                  )}

                  {index > 0 && (
                    <button
                      onClick={() => removeSigner(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Threshold Section */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl text-white">Required Signatures</h2>
              <Info size={16} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white"
              >
                {[...Array(signers.length)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-gray-300">
                signatures required out of {signers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button className="text-white/80 hover:text-white flex items-center gap-2">
            <ArrowLeft size={20} />
            Previous Step
          </button>
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-2 rounded-lg hover:opacity-90"
          >
            Continue
          </button>
        </div>

        {/* Success Modal */}
        <SuccessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          walletAddress={walletAddress}
        />
      </div>
    </div>
  );
}
