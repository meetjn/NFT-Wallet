import { copyFile } from "fs";
import React from "react";
import BorrowDialog from "../Dialogs/BorrowDialog";
import RepayDialog from "../Dialogs/RepayDialog";

interface UserReservesData {
  totalBorrows: number;
  // Add other properties or reserves array if needed
}

interface BorrowCardProps {
  data: {
    userReservesData?: UserReservesData;
    // Add other properties as needed
  };
}

const BorrowCard = ({ data }: BorrowCardProps) => {
  const reserves = data?.userReservesData;

  const filteredReserves = reserves?.filter(
    (reserve) => Number(reserve.totalBorrowsUSD) > 0
  );
  console.log(filteredReserves);

  return (
    <main className="flex flex-col justify-center items-center w-full">
      <table className="min-w-full">
        <thead className="border-b border-neutral-200">
          <tr className="text-xs font-semibold">
            <th className="px-6 py-3 text-left uppercase tracking-wider">
              Asset
            </th>
            <th className="px-8 py-3 text-center uppercase tracking-wider">
              Debt
            </th>
            <th className="px-6 py-3 text-left uppercase tracking-wider">
              APY
            </th>
           
            
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800 border-t border-neutral-800">
          {filteredReserves ? (
            filteredReserves.map((reserve, idex) => {
             
              return (
                // Render the row(s) when totalBorrows > 0
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {/* Replace with dynamic asset name */}
                  {reserve.reserve.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* Replace with dynamic balance */}
                   {reserve.totalBorrowsUSD}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {/* Replace with dynamic APY */}
                    5%
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* Replace with action buttons/components */}
                    <div className="flex flex-row items-center space-x-5">

                  <BorrowDialog asset={reserve.reserve} />
                  <RepayDialog asset={reserve.reserve} />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            // Fallback row if totalBorrows is not greater than 0
            <tr>
              <td
                colSpan={5}
                className="px-6 py-4 whitespace-nowrap text-center"
              >
                No borrow data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
};

export default BorrowCard;
