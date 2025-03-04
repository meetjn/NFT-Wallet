"use client";

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface Token {
  symbol: string;
  weight: number;
  name: string;
}

interface IndexFund {
  _id: string;
  name: string;
  tokens: Token[];
  type: "standard" | "custom";
  severity: "low" | "medium" | "high";
  description?: string;
  riskFactors?: string[];
}

interface TokenWithPrice extends Token {
    currentPrice?: number;
    priceChange?: { change: number; isPositive: boolean | null };
}

interface IndexFundWithPrices extends IndexFund {
    tokens: TokenWithPrice[];
}

export default function IndexFundDetail() {
  const [fund, setFund] = useState<IndexFundWithPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchFundDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/index-fund/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch fund: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data?.fund) {
          throw new Error("Fund not found");
        }

        setFund(data.fund);
      } catch (err) {
        console.error("Error fetching fund details:", err);
        setError(err instanceof Error ? err.message : "Unexpected error fetching fund details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFundDetails();
    }
  }, [id]);

    // Function to fetch token prices from Binance API
    const fetchTokenPrices = async () => {
        if (!fund) return;

        try {
            const pricePromises = fund.tokens.map(async (token) => {
                try {
                    const symbol = token.symbol + "USDT"; // Assuming USDT pairing
                    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
                    if (!response.ok) {
                        console.error(`Failed to fetch price for ${token.symbol}: ${response.status}`);
                        return { ...token, currentPrice: undefined, priceChange: { change: 0, isPositive: null } };
                    }

                    const data = await response.json();
                    const price = parseFloat(data?.price);

                    if (isNaN(price)) {
                        console.error(`Invalid price received for ${token.symbol}`);
                        return { ...token, currentPrice: undefined, priceChange: { change: 0, isPositive: null } };
                    }

                    // Calculate price change (using a very basic comparison)
                    const change = token.currentPrice ? price - token.currentPrice : 0;
                    const isPositive = change > 0;

                    return { ...token, currentPrice: price, priceChange: { change, isPositive } };
                } catch (err) {
                    console.error(`Error fetching price for ${token.symbol}:`, err);
                    return { ...token, currentPrice: undefined, priceChange: { change: 0, isPositive: null } };
                }
            });

            const updatedTokens = await Promise.all(pricePromises);
            setFund((prevFund) => ({ ...prevFund, tokens: updatedTokens }));

        } catch (err) {
            console.error("Failed to fetch token prices", err);
            setError("Failed to update token prices.");
        }
    };

    useEffect(() => {
        if (!loading && fund) {
            fetchTokenPrices(); // Initial fetch

            const intervalId = setInterval(fetchTokenPrices, 30000); // Update every 30 seconds

            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [loading, fund]);



  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4 border border-red-200 rounded-md">
        <AlertCircle size={20} />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!fund) {
    return <div className="p-4">Fund not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{fund.name}</h1>
      <p className="text-gray-600 mb-4">Fund Name: {fund.name}</p>

      {/* Description */}
      {fund.description && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{fund.description}</p>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-2">Token Allocation</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Symbol</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-right">Weight</th>
              <th className="py-2 px-4 border-b text-right">Current Price</th>
               <th className="py-2 px-4 border-b text-right">Price Change</th>
              <th className="py-2 px-4 border-b text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {fund.tokens.map((token) => (
              <tr key={token.symbol}>
                <td className="py-2 px-4 border-b">{token.symbol}</td>
                <td className="py-2 px-4 border-b">{token.name}</td>
                <td className="py-2 px-4 border-b text-right">{token.weight}</td>
                <td className="py-2 px-4 border-b text-right">
                    {token.currentPrice ? `$${token.currentPrice?.toFixed(2)}` : "Loading..."}
                </td>
                 <td className="py-2 px-4 border-b text-right">
                     {token.priceChange ? (
                         <div className="flex items-center justify-end">
                             {token.priceChange.isPositive === true && (
                                 <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                             )}
                             {token.priceChange.isPositive === false && (
                                 <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                             )}
                             <span className={token.priceChange.isPositive === true ? "text-green-500" : "text-red-500"}>
                                 {token.priceChange.change.toFixed(2)}
                             </span>
                         </div>
                     ) : (
                         "N/A"
                     )}
                 </td>
                <td className="py-2 px-4 border-b text-right">
                    {token.currentPrice ? `$${(token.weight * token.currentPrice).toFixed(2)}` : "Loading..."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Fund Value</h2>
        {/*<p className="text-xl">Total Value: ${fund.totalValue?.toFixed(2) || "0.00"}</p>*/}
      </div>

      {/* Risk Factors */}
      {fund.riskFactors && fund.riskFactors.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Risk Factors</h2>
          <ul className="list-disc list-inside text-gray-700">
            {fund.riskFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
