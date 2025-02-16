import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface Asset {
  name: string;
}

interface Props {
  asset: Asset;
}

const RepayDialog = ({ asset }: Props) => {
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      amount,
      asset,
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white">
          Repay
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repay {asset?.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <div>
              <label className="text-neutral-600 font-semibold">Amount</label>
              <div className="flex flex-row items-center border rounded-md p-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="!px-0 outline-none border-none focus:outline-none"
                  step="any"
                  placeholder="0.00"
                />
                <span className="text-sm ml-2">{asset?.name}</span>
              </div>
            </div>
            <label>Transaction Overview</label>
            <div className="flex flex-col w-full justify-between border rounded-md p-2 space-y-4">
              <div className="flex flex-row w-full justify-between items-center">
                <span>Remaining Debt</span>
                {/* <span className={getHealthFactorColor(healthFactor)}>
                  {healthFactor !== null ? healthFactor.toFixed(2) : "N/A"}
                </span> */}
              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <span>Health factor</span>
                {/* <span className={getHealthFactorColor(healthFactor)}>
                  {healthFactor !== null ? healthFactor.toFixed(2) : "N/A"}
                </span> */}
              </div>
              <div className="flex flex-row items-center justify-end text-xs">
                <span>Liquidation at {"<"}1.0</span>
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#CE192D] py-3 px-6 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RepayDialog;
