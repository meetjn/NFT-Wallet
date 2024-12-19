const BINANCE_API_URL = "https://api.binance.com/api/v3";

export const getLivePrices = async (pairs: string[]) => {
  try {
    
    const prices = await Promise.all(
      pairs.map(async (pair) => {
        const symbol = pair.replace("/", "").toUpperCase(); // Remove slash and make the pair uppercase for Binance
        const response = await fetch(`${BINANCE_API_URL}/ticker/price?symbol=${symbol}`);
        if (!response.ok) {
          return { pair, price: "N/A" }; // Return N/A if there's an issue with the API
        }
        const data = await response.json();
        return {
          pair,
          price: data.price ? `$${parseFloat(data.price).toFixed(2)}` : "N/A", // Format the price to 2 decimal places
        };
      })
    );

    return prices;
  } catch (error) {
    console.error("Error fetching live prices:", error);
    return pairs.map((pair) => ({ pair, price: "N/A" })); // Return N/A in case of error
  }
};
