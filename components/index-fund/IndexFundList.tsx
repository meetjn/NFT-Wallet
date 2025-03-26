"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, TrendingUp, TrendingDown, Info } from "lucide-react";

interface Token {
  symbol: string;
  weight: number;
  name: string;
  currentPrice?: number;
}

interface IndexFund {
  _id: string;
  name: string;
  tokens: Token[];
  type: "standard" | "custom";
  totalValue?: number;
  previousValue?: number;
  severity: "low" | "medium" | "high";
}

interface IndexFundListProps {
  type?: "standard" | "custom";
}

export function IndexFundList({ type = "standard" }: IndexFundListProps) {
  const [funds, setFunds] = useState<IndexFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<{ [key: string]: number }>({});

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

  // Function to fetch token prices from Binance API
  const fetchTokenPrices = async (tokens: string[]) => {
    try {
      const pricePromises = tokens.map(async (token) => {
        try {
          const symbol = token + "USDT";
          const response = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
          );
          if (!response.ok) throw new Error("Failed to fetch price");

          const data = await response.json();
          const price = parseFloat(data?.price);

          return {
            symbol: token,
            price: isNaN(price) ? prices[token] || 0 : price,
          };
        } catch (err) {
          console.error(`Error fetching ${token}:`, err);
          return { symbol: token, price: prices[token] || 0 };
        }
      });

      const newPrices = await Promise.all(pricePromises);
      const priceMap = newPrices.reduce((acc, { symbol, price }) => {
        acc[symbol] = price > 0 ? price : prices[symbol] || 0;
        return acc;
      }, {} as { [key: string]: number });

      setPrices(priceMap);
      return priceMap;
    } catch (err) {
      console.error("Failed to fetch token prices", err);
      return prices;
    }
  };

  // Fetch index funds and calculate their total values
  useEffect(() => {
    let isSubscribed = true; // Prevent state updates after unmount

    const fetchFunds = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/index-fund");
        if (!response.ok)
          throw new Error(`Failed to fetch funds: ${response.statusText}`);

        const data = await response.json();
        if (!Array.isArray(data?.funds))
          throw new Error("Invalid response format");

        const filteredFunds = data.funds.filter(
          (fund: IndexFund) => fund.type === type
        );
        const allTokens = Array.from(
          new Set(
            filteredFunds.flatMap((fund) =>
              fund.tokens?.map((token) => token.symbol) || []
            )
          )
        );

        if (!isSubscribed) return;
        const initialPrices = await fetchTokenPrices(allTokens);

        if (!isSubscribed) return;

        const fundsWithValues = filteredFunds.map((fund) => ({
          ...fund,
          tokens: fund.tokens.map((token) => ({
            ...token,
            currentPrice: initialPrices[token.symbol] || 0,
          })),
          totalValue: calculateFundValue(fund.tokens, initialPrices),
          previousValue: calculateFundValue(fund.tokens, initialPrices),
          severity: "low" as const,
        }));

        setFunds(fundsWithValues);
      } catch (err) {
        if (!isSubscribed) return;
        console.error("Error fetching index funds:", err);
        setError(
          err instanceof Error ? err.message : "Unexpected error fetching funds."
        );
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchFunds();

    return () => {
      isSubscribed = false;
    };
  }, [type]);

  // Function to update fund prices periodically
  const updateFundPrices = async () => {
    try {
      const allTokens = Array.from(
        new Set(
          funds.flatMap((fund) => fund.tokens.map((token) => token.symbol))
        )
      );
      const updatedPrices = await fetchTokenPrices(allTokens);

      setFunds((prevFunds) =>
        prevFunds.map((fund) => ({
          ...fund,
          tokens: fund.tokens.map((token) => ({
            ...token,
            currentPrice: updatedPrices[token.symbol] || 0,
          })),
          previousValue: fund.totalValue,
          totalValue: calculateFundValue(fund.tokens, updatedPrices),
          severity: "low" as const,
        }))
      );
    } catch (err) {
      console.error("Error updating fund prices:", err);
    }
  };

  // Periodic price update using setInterval
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!loading) {
        updateFundPrices();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loading, funds]);

  // Get risk severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to determine price change and its icon
  const getPriceChange = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return { change: 0, isPositive: null };
    const change = current - previous;
    const isPositive = change > 0;
    return { change, isPositive };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-red-500 p-4 border border-red-200 rounded-md">
        <AlertCircle size={20} />
        <span>Error: {error}</span>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {funds.map((fund) => (
        <div
          key={fund._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
        >
          <div className="p-6 flex-grow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {fund.name}
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              ${fund.totalValue?.toFixed(2) || "0.00"}
            </div>

            {/* Price Change Display */}
            {fund.previousValue && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                {(() => {
                  const { change, isPositive } = getPriceChange(
                    fund.totalValue,
                    fund.previousValue
                  );
                  if (isPositive === null) return null;
                  return (
                    <>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={isPositive ? "text-green-500" : "text-red-500"}>
                        {change.toFixed(2)}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}

            <div
              className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                fund.severity
              )}`}
            >
              {fund.severity.charAt(0).toUpperCase() + fund.severity.slice(1)}{" "}
              Risk
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between bg-gray-50 p-4">
            <Link
              href={`/index-fund/${fund._id}/invest?currentPrice=${fund.totalValue}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Invest Now
            </Link>
            <Link
              href={`/index-fund/${fund._id}`}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View Details
              <Info className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
