"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import TradingChart from "@/components/index-fund/TradingChart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    description?: string;
}

interface IndexFundWithPrices extends IndexFund {
    totalValue?: number;
}

export default function IndexFundDetail() {
    const [fund, setFund] = useState<IndexFundWithPrices | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<"Line" | "Area" | "Candlestick">("Candlestick");
    const [timeframe, setTimeframe] = useState("1d");
    const { id } = useParams();
    const [fundValueHistory, setFundValueHistory] = useState<number[]>([]);
    const [investedValue, setInvestedValue] = useState<number>(1000); // Default investment
    const ws = useRef<WebSocket | null>(null);

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

    useEffect(() => {
        if (!fund) return;

        const connectWebSocket = () => {
            try {
                const streamNames = fund.tokens.map(token => `${token.symbol.toLowerCase()}usdt@ticker`);
                const combinedStreamName = streamNames.join("/");
                const socketURL = `wss://stream.binance.com/stream?streams=${combinedStreamName}`;

                ws.current = new WebSocket(socketURL);

                ws.current.onopen = () => console.log("WebSocket connected");

                ws.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.data) {
                            const symbol = data.data.s.replace("USDT", "");
                            const price = parseFloat(data.data.c);
                            if (isNaN(price)) return;

                            setFund((prevFund) => {
                                if (!prevFund) return prevFund;

                                // Update total fund value
                                const totalValue = price * 1; // Modify based on logic
                                setFundValueHistory((prevHistory) => [...prevHistory, totalValue]);

                                return { ...prevFund, totalValue };
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

                ws.current.onclose = () => console.log("WebSocket closed");
            } catch (error) {
                console.error("Error connecting to WebSocket:", error);
                setError("Failed to connect to WebSocket.");
            }
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [fund]);

    // Calculating Gain/Loss
    const currentPrice = fund?.totalValue || 0;
    const gainLoss = currentPrice - investedValue;
    const gainLossPercent = ((gainLoss / investedValue) * 100).toFixed(2);

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
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{fund.name}</h1>
                    <p className="text-gray-600">Total Value: ${currentPrice.toFixed(2)}</p>
                </div>
            </div>

            {/* Chart Controls and Chart */}
            <Card className="p-4">
                {/* <div className="flex gap-4 mb-4">
                    <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="w-32">
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Line">Line</SelectItem>
                            <SelectItem value="Area">Area</SelectItem>
                            <SelectItem value="Candlestick">Candlestick</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="1d">1 Day</SelectItem>
                            <SelectItem value="1w">1 Week</SelectItem>
                            <SelectItem value="1M">1 Month</SelectItem>
                            <SelectItem value="1y">1 Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div> */}

                <TradingChart fundId={id} />
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
    {/* 📈 Current Price */}
    <Card className="p-4 text-lg font-semibold text-center bg-gray-900 text-white">
        <p className="text-gray-400">📈 Current Price</p>
        <p className="text-2xl">${currentPrice.toFixed(2)}</p>
    </Card>

    {/* 💰 Invested Value */}
    <Card className="p-4 text-lg font-semibold text-center bg-gray-900 text-white">
        <p className="text-gray-400">💰 Invested Value</p>
        <p className="text-2xl">${investedValue.toFixed(2)}</p>
    </Card>

    {/* 📊 Gain/Loss % */}
    <Card className={`p-4 text-lg font-semibold text-center ${gainLoss >= 0 ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
        <p>📊 Gain/Loss %</p>
        <p className="text-2xl">{gainLossPercent}%</p>
    </Card>

    {/* 💲 Total Gain/Loss */}
    <Card className={`p-4 text-lg font-semibold text-center ${gainLoss >= 0 ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
        <p>💲 Total Gain/Loss</p>
        <p className="text-2xl">${gainLoss.toFixed(2)}</p>
    </Card>
</div>


            {/* Buy & Sell Buttons */}
            <div className="flex justify-between">
                <Button className="w-1/2 bg-green-500 text-white p-4 rounded mr-2 hover:bg-green-700">
                    Buy
                </Button>
                <Button className="w-1/2 bg-red-500 text-white p-4 rounded ml-2 hover:bg-red-700">
                    Sell
                </Button>
            </div>
        </div>
    );
}
