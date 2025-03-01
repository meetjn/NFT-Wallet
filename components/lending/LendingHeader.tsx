import React from "react"; 
import {} from "@aave/math-utils";
 
interface props {
  userReserves: {
    netWorthUSD: number;
    healthFactor: number;
  };
}

const LendingHeader = ({ userReserves }: props) => {
  console.log(userReserves);
  return (
    <section>
      <div className="flex flex-row items-center space-x-10">
        <div className="flex flex-col items-start">
          <span className="text-sm">Net Worth</span>
          <span className="text-2xl font-bold text-black">
            <span className="font-bold text-neutral-800">$</span>
            {Number(userReserves?.netWorthUSD).toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm">Net APY</span>
          <span className="text-2xl font-bold text-black"> 0.06%</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm">Health Factor</span>
          <span className="text-2xl font-bold text-black">
            {Number(userReserves?.healthFactor).toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default LendingHeader;
