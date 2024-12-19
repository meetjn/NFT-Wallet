// app/trading/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/TokenList.module.css";

const TokenList = () => {
  const [prices, setPrices] = useState<{ pair: string; price: string }[]>([]); // Store live prices

  const tokenPairs = [
    { pair: "DOT/USDT", link: "/trading/DOT-USDT" },
    { pair: "PHA/USDT", link: "/trading/PHA-USDT" },
    { pair: "ASTR/USDT", link: "/trading/ASTR-USDT" },
    { pair: "GLMR/USDT", link: "/trading/USDT-GLMR" },
  ];

  useEffect(() => {
    // Fetch live prices from the API
    const fetchPrices = async () => {
      const pairs = tokenPairs.map((token) => token.pair); // Get the pairs list
      const response = await fetch(`/api/live-prices?pairs=${pairs.join(",")}`); // Call the API
      const data = await response.json(); // Get the response data

      // Set the prices to the state
      setPrices(data);
    };

    fetchPrices(); // Call the function to fetch prices
  }, []); // Empty dependency array means this effect runs only once when the component mounts

  return (
    <div className={`${styles.tokenListContainer} centered`}>
      <h2>Available Trading Pairs</h2>
      <ul className={styles.tokenList}>
        {tokenPairs.map((token) => (
          <li key={token.pair} className={styles.tokenListItem}>
            <Link href={token.link}>
              {token.pair} -{" "}
              {prices.find((p) => p.pair === token.pair)?.price || "Loading..."} {/* Display live price */}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenList;

// import React from "react";
// import Link from "next/link";
// import styles from "../../styles/TokenList.module.css";

// const TokenList = () => {
//   const tokenPairs = [
//     { pair: "DED/USDT", link: "/trading/DED-USDT" },
//     { pair: "PHA/USDT", link: "/trading/PHA-USDT" },
//     { pair: "ASTR/USDT", link: "/trading/ASTR-USDT" },
//     { pair: "GLMR/USDT", link: "/trading/USDT-GLMR" },
//   ];

//   return (
//     <div className={`${styles.tokenListContainer} centered`}>
//       <h2>Available Trading Pairs</h2>
//       <ul className={styles.tokenList}>
//         {tokenPairs.map((token) => (
//           <li key={token.pair} className={styles.tokenListItem}>
//             <Link href={token.link}>
//               {token.pair}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default TokenList;
