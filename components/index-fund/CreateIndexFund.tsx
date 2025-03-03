// "use client"
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Alert } from '@/components/ui/alert';

// export default function CreateIndexFund() {
//   const [fundName, setFundName] = useState('');
//   const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
//   const [weights, setWeights] = useState<Record<string, number>>({});

//   const handleCreateFund = async () => {
//     try {
//       // TODO: Implement fund creation logic
//       console.log('Creating fund:', { fundName, selectedTokens, weights });
//     } catch (error) {
//       console.error('Error creating fund:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <label className="block text-sm font-medium mb-2">Fund Name</label>
//         <Input
//           value={fundName}
//           onChange={(e) => setFundName(e.target.value)}
//           placeholder="Enter fund name"
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">Select Tokens</label>
//         {/* Add token selection component here */}
//       </div>

//       <div>
//         <label className="block text-sm font-medium mb-2">Set Weights</label>
//         {selectedTokens.map((token) => (
//           <div key={token} className="flex items-center gap-4 mb-2">
//             <span>{token}</span>
//             <Input
//               type="number"
//               min="0"
//               max="100"
//               value={weights[token] || ''}
//               onChange={(e) => setWeights({
//                 ...weights,
//                 [token]: Number(e.target.value)
//               })}
//             />
//             <span>%</span>
//           </div>
//         ))}
//       </div>

//       <Button onClick={handleCreateFund} className="w-full">
//         Create Index Fund
//       </Button>
//     </div>
//   );
// }