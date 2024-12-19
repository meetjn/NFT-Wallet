"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/TokenList.module.css";

const TokenList = () => {
  const [prices, setPrices] = useState<{ pair: string; price: string }[]>([]);

  const tokenPairs = [
    { pair: "DOT/USDT", link: "DOT-USDT" },
    { pair: "PHA/USDT", link: "PHA-USDT" },
    { pair: "ASTR/USDT", link: "ASTR-USDT" },
    { pair: "GLMR/USDT", link: "GLMR-USDT" }, // Fixed USDT-GLMR to GLMR-USDT for consistency
  ];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pairs = tokenPairs.map((token) => token.pair);
        const response = await fetch(`/api/live-prices?pairs=${pairs.join(",")}`);
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error("Error fetching live prices:", error);
      }
    };

    fetchPrices();
    const intervalId = setInterval(fetchPrices, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={`${styles.tokenListContainer} centered`}>
      <h2>Available Trading Pairs</h2>
      <div className={styles.tokenList}>
        {tokenPairs.map((token) => {
          const price = prices.find((p) => p.pair === token.pair)?.price || "Loading...";
          return (
            <div key={token.pair} className={styles.tokenRow}>
              <div className={styles.tokenDetails}>
                <div>{token.pair}</div>
                <div className={styles.livePrice}>
                  Live price: {price} USDT
                </div>
              </div>
              <Link 
                href={`/trading/${token.link}`} 
                className={styles.tradeButton}
              >
                Trade
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenList;