// utils/binanceApi.ts
import { API_CONSTANTS } from './constants';

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export const BinanceApiService = {
  async getTokenPrice(symbol: string): Promise<TokenPrice> {
    try {
      // Get current price
      const priceResponse = await fetch(
        `${API_CONSTANTS.BINANCE_API_BASE}/ticker/price?symbol=${symbol}USDT`
      );
      const priceData = await priceResponse.json();

      // Get 24h price change
      const statsResponse = await fetch(
        `${API_CONSTANTS.BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}USDT`
      );
      const statsData = await statsResponse.json();

      return {
        symbol,
        price: parseFloat(priceData.price),
        change24h: parseFloat(statsData.priceChangePercent)
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  },

  async getMultipleTokenPrices(symbols: string[]): Promise<TokenPrice[]> {
    try {
      const promises = symbols.map(symbol => this.getTokenPrice(symbol));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      throw error;
    }
  }
};