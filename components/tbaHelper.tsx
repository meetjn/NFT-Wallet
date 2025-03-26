import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import GetIpfsUrlFromPinata from "../utils/pinataService";
import { ethers } from "ethers";
import NftAbi from "./ABI/MyNFT.json";
import { createTBA } from "./createTBA";
import { useWalletClient } from "wagmi";
import { SupportedChain } from "../utils/chains";
import ExistingNftAbi from "./ABI/ExistingNFT.json";

const NEW_NFT_CONTRACT = "0xEFefcfb5E8dB1cd664BaA8b706f49D9bB02694B7";
const EXISTING_NFT_CONTRACT = "0xc7186EcDC29c8047C095C9170e67d96D3c99e317";

const TBAHelper = () => {
  const [option, setOption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [existingTokenId, setExistingTokenId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [nftContract, setNftContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [tbaAddress, setTbaAddress] = useState("");
  const { data: walletClient } = useWalletClient();
  const selectedChain: SupportedChain = "sepolia";
  const [lastExistingTokenId, setLastExistingTokenId] = useState<string>("-1");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const mintNFTAndCreateTBA = async () => {
    if (!file || !name || !description) {
      alert("Please fill all fields and upload an image");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const imageResponse = await uploadFileToIPFS(formData);

      if (!imageResponse.success) {
        throw new Error("Failed to upload image to IPFS");
      }

      const imageURI = GetIpfsUrlFromPinata(imageResponse.pinataURL ?? "");
      const metadata = {
        name,
        description,
        image: imageURI,
      };

      const metadataResponse = await uploadJSONToIPFS(metadata);
      if (!metadataResponse.success) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      const metadataURI = GetIpfsUrlFromPinata(metadataResponse.pinataURL ?? "");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const nftContractInstance = new ethers.Contract(
        NEW_NFT_CONTRACT,
        NftAbi,
        signer
      );

      console.log("Minting NFT...");
      const mintTx = await nftContractInstance.mintNFT(
        await signer.getAddress(),
        metadataURI
      );

      const receipt = await mintTx.wait();
      const event = receipt.events.find((event: any) => event.event === "Transfer");
      const newTokenId = event.args.tokenId.toString();

      setNftContract(nftContractInstance.address);
      setTokenId(newTokenId);

      // Create TBA for the newly minted NFT
      const tbaAddress = await createTBA(
        selectedChain,
        walletClient || null,
        newTokenId,
        nftContractInstance.address
      );

      setTbaAddress(tbaAddress);
      setLoading(false);

      alert(`NFT minted successfully! Token ID: ${newTokenId}\nTBA Address: ${tbaAddress}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setLoading(false);
      if (error instanceof Error) {
        alert(`Error minting NFT: ${error.message}`);
      } else {
        alert("An unknown error occurred while minting NFT.");
      }
    }
  };


  const createTBAForExistingNFT = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const nftContractInstance = new ethers.Contract(
        EXISTING_NFT_CONTRACT,
        ExistingNftAbi,
        provider
      );

      // Get current token ID only on first call
      let nextTokenId: string;
      if (lastExistingTokenId === "-1") {
        const nextTokenIdBN: ethers.BigNumber = 
          await nftContractInstance.getNextTokenId();
        nextTokenId = nextTokenIdBN.toString();
        nextTokenId = (parseInt(nextTokenId) - 1).toString();
        if (parseInt(nextTokenId) < 0) {
          throw new Error("No tokens have been minted yet");
        }
      } else {
        nextTokenId = (parseInt(lastExistingTokenId) + 1).toString();
        
      }
      try {
        await nftContractInstance.ownerOf(nextTokenId);
      } catch (error) {
        throw new Error(`Token ID ${nextTokenId} does not exist yet`);
      }

      // Create TBA for the existing NFT
      const tbaAddress = await createTBA(
        selectedChain,
        walletClient || null,
        nextTokenId,
        EXISTING_NFT_CONTRACT
      );

      setNftContract(EXISTING_NFT_CONTRACT);
      setLastExistingTokenId(nextTokenId);
      setTokenId(nextTokenId);
      setTbaAddress(tbaAddress);
      
      alert(`TBA created successfully for Token ID ${nextTokenId}!\nTBA Address: ${tbaAddress}`);
    } catch (error) {
      console.error("Error creating TBA:", error);
      
      if (error instanceof Error) {
        alert(`Error creating TBA: ${error.message}`);
      } else {
        alert("An unknown error occurred while creating TBA.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Token Bound Account (TBA)</h2>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Choose an option:</label>
        <div className="flex space-x-4">
          <button 
            onClick={() => setOption("new")}
            className={`flex-1 py-2 px-4 rounded ${option === "new" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Create New NFT
          </button>
          <button 
            onClick={() => setOption("existing")}
            className={`flex-1 py-2 px-4 rounded ${option === "existing" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Use Existing NFT
          </button>
        </div>
      </div>
      {option === "new" && (
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Upload Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
            {file && (
              <div className="mt-2">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="NFT Name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="NFT Description"
              rows={3}
            />
          </div>

          <button 
            onClick={mintNFTAndCreateTBA} 
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Mint NFT & Create TBA"}
          </button>
        </div>
      )}

       {option === "existing" && (
         <div>
           <button 
             onClick={createTBAForExistingNFT} 
             disabled={loading}
             className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
           >
             {loading ? "Processing..." : "Create TBA for Existing NFT"}
           </button>
         </div>
       )}

       {tbaAddress && (
         <div className="mt-4 p-3 bg-green-100 rounded">
           <p><strong>NFT Contract:</strong> {nftContract}</p>
           <p><strong>Token ID:</strong> {tokenId}</p>
           <p><strong>TBA Address:</strong> {tbaAddress}</p>
         </div>
       )}
     </div>
   );
};

export default TBAHelper;
