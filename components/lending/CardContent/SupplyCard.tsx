import React from "react";
import WithdrawDialog from "../Dialogs/WithdrawDialog";
import SupplyDialog from "../Dialogs/SupplyDialog";


interface Reserve {
  name?: string;
  usageAsCollateralEnabled?: boolean;
  underlyingBalance?: number;
}

export interface SupplyData {
  asset: string;
  balance: string;
  APY: string;
  collateral: boolean;
  underlyingBalance: number;
  underlyingBalanceUSD: number;
  reserve?: Reserve;
}

interface SupplyCardProps {
  data: SupplyData[];
  assets: any;
}

const SupplyCard = ({ data, assets}: SupplyCardProps) => {
  // Filter items that have a reserve with an underlyingBalance greater than 0
  const filteredData = data?.filter(
    (item) => item?.underlyingBalance && item.underlyingBalance > 0
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="border-b border-neutral-200">
          <tr className="text-xs font-semibold">
            <th className="px-6 py-3 text-left uppercase tracking-wider">
              Asset
            </th>
            <th className="px-8  py-3 text-center  uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left uppercase tracking-wider">
              APY
            </th>
            <th className="px-6 py-3 text-center  uppercase tracking-wider">
              Collateral
            </th>
            <th className="px-6 py-3 text-center  uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className=" divide-y divide-neutral-800 border-t border-neutral-800">
          {filteredData?.length > 0 ? (
            filteredData?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-left">
                  {item?.reserve?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center">
                    <span>{Number(item.underlyingBalance).toFixed(2)}</span>
                    <span className="text-sm text-gray-500">
                      ${Number(item.underlyingBalanceUSD).toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {Number(item?.reserve?.supplyAPY * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <label className="flex items-center justify-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={item?.reserve?.usageAsCollateralEnabled}
                        readOnly
                      />
                      <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                      <div
                        className={`dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition transform ${
                          item?.reserve?.usageAsCollateralEnabled
                            ? "translate-x-full bg-green-500"
                            : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </label>
                </td>

                <td>
                  <div className="flex flex-row items-center space-x-5">
                    <SupplyDialog asset={item}  />
                    <WithdrawDialog data={item} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-4 whitespace-nowrap text-center"
              >
                Nothing supplied yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplyCard;
