import React from "react";
import Link from "next/link";
import styles from "../../styles/TokenList.module.css";

const TokenList = () => {
  const tokenPairs = [
    { pair: "USDT/ETH", link: "/trading/USDT-ETH" },
    { pair: "USDT/BTC", link: "/trading/USDT-BTC" },
    { pair: "USDT/LINK", link: "/trading/USDT-LINK" },
    { pair: "USDT/GLMR", link: "/trading/USDT-GLMR" },
  ];

  return (
    <div className={`${styles.tokenListContainer} centered`}>
      <h2>Available Trading Pairs</h2>
      <ul className={styles.tokenList}>
        {tokenPairs.map((token) => (
          <li key={token.pair} className={styles.tokenListItem}>
            <Link href={token.link}>
              {token.pair}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenList;
