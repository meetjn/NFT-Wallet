import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Check, X } from "lucide-react"; // Add this import

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
              <th className="p-4 text-center">Action</th>
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
                  {asset.borrowingEnabled ? (
                    asset.borrowableInIsolation ? (
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
                 <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white">Supply</button>
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
