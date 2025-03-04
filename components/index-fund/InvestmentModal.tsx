// "use client";

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Card } from "@/components/ui/card";

// interface FundDisplay {
//   id: string;
//   name: string;
//   currentValue: number;
//   performance24h: number;
//   tokens: Array<{ symbol: string; weight: number }>;
// }

// interface InvestmentModalProps {
//   fund: FundDisplay;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const InvestmentModal = ({ fund, isOpen, onClose }: InvestmentModalProps) => {
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl">
//         <DialogHeader>
//           <DialogTitle>{fund.name} - Investment Details</DialogTitle>
//         </DialogHeader>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Chart Section */}
//           <div className="md:col-span-2 h-[400px] bg-gray-100 rounded-lg">
//             {/* Placeholder for chart */}
//             <div className="h-full flex items-center justify-center">
//               Chart will be implemented here
//             </div>
//           </div>

//           {/* Investment Details Section */}
//           <div className="space-y-4">
//             <Card className="p-4">
//               <h3 className="font-semibold mb-2">Current Position</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span>Current Value</span>
//                   <span className="font-medium">${fund.currentValue.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Avg. Buy Price</span>
//                   <span className="font-medium">$0.00</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Gain/Loss</span>
//                   <span className="font-medium text-green-600">+$0.00 (0%)</span>
//                 </div>
//               </div>
//             </Card>

//             <Card className="p-4">
//               <h3 className="font-semibold mb-2">Transaction History</h3>
//               <div className="space-y-2">
//                 <p className="text-sm text-gray-500">No transactions yet</p>
//               </div>
//             </Card>

//             <button
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
//               onClick={() => {/* Handle new investment */}}
//             >
//               Make New Investment
//             </button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }; 