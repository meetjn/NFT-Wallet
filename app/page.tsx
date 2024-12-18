"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { TokenboundClient } from "@tokenbound/sdk";
import { sepolia } from "viem/chains";

export default function Home() {
  const { isConnected, address } = useAccount();
  const [tokenBoundClient, setTokenBoundClient] = useState<TokenboundClient | null>(null);
  const [tbaAddress, setTbaAddress] = useState<string | null>(null);
  const [existingTbas, setExistingTbas] = useState<string[]>([]);

  useEffect(() => {
    if (isConnected) {
      // Initialize ethers provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Initialize Token Bound Client when the wallet is connected
      const client = new TokenboundClient({
        signer: provider.getSigner(),
        chainId: sepolia.id,
      });
      setTokenBoundClient(client);
    }
  }, [isConnected]);

  const fetchExistingTbas = async () => {
    if (tokenBoundClient && address) {
      const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
      const tokenIds = ["1"]; 

      try {
        const tbas = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const account = await tokenBoundClient.getAccount({
              tokenContract: tokenContractAddress,
              tokenId: tokenId,
            });
            return account;
          })
        );
        setExistingTbas(tbas.filter((account) => account)); // Filter out null/undefined
      } catch (error) {
        console.error("Error fetching existing TBAs:", error);
      }
    }
  };

  useEffect(() => {
    fetchExistingTbas();
  }, [tokenBoundClient]);

  const createTba = async () => {
    if (tokenBoundClient && address) {
      const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
      const tokenId = "1";

      try {
        const { account, txHash } = await tokenBoundClient.createAccount({
          tokenContract: tokenContractAddress,
          tokenId: tokenId,
        });
        setTbaAddress(account);
        console.log("Token Bound Account created:", account, "Tx Hash:", txHash);
        fetchExistingTbas();
      } catch (error) {
        console.error("Error creating Token Bound Account:", error);
      }
    }
  };

  return (
    <div style={{ fontFamily: "'Arial', sans-serif" }}>
      <h1>TBA Platform</h1>
      <div>
        <h2>Wallet Connected: {address}</h2>
        <br />
        <button onClick={createTba}>Create Token Bound Account (TBA)</button>
        {tbaAddress && <p>New Token Bound Account: {tbaAddress}</p>}
        <h3>Existing TBAs:</h3>
        {existingTbas.length > 0 ? (
          <ul>
            {existingTbas.map((tba, index) => (
              <li key={index}>{tba}</li>
            ))}
          </ul>
        ) : (
          <p>No existing TBAs found.</p>
        )}
      </div>
    </div>
  );
}

// "use client";
// import React, { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import NavBar from "../components/navbar";
// import { useAccount } from "wagmi";
// import { TokenboundClient } from "@tokenbound/sdk";
// import { sepolia } from "viem/chains";

// export default function Home() {
//   const { isConnected, address } = useAccount();
//   const [tokenBoundClient, setTokenBoundClient] = useState<TokenboundClient | null>(null);
//   const [tbaAddress, setTbaAddress] = useState<string | null>(null);

//   useEffect(() => {
//     if (isConnected) {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const client = new TokenboundClient({
//         signer: provider.getSigner(), // Use the signer from ethers
//         chainId: sepolia.id,
//       });
//       setTokenBoundClient(client);
//     }
//   }, [isConnected]);

//   const createTba = async () => {
//     if (tokenBoundClient && address) {
//       // const tokenContractAddress = "0x3df1112103b1234fA2A19C78A804D8980cFB2EbD";
//       const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";

//       const tokenId = "1";

//       try {
//         const { account, txHash } = await tokenBoundClient.createAccount({
//           tokenContract: tokenContractAddress,
//           tokenId: tokenId,
//         });
//         setTbaAddress(account);
//         console.log("Token Bound Account created:", account, "Tx Hash:", txHash);
//       } catch (error) {
//         console.error("Error creating Token Bound Account:", error);
//       }
//     }
//   };

//   return (
//     <div style={{ fontFamily: "'Arial', sans-serif" }}>
//       <NavBar />
//       <h1>TBA Platform</h1>
//       <div>
//         <h2>Wallet Connected: {address}</h2>
//         <br />
//         <button onClick={createTba}>Create Token Bound Account (TBA)</button>
//         {tbaAddress && <p>Token Bound Account: {tbaAddress}</p>}
//       </div>
//     </div>
//   );
// }
// "use client";
// import React, { useState, useEffect } from "react";
// import { ethers } from "ethers";
// import NavBar from "../components/navbar";
// import { useAccount } from "wagmi";
// import { TokenboundClient } from "@tokenbound/sdk";
// import { sepolia } from "viem/chains";

// export default function Home() {
//   const { isConnected, address } = useAccount();
//   const [tokenBoundClient, setTokenBoundClient] = useState<TokenboundClient | null>(null);
//   const [tbaAddress, setTbaAddress] = useState<string | null>(null);
//   const [existingTbas, setExistingTbas] = useState<string[]>([]);

//   useEffect(() => {
//     if (isConnected) {
//       // Initialize ethers provider
//       const provider = new ethers.providers.Web3Provider(window.ethereum);

//       // Initialize Token Bound Client when the wallet is connected
//       const client = new TokenboundClient({
//         signer: provider.getSigner(),
//         chainId: sepolia.id,
//       });
//       setTokenBoundClient(client);
//     }
//   }, [isConnected]);

//   const fetchExistingTbas = async () => {
//     if (tokenBoundClient && address) {
//       const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
//       const tokenIds = ["1"]; 

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
//         setExistingTbas(tbas.filter((account) => account)); // Filter out null/undefined
//       } catch (error) {
//         console.error("Error fetching existing TBAs:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchExistingTbas();
//   }, [tokenBoundClient]);

//   const createTba = async () => {
//     if (tokenBoundClient && address) {
//       const tokenContractAddress = "0xE767739f02A6693d5D38B922324Bf19d1cd0c554";
//       const tokenId = "1";

//       try {
//         const { account, txHash } = await tokenBoundClient.createAccount({
//           tokenContract: tokenContractAddress,
//           tokenId: tokenId,
//         });
//         setTbaAddress(account);
//         console.log("Token Bound Account created:", account, "Tx Hash:", txHash);
//         fetchExistingTbas();
//       } catch (error) {
//         console.error("Error creating Token Bound Account:", error);
//       }
//     }
//   };

//   return (
//     <div style={{ fontFamily: "'Arial', sans-serif" }}>
//       <NavBar />
//       <h1>TBA Platform</h1>
//       <div>
//         <h2>Wallet Connected: {address}</h2>
//         <br />
//         <button onClick={createTba}>Create Token Bound Account (TBA)</button>
//         {tbaAddress && <p>New Token Bound Account: {tbaAddress}</p>}
//         <h3>Existing TBAs:</h3>
//         {existingTbas.length > 0 ? (
//           <ul>
//             {existingTbas.map((tba, index) => (
//               <li key={index}>{tba}</li>
//             ))}
//           </ul>
//         ) : (
//           <p>No existing TBAs found.</p>
//         )}
//       </div>
//     </div>
//   );
// }
