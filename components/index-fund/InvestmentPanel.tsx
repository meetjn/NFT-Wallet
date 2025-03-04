// // components/index-fund/InvestmentPanel.tsx
// import { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { X } from 'lucide-react';
// import PriceChart from './PriceChart';

// interface InvestmentPanelProps {
//   fund: {
//     id: string;
//     name: string;
//     tokens: Array<{ symbol: string; weight: number }>;
//     currentValue: number;
//     performance24h: number;
//   };
//   onClose: () => void;
// }

// export default function InvestmentPanel({ fund, onClose }: InvestmentPanelProps) {
//   const [investmentAmount, setInvestmentAmount] = useState<string>('');
//   const [position, setPosition] = useState({
//     totalInvestment: 0,
//     currentValue: 0,
//     profitLoss: 0,
//     profitLossPercentage: 0,
//   });

//   // Simulated position data - replace with actual data from your backend
//   useEffect(() => {
//     // Mock data - replace with actual API call
//     setPosition({
//       totalInvestment: 1000,
//       currentValue: 1150,
//       profitLoss: 150,
//       profitLossPercentage: 15,
//     });
//   }, [fund.id]);

//   const handleBuy = () => {
//     if (!investmentAmount || isNaN(parseFloat(investmentAmount))) {
//       alert('Please enter a valid investment amount');
//       return;
//     }
//     // Implement buy logic
//     console.log('Buying:', investmentAmount);
//   };

//   const handleSell = () => {
//     // Implement sell logic
//     console.log('Selling position');
//   };

//   return (
//     <Card className="p-6 sticky top-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Investment Details</h2>
//         <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//           <X size={20} />
//         </button>
//       </div>

//       <div className="mb-6">
//         <PriceChart fundId={fund.id} tokens={fund.tokens} />
//       </div>

//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <div className="text-sm text-gray-500">Current Value</div>
//             <div className="text-lg font-bold">${fund.currentValue.toFixed(2)}</div>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <div className="text-sm text-gray-500">24h Change</div>
//             <div className={`text-lg font-bold ${fund.performance24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//               {fund.performance24h >= 0 ? '+' : ''}{fund.performance24h.toFixed(2)}%
//             </div>
//           </div>
//         </div>

//         <div className="bg-gray-50 p-4 rounded-lg">
//           <h3 className="text-lg font-semibold mb-2">Your Position</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="text-sm text-gray-500">Total Investment</div>
//               <div className="font-bold">${position.totalInvestment.toFixed(2)}</div>
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">Current Value</div>
//               <div className="font-bold">${position.currentValue.toFixed(2)}</div>
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">Profit/Loss</div>
//               <div className={`font-bold ${position.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                 ${Math.abs(position.profitLoss).toFixed(2)}
//               </div>
//             </div>
//             <div>
//               <div className="text-sm text-gray-500">P/L %</div>
//               <div className={`font-bold ${position.profitLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
//                 {position.profitLossPercentage >= 0 ? '+' : ''}{position.profitLossPercentage.toFixed(2)}%
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-3">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Investment Amount (USD)
//             </label>
//             <Input
//               type="number"
//               value={investmentAmount}
//               onChange={(e) => setInvestmentAmount(e.target.value)}
//               placeholder="Enter amount"
//               className="w-full"
//             />
//           </div>
//           <div className="flex gap-3">
//             <Button
//               onClick={handleBuy}
//               className="flex-1 bg-green-600 hover:bg-green-700"
//             >
//               Buy
//             </Button>
//             <Button
//               onClick={handleSell}
//               variant="destructive"
//               className="flex-1"
//             >
//               Sell
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }