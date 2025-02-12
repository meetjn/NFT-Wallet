import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InfinityIcon } from "lucide-react";
import Image from "next/image";
const BorrowDialog = ({ asset }) => {
  const [amount, setAmount] = useState<string>("");

  return (
    <Dialog>
      <DialogTrigger>
        <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white">
          Borrow
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Borrow {asset?.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col space-y-2">
          <form className="flex flex-col space-y-5">
            <div>
              <label htmlFor="amount">Amount</label>
              <div className="flex flex-row justify-between items-center border rounded-md p-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="!px-0 outline-none border-none focus:outline-none"
                  step="any" // Allow decimal input
                />
                <span className="text-sm">{asset?.name}</span>
              </div>
            </div>
            <label>Transaction Overview</label>
            <div className="flex flex-col w-full justify-between border  p-2">
              <div className="flex flex-row w-full justify-between items-center">
                <span>Health factor</span>
                <InfinityIcon className="text-green-500" />
              </div>
              <div className="flex flex-row items-center justify-end">
                <span>Liquidation at {"<"}1.0</span>
              </div>
            </div>

            <div>
              <span>$ 3.78</span>
            </div>

            <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white">
              Enter an amount
            </button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default BorrowDialog;
