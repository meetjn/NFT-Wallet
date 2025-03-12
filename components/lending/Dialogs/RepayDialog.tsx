import React, { useState } from "react";
import { useContract } from "@/lending/index"; 
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
import { AlertTriangle, Check, X } from "lucide-react";
import SuccessDialog from "./SuccessDialog"; 

interface Asset {
  name: string;
  underlyingAsset: string; 
  aTokenAddress: string; 
}

interface Props {
  asset: Asset;
}

const RepayDialog = ({ asset }: Props): JSX.Element => {
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("USDC"); // Default to normal token
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false); 
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { repay, repayWithATokens } = useContract(); // Use repay functions from context

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate the amount
    if (!amount || isNaN(Number(amount))) {
      setError("Please enter a valid amount.");
      return;
    }

    const amountNumber = Number(amount);
    if (amountNumber <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      console.log("Repaying...", {
        amount,
        reserve: asset.underlyingAsset,
        selectedToken,
      });

      let txResponse;

      if (selectedToken === "aToken") {
        // Repay with aTokens
        txResponse = await repayWithATokens({
          reserve: asset.underlyingAsset,
          amount,
          rateMode: InterestRate.Variable, // Default to variable rate
        });
        console.log("Repay with aTokens successful:", txResponse);
      } else {
        // Repay with normal tokens
        txResponse = await repay({
          reserve: asset.underlyingAsset,
          amount,
          interestRateMode: InterestRate.Variable, // Default to variable rate
        });
        console.log("Repay successful:", txResponse);
      }

      setTxHash(txResponse.hash);

      // Wait for transaction confirmation
      setIsConfirming(true); 
      await txResponse.wait();
      setIsConfirming(false); 

      // Show success dialog
      setShowSuccess(true);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error during repay:", error);

      // Handle specific errors
      if (error.code === 4001) {
        setError("Transaction rejected by user.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        setError("Insufficient funds for gas fees.");
      } else {
        setError("Failed to submit the repay transaction. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsConfirming(false); 
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setAmount("");
    setTxHash("");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="rounded-lg bg-[#CE192D] py-3 px-6 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isConfirming}
              >
                {isLoading
                  ? "Processing..."
                  : isConfirming
                  ? "Confirming..."
                  : "Submit"}
              </button>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        amount={amount}
        assetName={asset.name}
        txHash={txHash}
        onClose={handleClose}
      />
    </>
  );
};

export default RepayDialog;