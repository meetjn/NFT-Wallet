import React, { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { AlertTriangle, Check, X } from "lucide-react";
import SuccessDialog from './SuccessDialog';
import { ethers, BigNumber} from "ethers";
import { useContract } from "@/lending";

interface assetType {
  name: string;
  supplyAPY: number;
  borrowingEnabled: boolean;
  borrowableInIsolation: boolean;
  decimals: number;
  underlyingAsset: string;
}

interface props {
  asset: assetType;
  disabled: boolean; // Add this prop
}

const SupplyDialog = ({ asset, disabled }: props) => {
  const { supplyWithPermit, checkWalletBalance } = useContract();
  const [amount, setAmount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSupply = async (e: FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || BigNumber.from(Number(amount)).isZero()) {
      setError("Please enter a valid amount.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const amountInWei = ethers.utils.parseUnits(amount, asset.decimals);
      const walletBalance = await checkWalletBalance(asset.underlyingAsset);

      if (walletBalance.lt(amountInWei)) {
        setError("Insufficient balance to supply this amount.");
        setIsLoading(false);
        return;
      }

      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txResponse = await supplyWithPermit({
        reserve: asset.underlyingAsset,
        amount: amountInWei.toString(),
        deadline,
      });

      setTxHash(txResponse.hash);
      setShowSuccess(true);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error during supply:", error);

      if (error.code === 4001) {
        setError("Transaction rejected by user.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        setError("Insufficient funds for gas fees.");
      } else {
        setError("Failed to submit the supply transaction. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
          <button
            className="rounded-lg bg-[#CE192D] py-3 px-6 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled} // Disable the button if the prop is true
          >
            Supply
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="leading-relaxed tracking-wider">
              Supply {asset?.name}
            </DialogTitle>
            <DialogDescription className="flex flex-col space-y-2">
              <form onSubmit={handleSupply} className="flex flex-col space-y-5">
                <div>
                  <label htmlFor="amount">Amount</label>
                  <div className="flex flex-row justify-between items-center border rounded-md p-2">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="!px-0 outline-none border-none focus:outline-none"
                    />
                    <span className="text-sm">{asset?.name}</span>
                  </div>
                </div>
                <div>
                  <label>Transaction Overview</label>
                  <div className="flex flex-row items-center justify-between border rounded-md p-2 ">
                    <div className="flex flex-col space-y-2 w-full">
                      <div className="flex felx-row items-center justify-between">
                        <span>Supply APY</span>
                        <span>{(asset?.supplyAPY * 10).toFixed(2)}%</span>
                      </div>
                      <div className="flex felx-row items-center justify-between">
                        <span>Collaterization</span>
                        <span>
                          {asset.borrowingEnabled ? (
                            asset.borrowableInIsolation ? (
                              <AlertTriangle
                                className="inline-block text-yellow-500"
                                size={20}
                              />
                            ) : (
                              <Check
                                className="inline-block text-green-500"
                                size={20}
                              />
                            )
                          ) : (
                            <X className="inline-block text-red-500" size={20} />
                          )}
                        </span>
                      </div>
                    </div>
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
                  disabled={isLoading || disabled} // Disable if loading or insufficient balance
                >
                  {isLoading ? "Processing..." : "Supply"}
                </button>
              </form>
            </DialogDescription>
          </DialogHeader>
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

export default SupplyDialog;