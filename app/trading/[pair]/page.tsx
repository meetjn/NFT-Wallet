"use client";
import TradingChart from '../../../components/trading/TradingChart';
import { useParams } from 'next/navigation';

const TradingPairPage = () => {
  const params = useParams();
  const pair = params.pair as string;

  return (
    <div>
      <h1>Trading Pair: {pair}</h1>
      {pair && <TradingChart symbol={pair} />}
    </div>
  );
};

export default TradingPairPage;
