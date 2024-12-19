"use client"; // Ensure this is client-side code

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderBook from "../../../components/trading/OrderBook";
import PriceChart from "../../../components/trading/PriceChart"; 

export default function TradingPairPage({ params }: { params: Promise<{ pair: string }> }) {
  const [currentPair, setCurrentPair] = useState<string | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const unwrappedParams = await params; 
      if (unwrappedParams?.pair) {
        setCurrentPair(unwrappedParams.pair);
      }
    };

    fetchParams();
  }, [params]);

  if (!currentPair) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Trading {currentPair}</h1>
      {/* Display the Price Chart for the current pair */}
      <PriceChart pair={currentPair} />
      {/* Display the Order Book for the current pair */}
      <OrderBook pair={currentPair} />
    </div>
  );
}

// "use client"; // Ensure this is client-side code

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import OrderBook from "../../../components/trading/OrderBook";
// import TradingGraph from "../../../components/trading/TradingGraph";

// export default function TradingPairPage({ params }: { params: Promise<{ pair: string }> }) {
//   const [currentPair, setCurrentPair] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchParams = async () => {
//       const unwrappedParams = await params; // Await the params Promise
//       if (unwrappedParams?.pair) {
//         setCurrentPair(unwrappedParams.pair); // Use the unwrapped params object
//       }
//     };

//     fetchParams();
//   }, [params]);

//   if (!currentPair) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1>Trading {currentPair}</h1>
//       {/* Display the Trading Graph for the current pair */}
//       <TradingGraph pair={currentPair} />
//       {/* Display the Order Book for the current pair */}
//       <OrderBook pair={currentPair} />
//     </div>
//   );
// }

