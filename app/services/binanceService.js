import axios from 'axios';

const fetchBinancePrices = async () => {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']; // List of trading pairs
    
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: {
        symbols: JSON.stringify(symbols), // Correctly formatted array as JSON
      },
    });

    console.log('Binance Prices:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Binance prices:', error.response ? error.response.data : error.message);
    return null;
  }
};

export default fetchBinancePrices;
