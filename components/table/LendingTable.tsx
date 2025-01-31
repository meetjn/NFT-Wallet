import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
interface props{
 
  assets:any,
  actionLabel:any
}

const AssetsTable = ({ assets, actionLabel }:props) => {
  console.log("assets", assets)
  return (
    <Card className="w-full p-4">
      <CardContent>
        
        <table className="w-full border-collapse border-spacing-0 text-left">
          <thead>
            <tr className=" text-sm font-medium">
              <th className="p-4">Asset</th>
              <th className="p-4">APY</th>
              <th className="p-4">Balance</th>
              <th className="p-4 text-center">Can be collateral</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset:any, index:number) => (
              <tr
                key={index}
                className={`text-sm border-b border-neutral-600/20 `}
              >
                <td className="p-4 font-medium">{}</td>
                <td className="p-4">{}</td>
                <td className="p-4">{}</td>
                {/* <td className="p-4 text-center">
                  { ? (
                    <ChevronDown className="inline-block text-green-500" />
                  ) : (
                    <ChevronUp className="inline-block text-red-500" />
                  )}
                </td> */}
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
