
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/TokenList.module.css";

interface TokenPair {
  pair: string;
  link: string;
  baseToken: string;
  quoteToken: string;
}

interface PriceData {
  pair: string;
  price: string;
  change24h?: number;
}

{/** Here I ahve used ERC-20 Tokens Trading pairs */}

const TOKEN_PAIRS: TokenPair[] = [
  { pair: "ETH/USDT", link: "ETH-USDT", baseToken: "ETH", quoteToken: "USDT" },
  { pair: "LINK/USDT", link: "LINK-USDT", baseToken: "LINK", quoteToken: "USDT" },
  { pair: "UNI/USDT", link: "UNI-USDT", baseToken: "UNI", quoteToken: "USDT" },
  { pair: "AAVE/USDT", link: "AAVE-USDT", baseToken: "AAVE", quoteToken: "USDT" },
  { pair: "MATIC/USDT", link: "MATIC-USDT", baseToken: "MATIC", quoteToken: "USDT" },
  { pair: "COMP/USDT", link: "COMP-USDT", baseToken: "COMP", quoteToken: "USDT" },
  { pair: "MKR/USDT", link: "MKR-USDT", baseToken: "MKR", quoteToken: "USDT" }
];

const TokenList = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pairs = TOKEN_PAIRS.map((token) => token.pair);
        const response = await fetch(`/api/live-prices?pairs=${pairs.join(",")}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }
        
        const data = await response.json();
        setPrices(data);
        setError(null);
      } catch (error) {
        setError('Unable to fetch live prices. Please try again later.');
        console.error("Error fetching live prices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    const intervalId = setInterval(fetchPrices, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col h-screen w-full gap-4"> 
      <h2>Available Trading Pairs</h2>
      <div className={styles.tokenList}>
        {TOKEN_PAIRS.map((token) => {
          const priceData = prices.find((p) => p.pair === token.pair);
          
          return (
            <div key={token.pair} className={styles.tokenRow}>
              <div className={styles.tokenDetails}>
                <div className={styles.tokenPair}>{token.pair}</div>
                <div className={styles.priceContainer}>
                  {isLoading ? (
                    <span className={styles.loadingText}>Fetching price...</span>
                  ) : (
                    <>
                      <span className={styles.price}>
                        {priceData?.price || "N/A"} {token.quoteToken}
                      </span>
                      {priceData?.change24h && (
                        <span className={`${styles.change} ${priceData.change24h >= 0 ? styles.positive : styles.negative}`}>
                          ({priceData.change24h > 0 ? '+' : ''}{priceData.change24h}%)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <Link
                href={`/trading/${token.link}`}
                className={styles.tradeButton}
              >
                Trade Now
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenList;