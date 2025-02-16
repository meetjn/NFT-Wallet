import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React, { useState } from "react";

interface Reserve {
  name: string;
}

interface Props {
  data: {
    reserve: Reserve;
  };
}

const WithdrawDialog = ({ data }: Props) => {
  const [amount, setAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      amount,
      data,
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white disabled:opacity-50 disabled:cursor-not-allowed">
          Withdraw
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw {data?.reserve?.name}</DialogTitle>
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
                <span className="ml-2">{data?.reserve?.name}</span>
              </div>
            </div>

            <div>
              <label className="text-neutral-800 font-semibold">
                Transaction Overview
              </label>
              <div className="flex flex-col w-full justify-between items-center border rounded-md p-2 space-y-3">
                <section className="flex flex-row justify-between w-full">
                  <span>Remaining supply</span>
                  <span>
                    <span className="font-light">{data?.reserve?.name}</span>
                  </span>
                </section>
                <section className="flex flex-row justify-between w-full">
                  <span>Health Factor</span>
                  <span>
                    <span className="font-light">N/A</span>
                  </span>
                </section>
              </div>
            </div>

            <div>
              <span>$4.99</span>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#CE192D] py-3 px-6 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw {data?.reserve?.name}
            </button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
