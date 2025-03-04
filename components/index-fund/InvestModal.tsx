// // components/index-fund/InvestModal.tsx
// import { useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// interface InvestModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   fundName: string;
//   fundId: string;
//   currentValue: number;
// }

// export default function InvestModal({
//   isOpen,
//   onClose,
//   fundName,
//   fundId,
//   currentValue
// }: InvestModalProps) {
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleInvest = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // TODO: Implement actual investment logic here
//       // This would connect to your smart contract
//       console.log('Investment details:', {
//         fundId,
//         amount: parseFloat(amount),
//       });

//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       onClose();
//       // You might want to refresh the fund data after successful investment
//     } catch (err) {
//       setError('Failed to process investment. Please try again.');
//       console.error('Investment error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Invest in {fundName}</DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Current Fund Value</label>
//             <p className="text-xl font-bold">${currentValue.toFixed(2)}</p>
//           </div>

//           <div className="space-y-2">
//             <label htmlFor="amount" className="text-sm font-medium">
//               Investment Amount (USD)
//             </label>
//             <Input
//               id="amount"
//               type="number"
//               min="0"
//               step="0.01"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="Enter amount to invest"
//             />
//           </div>

//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleInvest}
//             disabled={loading || !amount || parseFloat(amount) <= 0}
//           >
//             {loading ? 'Processing...' : 'Confirm Investment'}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }