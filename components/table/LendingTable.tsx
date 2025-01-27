import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
interface props{
 
  assets:any,
  actionLabel:any
}

const AssetsTable = ({  assets, actionLabel }:props) => {
  return (
    <Card className="w-full p-4">
      <CardContent>
        
        <table className="w-full border-collapse border-spacing-0 text-left">
          <thead>
            <tr className="bg-gray-100 text-sm font-medium">
              <th className="p-4">Asset</th>
              <th className="p-4">APY</th>
              <th className="p-4">Balance</th>
              <th className="p-4 text-center">Collateral</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset:any, index:number) => (
              <tr
                key={index}
                className={`text-sm hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-4 font-medium">{asset.asset}</td>
                <td className="p-4">{asset.apy}</td>
                <td className="p-4">{asset.balance}</td>
                <td className="p-4 text-center">
                  {asset.collateral ? (
                    <ChevronDown className="inline-block text-green-500" />
                  ) : (
                    <ChevronUp className="inline-block text-red-500" />
                  )}
                </td>
                <td className="p-4 text-center">
                  <Button variant="outline">{actionLabel}</Button>
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
