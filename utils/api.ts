import axios from 'axios';

export const fetchLivePrices = async (pairs: string[]) => {
  const prices = await Promise.all(
    pairs.map(async (pair) => {
      try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price`, {
          params: {
            symbol: pair.replace("/", ""), // Convert DOT/USDT to DOTUSDT
          },
        });

        const rawPrice = response.data.price;
        const numericPrice = parseFloat(rawPrice.replace("$", ""));
        return {
          pair: pair,
          price: numericPrice.toFixed(4), 
        };
      } catch (error) {
        console.error(`Error fetching price for ${pair}:`, error);
        return { pair, price: "0.0000" }; 
      }
    })
  );

  return prices;
};



export const fetchHistoricalData = async (symbol: string, interval: string, limit: number = 100) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol,
        interval,
        limit,
      },
    });
    return response.data.map((data: any) => ({
      time: data[0],
      open: parseFloat(data[1]),
      high: parseFloat(data[2]),
      low: parseFloat(data[3]),
      close: parseFloat(data[4]),
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
};
