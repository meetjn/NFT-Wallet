import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Check, X } from "lucide-react";
import BorrowDialog from "./Dialogs/BorrowDialog";

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
                  <td className="p-4">{asset.variableBorrowAPY}</td> {/* have to show Availabel borrow in USD here  */}
                  <td className="p-4 font-semibold">{asset.variableBorrowAPY*100} %</td>
                  
                  <td className="p-4 text-center">
                   <BorrowDialog asset={asset} />
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
