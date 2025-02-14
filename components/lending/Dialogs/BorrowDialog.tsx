import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import SuccessDialog from "./SuccessDialog";
import {
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
  USD_DECIMALS,
} from "@aave/math-utils";
import { borrow } from "@/lending/utils/borrow"; 
import { useContract } from "@/lending";
import { InterestRate } from "@aave/contract-helpers";

interface AssetType {
  name: string;
  underlyingAsset: string;
  decimals: number;
  formattedPriceInMarketReferenceCurrency: string;
}

interface BorrowDialogProps {
  asset: AssetType;
  user: {
    totalCollateralUSD: string;
    totalBorrowsUSD: string;
    currentLiquidationThreshold: string;
    healthFactor: string;
  };
  marketReferencePriceInUsd: string;
}

const BorrowDialog = ({ asset, user, marketReferencePriceInUsd }: BorrowDialogProps) => {
  const {borrow} = useContract();
  
  const [amount, setAmount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [healthFactor, setHealthFactor] = useState<number | null>(null);

  const calculateHealthFactor = (amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setHealthFactor(null);
      return;
    }

    const amountToBorrowInUsd = valueToBigNumber(amount)
      .multipliedBy(asset.formattedPriceInMarketReferenceCurrency)
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);

    const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
        amountToBorrowInUsd
      ),
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    });

    setHealthFactor(newHealthFactor.toNumber());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    calculateHealthFactor(newAmount);
  };

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
        amount: amount.toString(),
        interestRateMode: InterestRate.Stable
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

  const getHealthFactorColor = (healthFactor: number | null) => {
    if (healthFactor === null) return "text-gray-500"; // Default color
    if (healthFactor > 2) return "text-green-500"; // Safe
    if (healthFactor > 1.5) return "text-orange-500"; // Medium risk
    return "text-red-500"; // High risk
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
                    onChange={handleAmountChange}
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
                  <span className={getHealthFactorColor(healthFactor)}>
                    {healthFactor !== null ? healthFactor.toFixed(2) : "N/A"}
                  </span>
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
