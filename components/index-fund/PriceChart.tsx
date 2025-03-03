// "use client"

// import { useEffect, useState, useCallback } from 'react';
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeScale,
//   ChartOptions
// } from 'chart.js';
// import 'chartjs-adapter-date-fns';

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeScale
// );

// interface Token {
//   symbol: string;
//   weight: number;
// }

// interface IndexFund {
//   id: string;
//   name: string;
//   tokens: Token[];
//   color?: string;
// }

// interface PriceChartProps {
//   fundId: string;
//   height?: number;
//   darkMode?: boolean;
//   timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y';
//   showVolume?: boolean;
// }

// const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// // Expanded index funds data with color theming
// const INDEX_FUNDS: IndexFund[] = [
//   {
//     id: "1",
//     name: "Crypto Blue Chip Index",
//     color: "#2563eb",
//     tokens: [
//       { symbol: "BTC", weight: 0.5 },
//       { symbol: "ETH", weight: 0.3 },
//       { symbol: "BNB", weight: 0.2 }
//     ]
//   },
//   {
//     id: "2",
//     name: "DeFi Index",
//     color: "#7c3aed",
//     tokens: [
//       { symbol: "UNI", weight: 0.3 },
//       { symbol: "AAVE", weight: 0.3 },
//       { symbol: "CAKE", weight: 0.2 },
//       { symbol: "LINK", weight: 0.2 }
//     ]
//   },
//   {
//     id: "3",
//     name: "Metaverse Index",
//     color: "#0891b2",
//     tokens: [
//       { symbol: "MANA", weight: 0.25 },
//       { symbol: "SAND", weight: 0.25 },
//       { symbol: "AXS", weight: 0.25 },
//       { symbol: "ENJ", weight: 0.25 }
//     ]
//   }
// ];

// // Time intervals mapping for API calls
// const TIMEFRAME_MAPPING = {
//   '1D': { interval: '5m', limit: 288 },    // 5min intervals for 24h
//   '1W': { interval: '1h', limit: 168 },    // 1h intervals for 1 week
//   '1M': { interval: '4h', limit: 180 },    // 4h intervals for 1 month
//   '3M': { interval: '12h', limit: 180 },   // 12h intervals for 3 months
//   '1Y': { interval: '1d', limit: 365 }     // 1d intervals for 1 year
// };

// const PriceChart = ({ 
//   fundId, 
//   height = 500, 
//   darkMode = false, 
//   timeframe = '1M',
//   showVolume = true 
// }: PriceChartProps) => {
//   const [chartData, setChartData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [priceStats, setPriceStats] = useState<{
//     high: number;
//     low: number;
//     change: number;
//     changePercent: number;
//   } | null>(null);

//   // Theme configuration
//   const theme = {
//     background: darkMode ? '#1a1a1a' : '#ffffff',
//     text: darkMode ? '#e0e0e0' : '#333333',
//     grid: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
//     tooltip: {
//       background: darkMode ? '#262626' : '#ffffff',
//       border: darkMode ? '#404040' : '#e5e7eb',
//       text: darkMode ? '#e0e0e0' : '#333333'
//     }
//   };

//   const getFundData = useCallback(async (id: string): Promise<IndexFund | null> => {
//     const fund = INDEX_FUNDS.find(f => f.id === id);
//     return fund || null;
//   }, []);

//   const calculateStats = (prices: number[]) => {
//     const high = Math.max(...prices);
//     const low = Math.min(...prices);
//     const first = prices[0];
//     const last = prices[prices.length - 1];
//     const change = last - first;
//     const changePercent = (change / first) * 100;

//     return {
//       high,
//       low,
//       change,
//       changePercent
//     };
//   };

//   const fetchHistoricalData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const fundData = await getFundData(fundId);
      
//       if (!fundData || !fundData.tokens) {
//         throw new Error(`Fund with ID ${fundId} not found`);
//       }

//       const { interval, limit } = TIMEFRAME_MAPPING[timeframe];

//       const promises = fundData.tokens.map(async (token: Token) => {
//         try {
//           const response = await fetch(
//             `${BINANCE_API_BASE}/klines?symbol=${token.symbol}USDT&interval=${interval}&limit=${limit}`
//           );
          
//           if (!response.ok) {
//             throw new Error(`Failed to fetch ${token.symbol} data`);
//           }
          
//           const data = await response.json();
//           return data.map((item: any) => ({
//             timestamp: new Date(item[0]),
//             price: parseFloat(item[4]) * token.weight,
//             volume: parseFloat(item[5]) * token.weight
//           }));
//         } catch (error) {
//           console.error(`Error fetching ${token.symbol} data:`, error);
//           return null;
//         }
//       });

//       const results = await Promise.all(promises);
//       const validResults = results.filter(Boolean);

//       if (validResults.length === 0) {
//         throw new Error("No price data available for this fund");
//       }

//       // Combine all token prices and volumes for each timestamp
//       const timestamps = validResults[0].map(p => p.timestamp);
//       const combinedPrices = validResults[0].map((_, index) => {
//         return validResults.reduce((sum, tokenData) => sum + tokenData[index].price, 0);
//       });
//       const combinedVolumes = validResults[0].map((_, index) => {
//         return validResults.reduce((sum, tokenData) => sum + tokenData[index].volume, 0);
//       });

//       // Calculate statistics
//       const stats = calculateStats(combinedPrices);
//       setPriceStats(stats);

//       const gradient = document.createElement('canvas').getContext('2d')!;
//       const gradientFill = gradient.createLinearGradient(0, 0, 0, height);
//       const baseColor = fundData.color || '#2563eb';
//       gradientFill.addColorStop(0, `${baseColor}20`);
//       gradientFill.addColorStop(1, `${baseColor}00`);

//       setChartData({
//         labels: timestamps,
//         datasets: [
//           {
//             label: `${fundData.name} Price`,
//             data: combinedPrices,
//             fill: true,
//             borderColor: baseColor,
//             backgroundColor: gradientFill,
//             tension: 0.3,
//             pointRadius: 0,
//             pointHitRadius: 20,
//             borderWidth: 2,
//             yAxisID: 'y',
//           },
//           ...(showVolume ? [{
//             label: 'Volume',
//             data: combinedVolumes,
//             type: 'bar' as const,
//             backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
//             borderColor: 'transparent',
//             yAxisID: 'y1',
//             barThickness: 'flex' as const,
//           }] : [])
//         ]
//       });
//     } catch (error: any) {
//       setError(error.message);
//       console.error("Error fetching historical data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [fundId, timeframe, darkMode, height, showVolume]);

//   useEffect(() => {
//     fetchHistoricalData();
//   }, [fetchHistoricalData]);

//   const options: ChartOptions<'line'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: {
//       duration: 750,
//       easing: 'easeInOutQuart'
//     },
//     interaction: {
//       mode: 'index' as const,
//       intersect: false,
//     },
//     plugins: {
//       legend: {
//         display: false,
//       },
//       title: {
//         display: false,
//       },
//       tooltip: {
//         mode: 'index' as const,
//         intersect: false,
//         backgroundColor: theme.tooltip.background,
//         titleColor: theme.tooltip.text,
//         bodyColor: theme.tooltip.text,
//         borderColor: theme.tooltip.border,
//         borderWidth: 1,
//         padding: 12,
//         displayColors: false,
//         callbacks: {
//           title: function(tooltipItems: any) {
//             const date = new Date(tooltipItems[0].parsed.x);
//             return date.toLocaleString();
//           },
//           label: function(context: any) {
//             if (context.dataset.yAxisID === 'y') {
//               return `Price: $${context.parsed.y.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2
//               })}`;
//             } else {
//               return `Volume: $${context.parsed.y.toLocaleString(undefined, {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0
//               })}`;
//             }
//           }
//         }
//       },
//     },
//     scales: {
//       x: {
//         type: 'time',
//         time: {
//           unit: timeframe === '1D' ? 'hour' : 'day',
//           displayFormats: {
//             hour: 'HH:mm',
//             day: 'MMM d',
//           }
//         },
//         grid: {
//           display: false,
//         },
//         border: {
//           display: false,
//         },
//         ticks: {
//           font: {
//             size: 11,
//             family: "'Inter', sans-serif"
//           },
//           color: theme.text,
//           maxRotation: 0,
//           autoSkip: true,
//           maxTicksLimit: 8,
//         },
//       },
//       y: {
//         position: 'right' as const,
//         grid: {
//           color: theme.grid,
//           drawBorder: false,
//           lineWidth: 0.5,
//         },
//         border: {
//           display: false,
//         },
//         ticks: {
//           font: {
//             size: 11,
//             family: "'Inter', sans-serif"
//           },
//           color: theme.text,
//           padding: 8,
//           callback: (value: any) => `$${value.toLocaleString(undefined, {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//           })}`,
//         },
//       },
//       y1: showVolume ? {
//         position: 'left' as const,
//         grid: {
//           display: false,
//         },
//         border: {
//           display: false,
//         },
//         ticks: {
//           font: {
//             size: 11,
//             family: "'Inter', sans-serif"
//           },
//           color: theme.text,
//           padding: 8,
//           callback: (value: any) => `$${value.toLocaleString(undefined, {
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0,
//             notation: 'compact'
//           })}`,
//         },
//       } : undefined,
//     },
//     layout: {
//       padding: {
//         top: 20,
//         right: 10,
//         bottom: 10,
//         left: 10
//       }
//     },
//   };

//   if (loading) {
//     return (
//       <div className={`h-${height} flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//         Loading chart...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`h-${height} flex items-center justify-center ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
//         Error: {error}
//       </div>
//     );
//   }

//   if (!chartData) {
//     return (
//       <div className={`h-${height} flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//         No data available
//       </div>
//     );
//   }

//   return (
//     <div className={`w-full ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'} rounded-lg shadow-sm`}>
//       {/* Stats Bar */}
//       {priceStats && (
//         <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
//           <div className="flex items-center space-x-6">
//             <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
//               High: ${priceStats.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//             </span>
//             <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
//               Low: ${priceStats.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//             </span>
//             <span className={`${priceStats.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//               {priceStats.change >= 0 ? '+' : ''}{priceStats.changePercent.toFixed(2)}%
//             </span>
//           </div>
//         </div>
//       )}
      
//       {/* Time Frame Selector */}
//       <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
//         <div className="flex space-x-2">
//           {Object.keys(TIMEFRAME_MAPPING).map((tf) => (
//             <button
//               key={tf}
//               className={`px-3 py-1 rounded ${
//                 timeframe === tf
//                   ? darkMode 
//                     ? 'bg-gray-700 text-white'
//                     : 'bg-blue-500 text-white'
//                   : darkMode
//                     ? 'text-gray-400 hover:bg-gray-800'
//                     : 'text-gray-600 hover:bg-gray-100'
//               }`}
//               onClick={() => setTimeframe(tf as keyof typeof TIMEFRAME_MAPPING)}
//             >
//               {tf}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Chart Container */}
//       <div className="p-4" style={{ height: `${height}px` }}>
//         <Line data={chartData} options={options} />
//       </div>
//     </div>
//   );
// };

// export default PriceChart;