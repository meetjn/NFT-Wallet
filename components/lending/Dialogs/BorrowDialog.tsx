import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { FormEvent } from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InfinityIcon } from "lucide-react";
import { useContract } from "@/lending";
import { InterestRate } from "@aave/contract-helpers"; 
import SuccessDialog from "./SuccessDialog"; 
import { ethers } from "ethers";

interface AssetType {
  name: string;
  underlyingAsset: string;
  decimals: number;
}

interface BorrowDialogProps {
  asset: AssetType;
}

const BorrowDialog = ({ asset }: BorrowDialogProps) => {
  const { borrow } = useContract();
  const [amount, setAmount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleBorrow = async (e: FormEvent) => {
    e.preventDefault();

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
      
      const txResponse = await borrow({
        reserve: asset.underlyingAsset,
        amount: ethers.utils.parseUnits(amount, asset.decimals).toString(), 
        interestRateMode: InterestRate.Stable, 
      });

      setIsConfirming(true);
      await txResponse.wait(); 
      setIsConfirming(false);

      setTxHash(txResponse.hash);
      setShowSuccess(true);
      setIsOpen(false);
    } catch (error) {
      console.error("Error during borrow:", error);

      if (error instanceof Error) {
        if ("code" in error && error.code === 4001) {
          setError("Transaction rejected by user.");
        } else if ("code" in error && error.code === "INSUFFICIENT_FUNDS") {
          setError("Insufficient funds for gas fees.");
        } else {
          setError("Failed to submit the borrow transaction. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
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
            Borrow
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow {asset?.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="flex flex-col space-y-2">
            <form onSubmit={handleBorrow} className="flex flex-col space-y-5">
              <div>
                <label htmlFor="amount">Amount</label>
                <div className="flex flex-row justify-between items-center border rounded-md p-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="!px-0 outline-none border-none focus:outline-none"
                    step="any" 
                  />
                  <span className="text-sm">{asset?.name}</span>
                </div>
              </div>
              <label>Transaction Overview</label>
              <div className="flex flex-col w-full justify-between border p-2">
                <div className="flex flex-row w-full justify-between items-center">
                  <span>Health factor</span>
                  <InfinityIcon className="text-green-500" />
                </div>
                <div className="flex flex-row items-center justify-end">
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
                  : "Borrow"}
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

export default BorrowDialog;