import React, { useState } from "react";
import { useContract } from "@/lending/index"; // Import the context
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RepayPopover from "../Popover/RepayPopover";
import { InterestRate } from "@aave/contract-helpers";

interface Asset {
  name: string;
  underlyingAsset: string; // Add underlyingAsset to the Asset interface
  aTokenAddress: string; // Add aTokenAddress to the Asset interface
}

interface Props {
  asset: Asset;
}

const RepayDialog = ({ asset }: Props): JSX.Element => {
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("USDC"); // Default to normal token
  const { repay, repayWithATokens } = useContract(); // Use repay functions from context

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log("Repaying...", {
        amount,
        reserve: asset.underlyingAsset,
        selectedToken,
      });

      if (selectedToken === "aToken") {
        // Repay with aTokens
        const txResponse = await repayWithATokens({
          reserve: asset.underlyingAsset,
          amount,
          rateMode: InterestRate.Variable, // Default to variable rate
        });
        console.log("Repay with aTokens successful:", txResponse);
        alert("Repay with aTokens successful!");
      } else {
        // Repay with normal tokens
        const txResponse = await repay({
          reserve: asset.underlyingAsset,
          amount,
          interestRateMode: InterestRate.Variable, // Default to variable rate
        });
        console.log("Repay successful:", txResponse);
        alert("Repay successful!");
      }
    } catch (error) {
      console.error("Error during repay:", error);
      alert("Repay failed. Please try again.");
    }
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
                  onChange={(e) => setAmount(e.target.value)}
                  className="!px-0 outline-none border-none focus:outline-none"
                  step="any"
                  placeholder="0.00"
                />
                <RepayPopover
                  data={asset}
                  selectedToken={selectedToken}
                  setSelectedToken={setSelectedToken}
                />
              </div>
              {/* Showing updated token */}
              <p className="mt-2 text-xs text-gray-600">
                Selected Token: {selectedToken === "aToken" ? "aToken" : "USDC"}
              </p>
            </div>
            <label className="font-semibold">Transaction Overview</label>
            <div className="flex flex-col w-full justify-between border rounded-md p-2 space-y-4">
              <div className="flex flex-row w-full justify-between items-center">
                <span>Remaining Debt</span>
                {/* <span className={getHealthFactorColor(healthFactor)}>
                  {healthFactor !== null ? healthFactor.toFixed(2) : "N/A"}
                </span> */}
              </div>
              <div className="flex flex-row w-full justify-between items-center">
                <span>Health Factor</span>
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