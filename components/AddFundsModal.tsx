// import { useState } from "react";
// import { ethers } from "ethers";
// import EthersAdapter from "@safe-global/safe-ethers-lib";
// import Safe, { SafeFactory } from "@safe-global/safe-core-sdk";
// import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
// import { CrossIcon, XIcon } from "lucide-react";

// interface AddFundsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   manualTbaAddress: string;
//   fundingAmount: string;
//   setFundingAmount: (amount: string) => void;
//   onFund: () => Promise<void>;
//   fundingType: string;
//   erc20Address?: string;
//   setErc20Address?: (address: string) => void;
//   multiSigAddress: string | null;
//   setMultiSigAddress: (address: string | null) => void;
//   isMultiSigDeployed: boolean;
//   setIsMultiSigDeployed: (deployed: boolean) => void;
// }

// const AddFundsModal: React.FC<AddFundsModalProps> = ({
//   isOpen,
//   onClose,
//   manualTbaAddress,
//   fundingAmount,
//   setFundingAmount,
//   onFund,
//   fundingType,
//   erc20Address,
//   setErc20Address,
//   multiSigAddress,
//   setMultiSigAddress,
//   isMultiSigDeployed,
//   setIsMultiSigDeployed,
// }) => {
//   const [isProposing, setIsProposing] = useState(false);
//   const [ownersInput, setOwnersInput] = useState<string>("");
//   const [thresholdInput, setThresholdInput] = useState<string>("2");
//   const [isCreatingSafe, setIsCreatingSafe] = useState(false);
//   const [safeTransaction, setSafeTransaction] = useState<any>(null);
//   const [signatures, setSignatures] = useState<string[]>([]);
//   const [safeTxHash, setSafeTxHash] = useState<string | null>(null);

//   if (!isOpen) return null;
//   const provider = new ethers.providers.Web3Provider(window.ethereum);

//   // Deploy Multisig Wallet
//   const deployMultiSig = async () => {
//     try {
//       setIsCreatingSafe(true);

//       const owners = ownersInput.split(",").map((addr) => addr.trim());
//       const threshold = parseInt(thresholdInput);

//       // Validate inputs
//       if (owners.length === 0 || threshold <= 0 || threshold > owners.length) {
//         return alert("Invalid threshold or owners input.");
//       }
//       if (!owners.every((addr) => ethers.utils.isAddress(addr))) {
//         return alert("One or more owner addresses are invalid.");
//       }

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeFactory = await SafeFactory.create({ ethAdapter });
//       const safeAccountConfig = { owners, threshold };

//       const safe = await safeFactory.deploySafe({ safeAccountConfig });
//       const safeAddress = await safe.getAddress();

//       setMultiSigAddress(safeAddress);
//       setIsMultiSigDeployed(true);
//       alert(`Multisig deployed at: ${safeAddress}`);
//     } catch (error) {
//       console.error("Error deploying multisig:", error);
//       alert("Failed to deploy multisig wallet.");
//     } finally {
//       setIsCreatingSafe(false);
//     }
//   };

//   // Propose Transaction
//   const proposeTransaction = async () => {
//     if (!multiSigAddress) return alert("No multisig wallet deployed.");

//     try {
//       setIsProposing(true);

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeSdk = await Safe.create({
//         ethAdapter,
//         safeAddress: multiSigAddress,
//       });

//       // Create transaction data
//       const safeTransactionData: SafeTransactionDataPartial = {
//         to: manualTbaAddress,
//         value: ethers.utils.parseEther(fundingAmount).toString(),
//         data: "0x",
//       };

//       // Create transaction
//       const transaction = await safeSdk.createTransaction({
//         safeTransactionData,
//       });
//       setSafeTransaction(transaction);

//       // Generate hash
//       const txHash = await safeSdk.getTransactionHash(transaction);
//       setSafeTxHash(txHash);

//       // Sign transaction
//       await safeSdk.signTransaction(transaction);
//       setSignatures([await signer.getAddress()]);

//       alert(`Transaction proposed! Hash: ${txHash}`);
//     } catch (error) {
//       console.error("Error proposing transaction:", error);
//       alert("Failed to propose transaction.");
//     } finally {
//       setIsProposing(false);
//     }
//   };

//   // Sign Transaction (for other owners)
//   const signTransaction = async () => {
//     if (!multiSigAddress || !safeTxHash)
//       return alert("No transaction to sign.");

//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       console.log("signer", signer);
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeSdk = await Safe.create({
//         ethAdapter,
//         safeAddress: multiSigAddress,
//       });

//       // Get transaction details from hash
//       const chainId = (await provider.getNetwork()).chainId;
//       const domain = { chainId, verifyingContract: multiSigAddress };
//       const types = {
//         SafeTx: [
//           { name: "to", type: "address" },
//           { name: "value", type: "uint256" },
//           { name: "data", type: "bytes" },
//           { name: "operation", type: "uint8" },
//           { name: "safeTxGas", type: "uint256" },
//           { name: "baseGas", type: "uint256" },
//           { name: "gasPrice", type: "uint256" },
//           { name: "gasToken", type: "address" },
//           { name: "refundReceiver", type: "address" },
//           { name: "nonce", type: "uint256" },
//         ],
//       };

//       // Sign using EIP-712
//       const signature = await signer._signTypedData(domain, types, {
//         ...safeTransaction.data,
//         nonce: await safeSdk.getNonce(),
//       });
//       console.log("signature", signature);
//       // Update signatures
//       setSignatures((prev) => [...prev, signature]);
//       alert(`Signed transaction as: ${await signer.getAddress()}`);
//     } catch (error) {
//       console.error("Error signing transaction:", error);
//       alert("Failed to sign transaction.");
//     }
//   };

//   // Execute Transaction
//   const executeTransaction = async () => {
//     if (!multiSigAddress || !safeTransaction)
//       return alert("No transaction to execute.");

//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeSdk = await Safe.create({
//         ethAdapter,
//         safeAddress: multiSigAddress,
//       });
//       const threshold = await safeSdk.getThreshold();

//       // Check threshold
//       if (signatures.length < threshold) {
//         return alert(`Need ${threshold - signatures.length} more signatures.`);
//       }

//       // Combine signatures
//       const combinedSignatures = signatures.join("");

//       // Execute
//       const txResponse = await safeSdk.executeTransaction({
//         ...safeTransaction,
//         signatures: combinedSignatures,
//       });

//       console.log("Transaction executed:", txResponse.hash);
//       alert(`Transaction executed! Hash: ${txResponse.hash}`);

//       // Reset state
//       setSafeTransaction(null);
//       setSignatures([]);
//       setSafeTxHash(null);
//     } catch (error) {
//       console.error("Error executing transaction:", error);
//       alert("Failed to execute transaction.");
//     }
//   };

//   return (
//     <section
//       className="modal bg-black bg-opacity-70 fixed top-0 left-0 w-full h-full flex justify-center items-center"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-lg min-w-[600px] flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="w-full p-4 pb-5 flex justify-between items-center rounded-t-lg border-b border-opacity-10">
//           <h2 className="text-2xl font-urbanist-medium">
//             Add {fundingType} to your account
//           </h2>
//           <XIcon size={24} onClick={onClose} className="cursor-pointer" />
//         </div>
//         <div className="p-4 w-full h-full flex flex-col flex-grow gap-8">
//           <p className="font-urbanist-medium text-lg">
//             TBA Address: {manualTbaAddress}
//           </p>
//           {!isMultiSigDeployed && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter owners (comma-separated)"
//                 value={ownersInput}
//                 onChange={(e) => setOwnersInput(e.target.value)}
//                 className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//               />
//               <input
//                 type="number"
//                 placeholder="Threshold (e.g., 2)"
//                 value={thresholdInput}
//                 onChange={(e) => setThresholdInput(e.target.value)}
//                 className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//               />
//               <button
//                 onClick={deployMultiSig}
//                 disabled={isCreatingSafe}
//                 className="font-urbanist-medium text-lg rounded-lg bg-green-600 py-4 px-6 text-white"
//               >
//                 {isCreatingSafe ? "Deploying..." : "Create Multisig Wallet"}
//               </button>
//             </>
//           )}
//           {isMultiSigDeployed && (
//             <>
//               <p className="font-urbanist-medium text-lg">
//                 Multisig Address: {multiSigAddress}
//               </p>
//               <input
//                 type="text"
//                 placeholder={`Enter amount (${fundingType})`}
//                 value={fundingAmount}
//                 onChange={(e) => setFundingAmount(e.target.value)}
//                 className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//               />
//               <button
//                 onClick={onFund}
//                 className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
//               >
//                 Add {fundingType} Directly
//               </button>
//               {!safeTxHash && (
//                 <button
//                   onClick={proposeTransaction}
//                   disabled={!isMultiSigDeployed}
//                   className="font-urbanist-medium text-lg rounded-lg bg-blue-600 py-4 px-6 text-white"
//                 >
//                   Propose Transaction
//                 </button>
//               )}
//               {safeTxHash && (
//                 <>
//                   <p className="font-urbanist-medium text-lg">
//                     Transaction Hash: {safeTxHash}
//                   </p>
//                   <p className="font-urbanist-medium text-lg">
//                     Signatures Collected: {signatures.length}/{thresholdInput}
//                   </p>
//                   <button
//                     onClick={signTransaction}
//                     disabled={signatures.some(
//                       async (sig) =>
//                         sig === (await provider.getSigner().getAddress())
//                     )}
//                     className="font-urbanist-medium text-lg rounded-lg bg-yellow-500 py-4 px-6 text-white"
//                   >
//                     Sign Transaction
//                   </button>
//                   <button
//                     onClick={executeTransaction}
//                     disabled={signatures.length < parseInt(thresholdInput)}
//                     className="font-urbanist-medium text-lg rounded-lg bg-green-700 py-4 px-6 text-white"
//                   >
//                     Execute Transaction
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AddFundsModal;
//////////////////////////////////////////////////////////////////////////
// import { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import EthersAdapter from "@safe-global/safe-ethers-lib";
// import Safe, { SafeFactory } from "@safe-global/safe-core-sdk";
// import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
// import { CrossIcon, XIcon } from "lucide-react";

// interface AddFundsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   manualTbaAddress: string;
//   fundingAmount: string;
//   setFundingAmount: (amount: string) => void;
//   onFund: () => Promise<void>;
//   fundingType: string;
//   erc20Address?: string;
//   setErc20Address?: (address: string) => void;
//   multiSigAddress: string | null;
//   setMultiSigAddress: (address: string | null) => void;
//   isMultiSigDeployed: boolean;
//   setIsMultiSigDeployed: (deployed: boolean) => void;
// }

// const AddFundsModal: React.FC<AddFundsModalProps> = ({
//   isOpen,
//   onClose,
//   manualTbaAddress,
//   fundingAmount,
//   setFundingAmount,
//   onFund,
//   fundingType,
//   erc20Address,
//   setErc20Address,
//   multiSigAddress,
//   setMultiSigAddress,
//   isMultiSigDeployed,
//   setIsMultiSigDeployed,
// }) => {
//   const [isProposing, setIsProposing] = useState(false);
//   const [ownersInput, setOwnersInput] = useState<string>("");
//   const [thresholdInput, setThresholdInput] = useState<string>("2");
//   const [isCreatingSafe, setIsCreatingSafe] = useState(false);
//   const [safeTransaction, setSafeTransaction] = useState<any>(null);
//   const [signaturesCollected, setSignaturesCollected] = useState<string[]>([]);
//   const [safeTxHash, setSafeTxHash] = useState<string | null>(null);
//   const [connectedWalletAddress, setConnectedWalletAddress] = useState<
//     string | null
//   >(null);

//   useEffect(() => {
//     const fetchConnectedWallet = async () => {
//       const accounts = await window.ethereum.request({
//         method: "eth_accounts",
//       });
//       if (accounts && accounts.length > 0) {
//         setConnectedWalletAddress(accounts[0]);
//       }
//     };

//     fetchConnectedWallet();
//   }, []);

//   if (!isOpen) return null;

//   // Deploy Multisig Wallet
//   const deployMultiSig = async () => {
//     try {
//       setIsCreatingSafe(true);

//       const owners = ownersInput.split(",").map((addr) => addr.trim());
//       const threshold = parseInt(thresholdInput);

//       // Validate inputs
//       if (owners.length === 0 || threshold <= 0 || threshold > owners.length) {
//         return alert("Invalid threshold or owners input.");
//       }
//       if (!owners.every((addr) => ethers.utils.isAddress(addr))) {
//         return alert("One or more owner addresses are invalid.");
//       }

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeFactory = await SafeFactory.create({ ethAdapter });
//       const safeAccountConfig = { owners, threshold };

//       const safe = await safeFactory.deploySafe({ safeAccountConfig });
//       const safeAddress = await safe.getAddress();

//       setMultiSigAddress(safeAddress);
//       setIsMultiSigDeployed(true);
//       alert(`Multisig deployed at: ${safeAddress}`);
//     } catch (error) {
//       console.error("Error deploying multisig:", error);
//       alert("Failed to deploy multisig wallet.");
//     } finally {
//       setIsCreatingSafe(false);
//     }
//   };

//   // Propose Transaction
//   const proposeTransaction = async () => {
//     if (!multiSigAddress) return alert("No multisig wallet deployed.");

//     try {
//       setIsProposing(true);

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeSdk = await Safe.create({
//         ethAdapter,
//         safeAddress: multiSigAddress,
//       });

//       // Create transaction data
//       const safeTransactionData: SafeTransactionDataPartial = {
//         to: manualTbaAddress,
//         value: ethers.utils.parseEther(fundingAmount).toString(),
//         data: "0x",
//       };

//       // Create transaction
//       const transaction = await safeSdk.createTransaction({
//         safeTransactionData,
//       });
//       setSafeTransaction(transaction);

//       // Generate hash
//       const txHash = await safeSdk.getTransactionHash(transaction);
//       setSafeTxHash(txHash);

//       // Sign transaction
//       await safeSdk.signTransaction(transaction);
//       const currentSignerAddress = await signer.getAddress();
//       setSignaturesCollected([currentSignerAddress]);
//       alert(`Transaction proposed! Hash: ${txHash}`);
//     } catch (error) {
//       console.error("Error proposing transaction:", error);
//       alert("Failed to propose transaction.");
//     } finally {
//       setIsProposing(false);
//     }
//   };

//   // Sign Transaction (for other owners)
//   const signTransaction = async () => {
//     if (!multiSigAddress || !safeTxHash)
//       return alert("No transaction to sign.");

//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeSdk = await Safe.create({
//         ethAdapter,
//         safeAddress: multiSigAddress,
//       });

//       // Get transaction details from hash
//       const chainId = (await provider.getNetwork()).chainId;
//       const domain = { chainId, verifyingContract: multiSigAddress };
//       const types = {
//         SafeTx: [
//           { name: "to", type: "address" },
//           { name: "value", type: "uint256" },
//           { name: "data", type: "bytes" },
//           { name: "operation", type: "uint8" },
//           { name: "safeTxGas", type: "uint256" },
//           { name: "baseGas", type: "uint256" },
//           { name: "gasPrice", type: "uint256" },
//           { name: "gasToken", type: "address" },
//           { name: "refundReceiver", type: "address" },
//           { name: "nonce", type: "uint256" },
//         ],
//       };

//       // Sign using EIP-712
//       const signature = await signer._signTypedData(domain, types, {
//         ...safeTransaction.data,
//         nonce: await safeSdk.getNonce(),
//       });

//       // Update signatures
//       setSignaturesCollected((prev) => [...prev, signature]);
//       console.log("signatures collected", signaturesCollected);
//       alert(`Signed transaction as: ${await signer.getAddress()}`);
//     } catch (error) {
//       console.error("Error signing transaction:", error);
//       alert("Failed to sign transaction.");
//     }
//   };

//   // Execute Transaction
//   const executeTransaction = async () => {
//     if (!multiSigAddress || !safeTransaction)
//       return alert("No transaction to execute.");

//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const ethAdapter = new EthersAdapter({
//         ethers,
//         signerOrProvider: signer,
//       });

//       const safeSdk = await Safe.create({
//         ethAdapter,
//         safeAddress: multiSigAddress,
//       });
//       const threshold = await safeSdk.getThreshold();
//       console.log("threshold", threshold);
//       console.log(
//         "from execute function",
//         signaturesCollected,
//         signaturesCollected.length
//       );
//       // Check threshold
//       if (signaturesCollected.length < threshold) {
//         return alert(
//           `Need ${threshold - signaturesCollected.length} more signatures.`
//         );
//       }

//       // Combine signatures
//       const combinedSignatures = signaturesCollected.join("");
//       console.log("combined signs", combinedSignatures);
//       // Execute
//       const txResponse = await safeSdk.executeTransaction({
//         ...safeTransaction,
//         signatures: combinedSignatures,
//       });

//       console.log("Transaction executed:", txResponse.hash);
//       alert(`Transaction executed! Hash: ${txResponse.hash}`);

//       // Reset state
//       setSafeTransaction(null);
//       setSignaturesCollected([]);
//       setSafeTxHash(null);
//     } catch (error) {
//       console.error("Error executing transaction:", error);
//       alert("Failed to execute transaction.");
//     }
//   };

//   return (
//     <section
//       className="modal bg-black bg-opacity-70 fixed top-0 left-0 w-full h-full flex justify-center items-center"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-lg min-w-[600px] flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="w-full p-4 pb-5 flex justify-between items-center rounded-t-lg border-b border-opacity-10">
//           <h2 className="text-2xl font-urbanist-medium">
//             Add {fundingType} to your account
//           </h2>
//           <XIcon size={24} onClick={onClose} className="cursor-pointer" />
//         </div>
//         <div className="p-4 w-full h-full flex flex-col flex-grow gap-8">
//           <p className="font-urbanist-medium text-lg">
//             TBA Address: {manualTbaAddress}
//           </p>
//           {!isMultiSigDeployed && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter owners (comma-separated)"
//                 value={ownersInput}
//                 onChange={(e) => setOwnersInput(e.target.value)}
//                 className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//               />
//               <input
//                 type="number"
//                 placeholder="Threshold (e.g., 2)"
//                 value={thresholdInput}
//                 onChange={(e) => setThresholdInput(e.target.value)}
//                 className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//               />
//               <button
//                 onClick={deployMultiSig}
//                 disabled={isCreatingSafe}
//                 className="font-urbanist-medium text-lg rounded-lg bg-green-600 py-4 px-6 text-white"
//               >
//                 {isCreatingSafe ? "Deploying..." : "Create Multisig Wallet"}
//               </button>
//             </>
//           )}
//           {isMultiSigDeployed && (
//             <>
//               <p className="font-urbanist-medium text-lg">
//                 Multisig Address: {multiSigAddress}
//               </p>
//               <input
//                 type="text"
//                 placeholder={`Enter amount (${fundingType})`}
//                 value={fundingAmount}
//                 onChange={(e) => setFundingAmount(e.target.value)}
//                 className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//               />
//               <button
//                 onClick={onFund}
//                 className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
//               >
//                 Add {fundingType} Directly
//               </button>
//               {!safeTxHash && (
//                 <button
//                   onClick={proposeTransaction}
//                   disabled={!isMultiSigDeployed}
//                   className="font-urbanist-medium text-lg rounded-lg bg-blue-600 py-4 px-6 text-white"
//                 >
//                   Propose Transaction
//                 </button>
//               )}
//               {safeTxHash && (
//                 <>
//                   <p className="font-urbanist-medium text-lg">
//                     Transaction Hash: {safeTxHash}
//                   </p>
//                   <p className="font-urbanist-medium text-lg">
//                     Signatures Collected: {signaturesCollected.length}/
//                     {thresholdInput}
//                   </p>
//                   <button
//                     onClick={signTransaction}
//                     disabled={
//                       !connectedWalletAddress ||
//                       signaturesCollected.includes(connectedWalletAddress)
//                     }
//                     className="font-urbanist-medium text-lg rounded-lg bg-yellow-500 py-4 px-6 text-white"
//                   >
//                     Sign Transaction
//                   </button>
//                   <button
//                     onClick={executeTransaction}
//                     disabled={
//                       signaturesCollected.length < parseInt(thresholdInput)
//                     }
//                     className="font-urbanist-medium text-lg rounded-lg bg-green-700 py-4 px-6 text-white"
//                   >
//                     Execute Transaction
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AddFundsModal;
//////////////////////////////////////////////////
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import Safe, { SafeFactory } from "@safe-global/safe-core-sdk";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { CrossIcon, XIcon } from "lucide-react";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualTbaAddress: string;
  fundingAmount: string;
  setFundingAmount: (amount: string) => void;
  onFund: () => Promise<void>;
  fundingType: string;
  erc20Address?: string;
  setErc20Address?: (address: string) => void;
  multiSigAddress: string | null;
  setMultiSigAddress: (address: string | null) => void;
  isMultiSigDeployed: boolean;
  setIsMultiSigDeployed: (deployed: boolean) => void;
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  manualTbaAddress,
  fundingAmount,
  setFundingAmount,
  onFund,
  fundingType,
  erc20Address,
  setErc20Address,
  multiSigAddress,
  setMultiSigAddress,
  isMultiSigDeployed,
  setIsMultiSigDeployed,
}) => {
  const [isProposing, setIsProposing] = useState(false);
  const [ownersInput, setOwnersInput] = useState<string>("");
  const [thresholdInput, setThresholdInput] = useState<string>("2");
  const [isCreatingSafe, setIsCreatingSafe] = useState(false);
  const [safeTransaction, setSafeTransaction] = useState<any>(null);
  const [signaturesCollected, setSignaturesCollected] = useState<string[]>([]);
  const [safeTxHash, setSafeTxHash] = useState<string | null>(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchConnectedWallet = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts && accounts.length > 0) {
        setConnectedWalletAddress(accounts[0]);
      }
    };

    fetchConnectedWallet();
  }, []);
  useEffect(() => {
    const fetchConnectedWallet = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts && accounts.length > 0) {
        setConnectedWalletAddress(accounts[0]);
      }
    };

    // Initial fetch
    fetchConnectedWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setConnectedWalletAddress(accounts[0]);
      } else {
        setConnectedWalletAddress(null);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // Cleanup listener on unmount
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);
  if (!isOpen) return null;

  // Deploy Multisig Wallet
  const deployMultiSig = async () => {
    try {
      setIsCreatingSafe(true);

      const owners = ownersInput.split(",").map((addr) => addr.trim());
      const threshold = parseInt(thresholdInput);

      // Validate inputs
      if (owners.length === 0 || threshold <= 0 || threshold > owners.length) {
        return alert("Invalid threshold or owners input.");
      }
      if (!owners.every((addr) => ethers.utils.isAddress(addr))) {
        return alert("One or more owner addresses are invalid.");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });

      const safeFactory = await SafeFactory.create({ ethAdapter });
      const safeAccountConfig = { owners, threshold };

      const safe = await safeFactory.deploySafe({ safeAccountConfig });
      const safeAddress = await safe.getAddress();

      setMultiSigAddress(safeAddress);
      setIsMultiSigDeployed(true);
      alert(`Multisig deployed at: ${safeAddress}`);
    } catch (error) {
      console.error("Error deploying multisig:", error);
      alert("Failed to deploy multisig wallet.");
    } finally {
      setIsCreatingSafe(false);
    }
  };

  // Propose Transaction
  const proposeTransaction = async (isFundingMultisig: boolean) => {
    if (!multiSigAddress && !isFundingMultisig)
      return alert("No multisig wallet deployed.");
    try {
      setIsProposing(true);

      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });

      let transaction;
      let safeSdk;
      if (!multiSigAddress) {
        return alert("Multisig wallet address is not available.");
      }

      if (isFundingMultisig) {
        // Fund Multisig Wallet: Transaction originates from the connected wallet
        const tx = {
          to: multiSigAddress, // Send funds to the multisig wallet
          value: ethers.utils.parseEther(fundingAmount).toString(),
        };
        console.log("Funding multisig wallet with:", tx);
        const txResponse = await signer.sendTransaction(tx);
        console.log("Transaction sent:", txResponse.hash);
        alert(`Transaction sent! Hash: ${txResponse.hash}`);
        setIsProposing(false);
        return;
      } else {
        // Fund TBA via Multisig: Transaction originates from the multisig wallet
        safeSdk = await Safe.create({
          ethAdapter,
          safeAddress: multiSigAddress!,
        });

        // Create transaction data
        const safeTransactionData: SafeTransactionDataPartial = {
          to: manualTbaAddress, // Send funds to the TBA address
          value: ethers.utils.parseEther(fundingAmount).toString(),
          data: "0x",
        };

        // Create transaction
        transaction = await safeSdk.createTransaction({
          safeTransactionData,
        });
        setSafeTransaction(transaction);
        console.log("safe transaction by 1st signer", safeTransaction);

        // Generate hash
        const txHash = await safeSdk.getTransactionHash(transaction);
        setSafeTxHash(txHash);

        // Sign transaction
        const chainId = (await provider.getNetwork()).chainId;
        const domain = { chainId, verifyingContract: multiSigAddress! };
        const types = {
          SafeTx: [
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" },
            { name: "operation", type: "uint8" },
            { name: "safeTxGas", type: "uint256" },
            { name: "baseGas", type: "uint256" },
            { name: "gasPrice", type: "uint256" },
            { name: "gasToken", type: "address" },
            { name: "refundReceiver", type: "address" },
            { name: "nonce", type: "uint256" },
          ],
        };
        const signature = await signer._signTypedData(domain, types, {
          ...transaction.data,
          nonce: await safeSdk.getNonce(),
        });

        // Store the first signer's EIP-712 signature
        setSignaturesCollected([signature]);
        alert(`Transaction proposed! Hash: ${txHash}`);
      }
    } catch (error) {
      console.error("Error proposing transaction:", error);
      alert("Failed to propose transaction.");
    } finally {
      setIsProposing(false);
    }
  };

  // Sign Transaction (for other owners)
  const signTransaction = async () => {
    if (!multiSigAddress || !safeTxHash)
      return alert("No transaction to sign.");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });
      const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: multiSigAddress,
      });

      // Get transaction details from hash
      const chainId = (await provider.getNetwork()).chainId;
      const domain = { chainId, verifyingContract: multiSigAddress };
      const types = {
        SafeTx: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "operation", type: "uint8" },
          { name: "safeTxGas", type: "uint256" },
          { name: "baseGas", type: "uint256" },
          { name: "gasPrice", type: "uint256" },
          { name: "gasToken", type: "address" },
          { name: "refundReceiver", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      };

      console.log("safe transaction by other signers", safeTransaction);

      // Sign using EIP-712
      const signature = await signer._signTypedData(domain, types, {
        ...safeTransaction.data,
        nonce: await safeSdk.getNonce(),
      });

      // Check for duplicate signatures
      const currentSigner = await signer.getAddress();
      if (signaturesCollected.some((sig) => sig.startsWith(currentSigner))) {
        return alert("You have already signed this transaction.");
      }

      // Update signatures
      setSignaturesCollected((prev) => [...prev, signature]);
      console.log("signaturesCollected", signaturesCollected);

      alert(`Signed transaction as: ${currentSigner}`);
    } catch (error) {
      console.error("Error signing transaction:", error);
      alert("Failed to sign transaction.");
    }
  };

  const executeTransaction = async () => {
    if (!multiSigAddress || !safeTransaction)
      return alert("No transaction to execute.");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });
      const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: multiSigAddress,
      });
      const threshold = await safeSdk.getThreshold();
      console.log("threshold", threshold);
      // Check threshold
      if (signaturesCollected.length < threshold) {
        return alert(
          `Need ${threshold - signaturesCollected.length} more signatures.`
        );
      }

      // Add all signatures to the transaction
      signaturesCollected.forEach((signature) => {
        safeTransaction.addSignature({
          signer: connectedWalletAddress!, // Ensure address is available
          data: signature,
          staticPart: () => signature,
          dynamicPart: () => "",
        });
      });
      console.log("sig collected", signaturesCollected);
      // Execute with properly signed transaction
      const txResponse = await safeSdk.executeTransaction(safeTransaction);
      console.log("Transaction executed:", txResponse.hash);
      alert(`Transaction executed! Hash: ${txResponse.hash}`);

      // Reset state
      setSafeTransaction(null);
      setSignaturesCollected([]);
      setSafeTxHash(null);
    } catch (error) {
      console.error("Error executing transaction:", error);
      alert("Failed to execute transaction.");
    }
  };

  return (
    <section
      className="modal bg-black bg-opacity-70 fixed top-0 left-0 w-full h-full flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg min-w-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full p-4 pb-5 flex justify-between items-center rounded-t-lg border-b border-opacity-10">
          <h2 className="text-2xl font-urbanist-medium">
            Add {fundingType} to your account
          </h2>
          <XIcon size={24} onClick={onClose} className="cursor-pointer" />
        </div>
        <div className="p-4 w-full h-full flex flex-col flex-grow gap-8">
          <p className="font-urbanist-medium text-lg">
            TBA Address: {manualTbaAddress}
          </p>
          {!isMultiSigDeployed && (
            <>
              <input
                type="text"
                placeholder="Enter owners (comma-separated)"
                value={ownersInput}
                onChange={(e) => setOwnersInput(e.target.value)}
                className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
              />
              <input
                type="number"
                placeholder="Threshold (e.g., 2)"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
              />
              <button
                onClick={deployMultiSig}
                disabled={isCreatingSafe}
                className="font-urbanist-medium text-lg rounded-lg bg-green-600 py-4 px-6 text-white"
              >
                {isCreatingSafe ? "Deploying..." : "Create Multisig Wallet"}
              </button>
            </>
          )}
          {isMultiSigDeployed && (
            <>
              <p className="font-urbanist-medium text-lg">
                Multisig Address: {multiSigAddress}
              </p>
              <input
                type="text"
                placeholder={`Enter amount (${fundingType})`}
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
              />
              <button
                onClick={() => proposeTransaction(true)} // Fund Multisig Wallet
                disabled={!isMultiSigDeployed}
                className="font-urbanist-medium text-lg rounded-lg bg-blue-600 py-4 px-6 text-white"
              >
                Fund Multisig Wallet
              </button>
              <button
                onClick={() => proposeTransaction(false)} // Fund TBA
                disabled={!isMultiSigDeployed}
                className="font-urbanist-medium text-lg rounded-lg bg-blue-600 py-4 px-6 text-white"
              >
                Fund TBA via Multisig
              </button>
              {safeTxHash && (
                <>
                  <p className="font-urbanist-medium text-lg">
                    Transaction Hash: {safeTxHash}
                  </p>
                  <p className="font-urbanist-medium text-lg">
                    Signatures Collected: {signaturesCollected.length}/
                    {thresholdInput}
                  </p>
                  <button
                    onClick={signTransaction}
                    disabled={
                      !connectedWalletAddress ||
                      signaturesCollected.includes(connectedWalletAddress)
                    }
                    className="font-urbanist-medium text-lg rounded-lg bg-yellow-500 py-4 px-6 text-white"
                  >
                    Sign Transaction
                  </button>
                  <button
                    onClick={executeTransaction}
                    disabled={
                      signaturesCollected.length < parseInt(thresholdInput)
                    }
                    className="font-urbanist-medium text-lg rounded-lg bg-green-700 py-4 px-6 text-white"
                  >
                    Execute Transaction
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AddFundsModal;
