import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Check, X } from "lucide-react";
import BorrowDialog from "./Dialogs/BorrowDialog";


interface props {
  assets: any;
  actionLabel: any;
  summary: any;
  baseCurrencyData: any;
}

const AssetsTable = ({ assets, actionLabel, summary , baseCurrencyData}: props) => {
  console.log("assets are", assets);
  console.log("user summary from page.js: ", summary);
  
  return (
    <Card className="w-full p-4">
      <CardContent>
        <table className="w-full border-collapse border-spacing-0 text-left">
          <thead>
            <tr className=" text-sm font-medium">
              <th className="p-4">Asset</th>
              <th className="p-4">Available</th>

              <th className="p-4 text-center">APY, variable</th>
            </tr>
          </thead>
          <tbody>
            {assets
              ?.filter((asset: any) => asset.borrowingEnabled)
              .map((asset: any, index: number) => (
                <tr
                  key={index}
                  className="text-sm border-b border-neutral-600/20"
                >
                  <td className="p-4">{asset.name}</td>
                  <td className="p-4">
                    {asset.name == "Gho Token"
                      ? Number(summary.availableBorrowsUSD).toFixed(2)
                      : (summary.availableBorrowsUSD * 0.99).toFixed(2)}
                  </td>{" "}
                  {/* have to show Available borrow in USD here  */}
                  <td className="p-4 font-semibold">
                    {(asset.variableBorrowAPY * 100).toFixed(2)} %
                  </td>
                  <td className="p-4 text-center">
                    <BorrowDialog asset={asset} user={summary} marketReferencePriceInUsd={baseCurrencyData.marketReferenceCurrencyPriceInUsd}/>
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
