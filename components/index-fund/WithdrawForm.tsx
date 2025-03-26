// "use client";
// import React, { useState } from 'react';

// const WithdrawForm = () => {
//   const [amount, setAmount] = useState('');

//   const handleWithdraw = () => {
//     alert(`Withdrawing $${amount}...`);
//     // Simulate withdraw logic
//     setAmount('');
//   };

//   return (
//     <div className="withdraw-form">
//       <h2>Withdraw Funds</h2>
//       <input
//         type="number"
//         placeholder="Amount"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />
//       <button onClick={handleWithdraw}>Withdraw</button>
//     </div>
//   );
// };

// export default WithdrawForm;