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
import { AlertTriangle, Check, X } from "lucide-react";
import SuccessDialog from "./SuccessDialog"; 

interface Reserve {
  name: string;
  underlyingAsset: string; 
  aTokenAddress: string; 
}

interface Props {
  data: {
    reserve: Reserve;
  };
}

const WithdrawDialog = ({ data }: Props) => {
  const [amount, setAmount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false); 
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { withdraw } = useContract(); // Use the withdraw function from context

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
      console.log("Withdrawing...", {
        amount,
        reserve: data.reserve.underlyingAsset,
        aTokenAddress: data.reserve.aTokenAddress,
      });

      // Call the withdraw function
      const txResponse = await withdraw({
        reserve: data.reserve.underlyingAsset,
        amount,
        aTokenAddress: data.reserve.aTokenAddress,
      });

      setTxHash(txResponse.hash);

      // Wait for transaction confirmation
      setIsConfirming(true); 
      await txResponse.wait();
      setIsConfirming(false); 

      // Show success dialog
      setShowSuccess(true);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error during withdraw:", error);

      // Handle specific errors
      if (error.code === 4001) {
        setError("Transaction rejected by user.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        setError("Insufficient funds for gas fees.");
      } else {
        setError("Failed to submit the withdraw transaction. Please try again.");
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
                    onChange={(e) => setAmount(e.target.value)}
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
                  : "Withdraw"}
              </button>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        amount={amount}
        assetName={data.reserve.name}
        txHash={txHash}
        onClose={handleClose}
      />
    </>
  );
};

export default WithdrawDialog;