// "use client";
// import React, { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import { useAccount, useWalletClient } from "wagmi";
// import { TokenboundClient } from "@tokenbound/sdk";
// import { sepolia } from "viem/chains";
// import { Web3Provider } from "@/context/Web3Context";
// import Image from "next/image";
// import { Coins } from "lucide-react";
// import AddFundsModal from "@/components/AddFundsModal";
// import MultiSigWalletCreator from "@/components/MultiSignature"; // Ensure this is correct
// import TransactionApproval from "@/components/MultisigApproval";

// // ===== Added multi-chain imports =====
// import { SUPPORTED_CHAINS, SupportedChain } from "@/utils/chains";
// import { createTBA } from "@/components/createTBA";
// import { error } from "console";

// enum TransactionType {
//   ETH = "ETH",
//   ERC20 = "ERC20",
// }

// export interface TransactionDetails {
//   type: "ETH" | "ERC20" | "SWAP" | "";
//   amount: string;
//   to: string;
//   tokenAddress?: string;
//   inputTokenAddress?: string;
//   outputTokenAddress?: string;
//   swapAmount?: string;
//   slippage?: string;
// }

// export default function Home() {
//   const { isConnected, address } = useAccount();
//   const [tokenBoundClient, setTokenBoundClient] =
//     useState<TokenboundClient | null>(null);
//   const [tbaAddress, setTbaAddress] = useState<string | null>(null);
//   const [existingTbas, setExistingTbas] = useState<string[]>([]);
//   const [fundingAmount, setFundingAmount] = useState<string>("0.01");
//   const [erc20Address, setErc20Address] = useState<string>("");
//   const [manualTbaAddress, setManualTbaAddress] = useState<string>("");
//   const [ethBalance, setEthBalance] = useState<string>("0");
//   const [erc20Balance, setErc20Balance] = useState<string>("0");
//   const [currentTokenId, setCurrentTokenId] = useState(0);
//   const [selectedChainId, setSelectedChainId] = useState<number>(sepolia.id);
//   const [isEthModalOpen, setIsEthModalOpen] = useState(false);
//   const [isErc20ModalOpen, setIsErc20ModalOpen] = useState(false);
//   const [showMultisigCreator, setShowMultisigCreator] = useState(false);
//   const [showMultisigApproval, setShowMultisigApproval] = useState(false);
//   const [isTransactionPending, setIsTransactionPending] = useState(false);
//   const [currentTbaAddress, setCurrentTbaAddress] = useState("");

//   const [isMultiSigApproved, setIsMultiSigApproved] = useState(false);
//   const [pendingTransaction, setPendingTransaction] =
//     useState<TransactionDetails>({
//       type: "",
//       amount: "",
//       to: "",
//     });
//   const [showTransactionTypeModal, setShowTransactionTypeModal] =
//     useState(false);

//   // ===== Added multi-chain state and wallet client =====
//   const [selectedChain, setSelectedChain] = useState<SupportedChain>("sepolia");
//   const [isDeploying, setIsDeploying] = useState(false);
//   const { data: walletClient } = useWalletClient();

//   useEffect(() => {
//     if (isConnected) {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const client = new TokenboundClient({
//         signer: provider.getSigner(),
//         chainId: selectedChainId,
//       });
//       setTokenBoundClient(client);
//     }
//   }, [isConnected, selectedChainId]);

//   const fetchExistingTbas = async () => {
//     if (tokenBoundClient && address) {
//       const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
//       const tokenIds = ["0", "1", "2"];
//       try {
//         const tbas = await Promise.all(
//           tokenIds.map(async (tokenId) => {
//             const account = await tokenBoundClient.getAccount({
//               tokenContract: tokenContractAddress,
//               tokenId: tokenId,
//             });
//             return account;
//           })
//         );
//         setExistingTbas(tbas.filter((account) => account));
//       } catch (error) {
//         console.error("Error fetching existing TBAs:", error);
//       }
//     }
//   };
//   useEffect(() => {
//     console.log("MultiSig States Updated:", {
//       showMultisigCreator,
//       showMultisigApproval,
//       pendingTransaction: {
//         type: pendingTransaction.type,
//         amount: pendingTransaction.amount,
//         to: pendingTransaction.to,
//       },
//     });
//   }, [showMultisigCreator, showMultisigApproval, pendingTransaction]);

//   useEffect(() => {
//     console.log("Detailed MultiSig States:", {
//       showMultisigApproval,
//       showMultisigCreator,
//       pendingTransaction: {
//         type: pendingTransaction.type,
//         amount: pendingTransaction.amount,
//         to: pendingTransaction.to,
//       },
//       currentTbaAddress,
//       manualTbaAddress,
//       isTransactionPending,
//     });
//   }, [
//     showMultisigApproval,
//     showMultisigCreator,
//     pendingTransaction,
//     currentTbaAddress,
//     manualTbaAddress,
//     isTransactionPending,
//   ]);

//   useEffect(() => {
//     fetchExistingTbas();
//   }, [tokenBoundClient]);

//   const fetchBalances = async () => {
//     if (!manualTbaAddress) return;
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     try {
//       const ethBalanceWei = await provider.getBalance(manualTbaAddress);
//       setEthBalance(ethers.utils.formatEther(ethBalanceWei));
//       if (erc20Address) {
//         const erc20Abi = [
//           "function balanceOf(address account) view returns (uint256)",
//         ];
//         const erc20Contract = new ethers.Contract(
//           erc20Address,
//           erc20Abi,
//           provider
//         );
//         const erc20BalanceWei = await erc20Contract.balanceOf(manualTbaAddress);
//         setErc20Balance(ethers.utils.formatUnits(erc20BalanceWei, 18));
//       }
//     } catch (error) {
//       console.error("Error fetching balances:", error);
//     }
//   };

//   useEffect(() => {
//     fetchBalances();
//   }, [manualTbaAddress]);

//   const createTba = async () => {
//     if (tokenBoundClient && address) {
//       const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
//       try {
//         const { account } = await tokenBoundClient.createAccount({
//           tokenContract: tokenContractAddress,
//           tokenId: currentTokenId.toString(),
//         });
//         setTbaAddress(account);
//         setCurrentTbaAddress(account);
//         setCurrentTokenId((prevId) => prevId + 1);
//         fetchExistingTbas();
//       } catch (error) {
//         console.error("Error creating Token Bound Account:", error);
//       }
//     }
//   };

//   // ===== Added multi-chain deploy function =====
//   const handleCreateTBA = async () => {
//     if (!isConnected || !walletClient) {
//       console.error("No wallet client available.");
//       return;
//     }
//     setIsDeploying(true);
//     try {
//       if (!SUPPORTED_CHAINS[selectedChain]) {
//         throw new Error("Invalid chain selection");
//       }
//       const expectedChainId = SUPPORTED_CHAINS[selectedChain].id;
//       // Switch network if necessary
//       if (window.ethereum && window.ethereum.request) {
//         const currentChainId = parseInt(window.ethereum.chainId, 16);
//         if (currentChainId !== expectedChainId) {
//           console.log(
//             `Switching network to ${SUPPORTED_CHAINS[selectedChain].name}...`
//           );
//           await window.ethereum.request({
//             method: "wallet_switchEthereumChain",
//             params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
//           });
//           await new Promise((resolve) => setTimeout(resolve, 500));
//         }
//       }
//       const newTbaAddress = await createTBA(selectedChain, walletClient);
//       console.log(
//         `TBA deployed successfully on ${selectedChain}: ${newTbaAddress}`
//       );
//       setTbaAddress(newTbaAddress);
//       setCurrentTbaAddress(newTbaAddress);
//       fetchExistingTbas();
//     } catch (error: any) {
//       console.error("Error creating TBA:", error);
//     } finally {
//       setIsDeploying(false);
//     }
//   };

//   const fundWithEth = async () => {
//     if (!manualTbaAddress) return alert("Please enter a valid TBA address.");
//     setPendingTransaction({
//       type: TransactionType.ETH,
//       amount: fundingAmount,
//       to: manualTbaAddress,
//     });
//     setCurrentTbaAddress(manualTbaAddress);
//     setIsEthModalOpen(false);
//     setShowTransactionTypeModal(true);
//   };

//   const fundWithErc20 = async () => {
//     if (!manualTbaAddress || !erc20Address)
//       return alert("TBA and ERC20 token address are required.");
//     setPendingTransaction({
//       type: TransactionType.ERC20,
//       amount: fundingAmount,
//       to: manualTbaAddress,
//       tokenAddress: erc20Address,
//     });
//     setCurrentTbaAddress(manualTbaAddress);
//     setIsErc20ModalOpen(false);
//     setShowTransactionTypeModal(true);
//   };

//   const handleTransactionTypeSelect = (type: "normal" | "multisig") => {
//     console.log("Transaction Type Selected:", type);
//     console.error("DEBUG: Current States Before Selection", {
//       showTransactionTypeModal,
//       showMultisigCreator,
//       showMultisigApproval,
//       pendingTransaction,
//       currentTbaAddress,
//       manualTbaAddress,
//     });

//     setShowTransactionTypeModal(false);
//     if (type === "normal") {
//       executeDirectTransaction();
//       return;
//     } else if (type === "multisig") {
//       const storedWalletAddress = localStorage.getItem("multisigWalletAddress");
//       const storedSigners = localStorage.getItem("multisigSigners");
//       const storedRequiredSignatures = localStorage.getItem(
//         "multisigRequiredSignatures"
//       );
//       console.error("DEBUG: All localStorage items:", {
//         multisigWalletAddress: localStorage.getItem("multisigWalletAddress"),
//         multisigSigners: localStorage.getItem("multisigSigners"),
//         multisigRequiredSignatures: localStorage.getItem(
//           "multisigRequiredSignatures"
//         ),
//       });

//       // Attempt to set states explicitly and log
//       console.error("DEBUG: Attempting to set MultiSig states");

//       // Temporarily remove localStorage check for debugging
//       setShowMultisigApproval(true);
//       setShowMultisigCreator(false);
//       setIsTransactionPending(true);

//       console.error("DEBUG: States After MultiSig Selection", {
//         showMultisigCreator,
//         showMultisigApproval,
//         isTransactionPending: true,
//       });
//     }
//   };
//   const executeDirectTransaction = async () => {
//     if (!pendingTransaction) return;
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     try {
//       if (pendingTransaction.type === TransactionType.ETH) {
//         const tx = await signer.sendTransaction({
//           to: pendingTransaction.to,
//           value: ethers.utils.parseEther(pendingTransaction.amount),
//         });
//         await tx.wait();
//         alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
//       } else if (
//         pendingTransaction.type === TransactionType.ERC20 &&
//         pendingTransaction.tokenAddress
//       ) {
//         const erc20Abi = [
//           "function transfer(address to, uint amount) returns (bool)",
//         ];
//         const erc20Contract = new ethers.Contract(
//           pendingTransaction.tokenAddress,
//           erc20Abi,
//           signer
//         );
//         const tx = await erc20Contract.transfer(
//           pendingTransaction.to,
//           ethers.utils.parseUnits(pendingTransaction.amount, 18)
//         );
//         await tx.wait();
//         alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
//       }
//       fetchBalances();
//     } catch (error) {
//       console.error("Transaction failed:", error);
//       alert("Transaction failed.");
//     } finally {
//       setIsTransactionPending(false);
//     }
//   };

//   const executeTransaction = async () => {
//     if (!pendingTransaction || !isMultiSigApproved) {
//       console.error("Transaction cannot be executed", {
//         pendingTransaction,
//         isMultiSigApproved,
//       });
//       return;
//     }
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     try {
//       if (pendingTransaction.type === "ETH") {
//         const tx = await signer.sendTransaction({
//           to: pendingTransaction.to,
//           value: ethers.utils.parseEther(pendingTransaction.amount),
//         });
//         await tx.wait();
//         alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
//       } else if (
//         pendingTransaction.type === "ERC20" &&
//         pendingTransaction.tokenAddress
//       ) {
//         const erc20Abi = [
//           "function transfer(address to, uint amount) returns (bool)",
//         ];
//         const erc20Contract = new ethers.Contract(
//           pendingTransaction.tokenAddress,
//           erc20Abi,
//           signer
//         );
//         const tx = await erc20Contract.transfer(
//           pendingTransaction.to,
//           ethers.utils.parseUnits(pendingTransaction.amount, 18)
//         );
//         await tx.wait();
//         alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
//       }
//       fetchBalances();
//     } catch (error) {
//       console.error("Transaction failed:", error);
//       alert("Transaction failed.");
//     } finally {
//       setIsTransactionPending(false);
//       setShowMultisigApproval(false);
//       setPendingTransaction({ type: "", amount: "", to: "" });
//       setIsMultiSigApproved(false);
//     }
//   };

//   useEffect(() => {
//     if (isMultiSigApproved && pendingTransaction.type !== "") {
//       executeTransaction();
//     }
//   }, [isMultiSigApproved, pendingTransaction]);

//   const handleMultisigCreatorComplete = () => {
//     setShowMultisigCreator(false);
//     setShowMultisigApproval(true);
//     // No need to parse anything here, just transition to approval screen
//   };

//   const handleMultisigApproval = () => {
//     setIsMultiSigApproved(true);
//     executeTransaction();
//   };

//   return (
//     <section className="pt-8 p-responsive flex flex-col gap-10 w-full pb-10">
//       <div className="flex flex-col gap-8 justify-start items-start">
//         <div className="text-2xl font-semibold">
//           {address ? <> {address}</> : <h1>Wallet Not connected</h1>}
//         </div>
//         <button
//           onClick={createTba}
//           className="py-3 px-6 bg-[#CE192D] font-urbanist-semibold rounded-lg text-white"
//         >
//           Create TBA
//         </button>
//         {tbaAddress && (
//           <h2 className="text-xl font-urbanist-medium">
//             New Token Bound Account for Token ID {currentTokenId - 1}:{" "}
//             {tbaAddress}
//           </h2>
//         )}
//       </div>
//       <div className="flex gap-5 items-center">
//         <h3 className="font-urbanist-medium text-lg">Existing TBAs:</h3>
//         {existingTbas.length > 0 ? (
//           <ul className="list-disc list-inside">
//             {existingTbas.map((tba, index) => (
//               <li key={index} className="mt-2">
//                 {tba}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-[#3f3f3f]">No existing TBAs found</p>
//         )}
//       </div>

//       <div className="flex flex-col gap-4">
//         <h2 className="text-lg font-medium">
//           Enter Token Bound Account (TBA) Address
//         </h2>
//         <div className="flex gap-4 items-center">
//           <input
//             type="text"
//             placeholder="Enter TBA Address"
//             value={manualTbaAddress}
//             onChange={(e) => setManualTbaAddress(e.target.value)}
//             className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
//           />
//           <button
//             onClick={fetchBalances}
//             className="font-urbanist-medium rounded-lg bg-[#CE192D] h-full px-6 text-white"
//           >
//             Fetch Balances
//           </button>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-2xl font-urbanist-semibold">Balances</h2>
//         <div className="grid grid-cols-2 gap-8 mt-4">
//           <div className="flex justify-between flex-col p-6 border border-opacity-10 rounded-2xl min-h-96 hover-scale-on">
//             <div className="flex gap-3 text-xl font-urbanist-semibold items-center">
//               <Image
//                 src="/ethereum.png"
//                 height={60}
//                 width={60}
//                 className="p-2 border border-opacity-10 rounded-md"
//                 alt="eth"
//               />
//               ETH Balance
//               <p className="ml-auto">{ethBalance}</p>
//             </div>
//             <button
//               onClick={() => setIsEthModalOpen(true)}
//               className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
//             >
//               Add Funds
//             </button>
//           </div>
//           <div className="flex justify-between flex-col p-6 border border-opacity-10 rounded-2xl min-h-96 hover-scale-on">
//             <div className="flex gap-3 text-xl font-urbanist-semibold items-center">
//               <Coins
//                 height={60}
//                 width={60}
//                 className="p-2 border border-opacity-10 rounded-md"
//               />
//               ERC20 Balance
//               <p className="ml-auto">{erc20Balance}</p>
//             </div>
//             <button
//               onClick={() => setIsErc20ModalOpen(true)}
//               className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
//             >
//               Add Funds
//             </button>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-2xl font-urbanist-semibold">
//           Deploy on Multiple Chains
//         </h2>
//         <div className="mt-4">
//           <div className="my-8">
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-2xl font-bold mb-4">
//                 Token Bound Account Manager
//               </h2>

//               {/* Chain Selector */}
//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Network
//                 </label>
//                 <select
//                   value={selectedChain}
//                   onChange={(e) =>
//                     setSelectedChain(e.target.value as SupportedChain)
//                   }
//                   className="w-full p-2 border rounded"
//                 >
//                   {Object.keys(SUPPORTED_CHAINS).map((chain) => (
//                     <option key={chain} value={chain}>
//                       {SUPPORTED_CHAINS[chain as SupportedChain].name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* NFT Info */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-medium mb-2">NFT Details</h3>
//                 <p>Contract: 0xe4d54752B3c6786851c2F8336743367458835c5C</p>
//                 <p>Token ID: 1</p>
//               </div>

//               {/* TBA Address Display */}
//               {tbaAddress && (
//                 <div className="mb-6">
//                   <h3 className="text-lg font-medium mb-2">TBA Address</h3>
//                   <p className="font-mono break-all">{tbaAddress}</p>
//                 </div>
//               )}

//               {/* Deploy Button */}
//               <button
//                 onClick={handleCreateTBA}
//                 disabled={isDeploying || !isConnected}
//                 className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 mb-4"
//               >
//                 {isDeploying ? "Deploying..." : "Deploy TBA"}
//               </button>

//               {/* Transfer Section
//           // Currently transfer fund section is disabled temporarily, will be enabled in future.
//           {tbaAddress && (
//             <div className="mt-6">
//               <h3 className="text-lg font-medium mb-4">Transfer Funds</h3>
//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   placeholder="Amount"
//                   value={transferAmount}
//                   onChange={(e) => setTransferAmount(e.target.value)}
//                   className="w-full p-2 border rounded"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Recipient Address"
//                   value={recipientAddress}
//                   onChange={(e) => setRecipientAddress(e.target.value)}
//                   className="w-full p-2 border rounded"
//                 />
//                 <button
//                   onClick={handleTransfer}
//                   className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
//                 >
//                   Transfer
//                 </button>
//               </div>
//             </div>
//           )}
//             */}
//             </div>
//           </div>
//         </div>
//         <div className="mt-4"></div>
//       </div>
//       {showMultisigCreator && (
//         <Web3Provider key="multisig-creator">
//           <MultiSigWalletCreator onComplete={handleMultisigCreatorComplete} />
//         </Web3Provider>
//       )}
//       {showMultisigApproval && (
//         <Web3Provider key="multisig-approval">
//           <TransactionApproval
//             tbaAddress={currentTbaAddress || manualTbaAddress}
//             transactionDetails={{
//               type: pendingTransaction.type,
//               amount: pendingTransaction.amount,
//               to: pendingTransaction.to,
//               tokenAddress: pendingTransaction.tokenAddress,
//             }}
//             onApproval={handleMultisigApproval}
//             onComplete={() => {}}
//           />
//         </Web3Provider>
//       )}

//       <AddFundsModal
//         isOpen={isEthModalOpen}
//         onClose={() => {
//           setIsEthModalOpen(false);
//         }}
//         manualTbaAddress={manualTbaAddress}
//         fundingAmount={fundingAmount}
//         setFundingAmount={setFundingAmount}
//         onFund={fundWithEth}
//         fundingType="ETH"
//       />

//       <AddFundsModal
//         isOpen={isErc20ModalOpen}
//         onClose={() => setIsErc20ModalOpen(false)}
//         manualTbaAddress={manualTbaAddress}
//         fundingAmount={fundingAmount}
//         setFundingAmount={setFundingAmount}
//         onFund={fundWithErc20}
//         fundingType="ERC20 Token"
//         erc20Address={erc20Address}
//         setErc20Address={setErc20Address}
//       />

//       {showTransactionTypeModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg max-w-md w-full">
//             <h2 className="text-2xl font-bold mb-4">Choose Transaction Type</h2>
//             <div className="space-y-4">
//               <button
//                 onClick={() => handleTransactionTypeSelect("normal")}
//                 className="w-full px-6 py-3 bg-[#CE192D] text-white rounded-lg hover:bg-red-600 transition-all"
//               >
//                 Normal Transaction
//               </button>
//               <button
//                 onClick={() => handleTransactionTypeSelect("multisig")}
//                 className="w-full px-6 py-3 bg-[#CE192D] text-white rounded-lg hover:bg-red-600 transition-all"
//               >
//                 Multisig Transaction
//               </button>
//             </div>
//             <button
//               onClick={() => setShowTransactionTypeModal(false)}
//               className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import { useAccount, useSwitchChain, useConnect, useDisconnect } from "wagmi";
import { TokenboundClient } from "@tokenbound/sdk";

import Image from "next/image";
import { Coins } from "lucide-react";
import AddFundsModal from "@/components/AddFundsModal";
import { SUPPORTED_CHAINS, SupportedChain } from "@/utils/chains";
import { createTBA } from "@/components/createTBA";
import { getTBAAddress } from "@/components/utils";
import GNOSIS_SAFE_ABI from "../utils/safewalletabi.json";
import { useWalletClient } from "wagmi";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [tokenBoundClient, setTokenBoundClient] =
    useState<TokenboundClient | null>(null);
  const [tbaAddress, setTbaAddress] = useState<string | null>(null);
  const [existingTbas, setExistingTbas] = useState<string[]>([]);
  const [fundingAmount, setFundingAmount] = useState<string>("0.01");
  const [erc20Address, setErc20Address] = useState<string>("");
  const [manualTbaAddress, setManualTbaAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [erc20Balance, setErc20Balance] = useState<string>("0");
  const [currentTokenId, setCurrentTokenId] = useState(0);
  const [showMultiSigWalletCreator, setShowMultiSigWalletCreator] =
    useState(true);
  const [isEthModalOpen, setIsEthModalOpen] = useState(false);
  const [isErc20ModalOpen, setIsErc20ModalOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<SupportedChain>("sepolia");
  const [isDeploying, setIsDeploying] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { chain } = useAccount(); // Get the connected chain
  const { data: walletClient } = useWalletClient();
  const [multiSigAddress, setMultiSigAddress] = useState<string | null>(null);
  const [isMultiSigDeployed, setIsMultiSigDeployed] = useState(false);
  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchTBA = async () => {
      try {
        console.log("Fetching TBA Address for:", selectedChain);

        const tbaAddress = getTBAAddress(selectedChain);
        console.log("Fetched TBA Address:", tbaAddress);

        if (tbaAddress) {
          setTbaAddress(tbaAddress);

          // Store TBA in existing list if not already present
          setExistingTbas((prevTbas) =>
            prevTbas.includes(tbaAddress) ? prevTbas : [...prevTbas, tbaAddress]
          );
        } else {
          setTbaAddress(null);
          console.warn("No TBA address found.");
        }
      } catch (err) {
        console.error("Error fetching TBA:", err);
        setError("Failed to fetch TBA address.");
      }
    };

    fetchTBA();
  }, [isConnected, address, selectedChain]);

  const handleCreateTBA = async () => {
    if (!isConnected || !walletClient) {
      console.error("No wallet client available.");
      setError("Please connect your wallet first.");
      return;
    }

    setIsDeploying(true);
    setError(null);

    try {
      if (!SUPPORTED_CHAINS[selectedChain]) {
        throw new Error("Invalid chain selection");
      }
      const expectedChainId = SUPPORTED_CHAINS[selectedChain].id;

      // Using MetaMask directly instead of `switchChain()`
      if (chain?.id !== expectedChainId) {
        console.log(
          `Switching network to ${SUPPORTED_CHAINS[selectedChain].name}...`
        );
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const newTbaAddress = await createTBA(selectedChain, walletClient);
      console.log(
        `TBA deployed successfully on ${selectedChain}: ${newTbaAddress}`
      );
      setTbaAddress(newTbaAddress);
    } catch (error: any) {
      console.error("Error creating TBA:", error);
      setError(error.message || "Failed to create TBA.");
    } finally {
      setIsDeploying(false);
    }
  };

  const fetchBalances = async () => {
    if (!manualTbaAddress) return;
    console.log("tba address", manualTbaAddress);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      // Fetch ETH Balance
      const ethBalanceWei = await provider.getBalance(manualTbaAddress);
      setEthBalance(ethers.utils.formatEther(ethBalanceWei));

      // Fetch ERC20 Token Balance
      if (erc20Address) {
        const erc20Abi = [
          "function balanceOf(address account) view returns (uint256)",
        ];
        const erc20Contract = new ethers.Contract(
          erc20Address,
          erc20Abi,
          provider
        );
        const erc20BalanceWei = await erc20Contract.balanceOf(manualTbaAddress);
        setErc20Balance(ethers.utils.formatUnits(erc20BalanceWei, 18)); // Assuming 18 decimals
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [manualTbaAddress]);

  const fundWithEth = async () => {
    if (!manualTbaAddress) return alert("Please enter a valid TBA address.");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const tx = await signer.sendTransaction({
        to: manualTbaAddress,
        value: ethers.utils.parseEther(fundingAmount),
      });
      console.log("Transaction sent:", tx.hash);
      alert(`ETH sent successfully! Tx Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Error sending ETH:", error);
      alert("Failed to send ETH.");
    }
  };

  const fundWithEthViaSafe = async () => {
    if (!manualTbaAddress) return alert("Please enter a valid TBA address.");
    if (!multiSigAddress) return alert("No multisig wallet deployed.");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Connect to the Gnosis Safe contract
    const safeContract = new ethers.Contract(
      multiSigAddress,
      GNOSIS_SAFE_ABI,
      signer
    );

    // Create the transaction data
    const txData = {
      to: manualTbaAddress,
      value: ethers.utils.parseEther(fundingAmount),
      data: "0x", // No calldata for simple ETH transfer
      operation: 0, // 0 = CALL, 1 = DELEGATECALL
    };

    // Sign the transaction using EIP-712
    const signature = await signer._signTypedData(
      {
        chainId: (await provider.getNetwork()).chainId,
        verifyingContract: multiSigAddress,
      },
      {
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
      },
      txData
    );

    // Execute the transaction
    const txResponse = await safeContract.execTransaction(
      txData.to,
      txData.value,
      txData.data,
      txData.operation,
      0,
      0,
      0,
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
      signature
    );

    console.log("Transaction hash:", txResponse.hash);
    alert(`Transaction proposed! Hash: ${txResponse.hash}`);
  };
  const fundWithErc20 = async () => {
    if (!manualTbaAddress || !erc20Address)
      return alert("TBA and ERC20 token address are required.");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const erc20Abi = [
        "function transfer(address to, uint amount) returns (bool)",
      ];
      const erc20Contract = new ethers.Contract(erc20Address, erc20Abi, signer);

      const tx = await erc20Contract.transfer(
        manualTbaAddress,
        ethers.utils.parseUnits(fundingAmount, 18)
      );
      console.log("ERC20 transfer transaction:", tx.hash);
      alert(`ERC20 tokens sent successfully! Tx Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Error sending ERC20 tokens:", error);
      alert("Failed to send ERC20 tokens.");
    }
  };

  return (
    <section className="pt-8 p-responsive flex flex-col gap-10 w-full pb-10">
      <div className="flex flex-col gap-8 justify-start items-start">
        <div className="text-2xl font-semibold">
          {address ? <> {address}</> : <h1>Wallet Not connected</h1>}
        </div>
        <button
          onClick={handleCreateTBA}
          disabled={isDeploying}
          className="py-3 px-6 bg-[#CE192D] font-urbanist-semibold rounded-lg text-white"
        >
          {isDeploying ? "Deploying..." : ""}
          Create TBA
        </button>
        {tbaAddress && (
          <h2 className="text-xl font-urbanist-medium">
            New Token Bound Account for Token ID {currentTokenId - 1}:{" "}
            {tbaAddress}
          </h2>
        )}
      </div>

      <div className="flex gap-5 items-center">
        <h3 className="font-urbanist-medium text-lg">Existing TBAs:</h3>
        {existingTbas.length > 0 ? (
          <ul className="list-disc list-inside">
            {existingTbas.map((tba, index) => (
              <li key={index} className="mt-2">
                {tba}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#3f3f3f]">No existing TBAs found</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">
          Enter Token Bound Account (TBA) Address
        </h2>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Enter TBA Address"
            value={manualTbaAddress}
            onChange={(e) => setManualTbaAddress(e.target.value)}
            className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
          />
          <button
            onClick={fetchBalances}
            className="font-urbanist-medium rounded-lg bg-[#CE192D] h-full px-6 text-white "
          >
            Fetch Balances
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-urbanist-semibold">Balances</h2>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div className="flex justify-between flex-col p-6 border border-opacity-10 rounded-2xl min-h-96 hover-scale-on">
            <div className="flex gap-3 text-xl font-urbanist-semibold items-center">
              <Image
                src="/ethereum.png"
                height={60}
                width={60}
                className="p-2 border border-opacity-10 rounded-md"
                alt="eth"
              />
              ETH Balance
              <p className="ml-auto">{ethBalance}</p>
            </div>
            <button
              onClick={() => setIsEthModalOpen(true)}
              className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
            >
              Add Funds
            </button>
          </div>
          <div className="flex justify-between flex-col p-6 border border-opacity-10 rounded-2xl min-h-96 hover-scale-on">
            <div className="flex gap-3 text-xl font-urbanist-semibold items-center">
              <Coins
                height={60}
                width={60}
                className="p-2 border border-opacity-10 rounded-md"
              />
              ERC20 Balance
              <p className="ml-auto">{erc20Balance}</p>
            </div>
            <button
              onClick={() => setIsErc20ModalOpen(true)}
              className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white"
            >
              Add Funds
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-urbanist-semibold">
          Deploy on Multiple Chains
        </h2>
        <div className="mt-4">
          <div className="my-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">
                Token Bound Account Manager
              </h2>

              {/* Chain Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Network
                </label>
                <select
                  value={selectedChain}
                  onChange={(e) =>
                    setSelectedChain(e.target.value as SupportedChain)
                  }
                  className="w-full p-2 border rounded"
                >
                  {Object.keys(SUPPORTED_CHAINS).map((chain) => (
                    <option key={chain} value={chain}>
                      {SUPPORTED_CHAINS[chain as SupportedChain].name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NFT Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">NFT Details</h3>
                <p>Contract: 0xe4d54752B3c6786851c2F8336743367458835c5C</p>
                <p>Token ID: 1</p>
              </div>

              {/* TBA Address Display */}
              {tbaAddress && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">TBA Address</h3>
                  <p className="font-mono break-all">{tbaAddress}</p>
                </div>
              )}

              {/* Deploy Button */}
              <button
                onClick={handleCreateTBA}
                disabled={isDeploying || !isConnected}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 mb-4"
              >
                {isDeploying ? "Deploying..." : "Deploy TBA"}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4"></div>
      </div>

      <AddFundsModal
        isOpen={isEthModalOpen}
        onClose={() => setIsEthModalOpen(false)}
        manualTbaAddress={manualTbaAddress}
        fundingAmount={fundingAmount}
        setFundingAmount={setFundingAmount}
        onFund={fundWithEthViaSafe}
        fundingType="ETH"
        multiSigAddress={multiSigAddress}
        setMultiSigAddress={setMultiSigAddress}
        isMultiSigDeployed={isMultiSigDeployed}
        setIsMultiSigDeployed={setIsMultiSigDeployed}
      />

      <AddFundsModal
        isOpen={isErc20ModalOpen}
        onClose={() => setIsErc20ModalOpen(false)}
        manualTbaAddress={manualTbaAddress}
        fundingAmount={fundingAmount}
        setFundingAmount={setFundingAmount}
        onFund={fundWithErc20}
        fundingType="ERC20 Token"
        erc20Address={erc20Address}
        setErc20Address={setErc20Address}
        multiSigAddress={multiSigAddress}
        setMultiSigAddress={setMultiSigAddress}
        isMultiSigDeployed={isMultiSigDeployed}
        setIsMultiSigDeployed={setIsMultiSigDeployed}
      />
    </section>
  );
}
