"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from 'next/navigation';
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import TradingChart from "@/components/index-fund/TradingChart";
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
    totalValue?: number;
}

// Function to calculate the total value of a fund
const calculateFundValue = (
    tokens: Token[],
    priceMap: { [key: string]: number }
) => {
    return tokens.reduce((total, token) => {
        const price = priceMap[token.symbol] || 0;
        return total + token.weight * price;
    }, 0);
};


export default function IndexFundDetail() {
    const [fund, setFund] = useState<IndexFundWithPrices | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();
    const ws = useRef<WebSocket | null>(null); // useRef to hold the WebSocket

    useEffect(() => {
        const fetchFundDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("Fetching fund details..."); // Add this line
                const response = await fetch(`/api/index-fund/${id}`);
                console.log("Response received:", response); // Add this line

                if (!response.ok) {
                    throw new Error(`Failed to fetch fund: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Data received:", data); // Add this line

                if (!data?.fund) {
                    throw new Error("Fund not found");
                }

                setFund(data.fund);
            } catch (err) {
                console.error("Error fetching fund details:", err);
                setError(err instanceof Error ? err.message : "Unexpected error fetching fund details.");
            } finally {
                setLoading(false);
                console.log("Loading state set to false"); // Add this line
            }
        };

        if (id) {
            fetchFundDetails();
        }
    }, [id]);

    useEffect(() => {
        if (!fund) return;

        const connectWebSocket = () => {
            try {
                // Construct the WebSocket stream names
                const streamNames = fund.tokens.map(token => `${token.symbol.toLowerCase()}usdt@ticker`);
                const combinedStreamName = streamNames.join('/');  // Combine stream names

                const socketURL = `wss://stream.binance.com/stream?streams=${combinedStreamName}`;  // Use combined stream
                ws.current = new WebSocket(socketURL);


                ws.current.onopen = () => {
                    console.log("WebSocket connected");
                };

                ws.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.data) { // Check for data property
                            const symbol = data.data.s.replace('USDT', '');  // Extract symbol
                            const price = parseFloat(data.data.c);  // Current price
                            if (isNaN(price)) return;

                            setFund((prevFund) => {
                                if (!prevFund) return prevFund;  // Ensure fund exists
                                const priceMap = { ...prevFund.tokens.reduce((acc: any, token) => {
                                    acc[token.symbol] = token.currentPrice || 0;
                                    return acc;
                                }, {}), [symbol]: price };

                                const updatedTokens = prevFund.tokens.map(token => {
                                    if (token.symbol === symbol) {
                                        const change = token.currentPrice ? price - token.currentPrice : 0;
                                        const isPositive = change > 0;
                                        return { ...token, currentPrice: price, priceChange: { change, isPositive } };
                                    }
                                    return token;
                                });

                                const totalValue = calculateFundValue(updatedTokens, priceMap);

                                return { ...prevFund, tokens: updatedTokens, totalValue: totalValue };
                            });
                        }
                    } catch (error) {
                        console.error("Error processing WebSocket message:", error);
                    }
                };

                ws.current.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    setError("WebSocket connection error.");
                };

                ws.current.onclose = () => {
                    console.log("WebSocket closed");
                    // Implement a reconnect strategy here if needed
                };

            } catch (error) {
                console.error("Error connecting to WebSocket:", error);
                setError("Failed to connect to WebSocket.");
            }
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
                console.log("WebSocket disconnected");
            }
        };
    }, [fund]);  // Effect runs when 'fund' changes


    //  /* ... (rest of your component, rendering the data) ... */
    if (loading) {
        return (<div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>);
    }

    if (error) {
        return (<div className="flex items-center gap-2 text-red-500 p-4 border border-red-200 rounded-md">
            <AlertCircle size={20} />
            <span>Error: {error}</span>
        </div>);
    }

    if (!fund) {
        return (<div className="p-4">Fund not found.</div>);
    }

    return (<div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{fund.name}</h1>
        <p className="text-gray-600 mb-4">Fund Name: {fund.name}</p>
        <p className="text-gray-600 mb-4">Total Value: {fund.totalValue}</p>

        {/* Description */}
        {fund.description && (<div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{fund.description}</p>
        </div>)}

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
                    {fund.tokens.map((token) => (<tr key={token.symbol}>
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
                    </tr>))}
                </tbody>
            </table>
        </div>
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Performance Chart</h2>
            <TradingChart 
                fundId={id as string} 
                totalValue={fund.totalValue} 
                tokens={fund.tokens} 
            />
        </div>
        {/* Risk Factors */}
        {fund.riskFactors && fund.riskFactors.length > 0 && (<div className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">Risk Factors</h2>
            <ul className="list-disc list-inside text-gray-700">
                {fund.riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                ))}
            </ul>
        </div>)}
    </div>);
}