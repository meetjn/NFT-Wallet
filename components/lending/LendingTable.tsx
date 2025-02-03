import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import SupplyDialog from "./SupplyDialog";
import { CheckCircle, AlertTriangle, Check, X } from "lucide-react"; 

interface props {
  assets: any;
  actionLabel: any;
}

const AssetsTable = ({ assets, actionLabel }: props) => {
  console.log("assets are", assets);
  return (
    <Card className="w-full p-4">
      <CardContent>
        <table className="w-full border-collapse border-spacing-0 text-left">
          <thead>
            <tr className=" text-sm font-medium">
              <th className="p-4">Asset</th>
              <th className="p-4">APY</th>

              <th className="p-4 text-center">Collateral</th>
              
            </tr>
          </thead>
          <tbody>
            {assets?.map((asset: any, index: number) => (
              <tr
                key={index}
                className={`text-sm border-b border-neutral-600/20 `}
              >
                <td className="p-4 font-medium">{asset?.name}</td>
                <td className="p-4 font-semibold">{(asset?.supplyAPY * 10).toFixed(2)}%</td>
                <td className="p-4 text-center">
                  {asset.usageAsCollateralEnabled ? (
                    asset.isIsolated ? (
                      <AlertTriangle
                        className="inline-block text-yellow-500"
                        size={20}
                      />
                    ) : (
                      <Check
                        className="inline-block text-green-500"
                        size={20}
                      />
                    )
                  ) : (
                    <X className="inline-block text-red-500" size={20} />
                  )}
                </td>
                <td className="p-4 text-center">
                 {/* <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white">Supply</button> */}
                 <SupplyDialog asset={asset} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default AssetsTable;
