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

interface assetType {
  name: string;
  supplyAPY: number;
  borrowingEnabled: boolean;
  borrowableInIsolation: boolean;
}

interface props {
  asset: assetType;
}

const SupplyDialog = ({ asset }: props) => {
  const [amount, setAmount] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTxHash("0x1234...5678");
    setIsOpen(false); // Close supply dialog
    setShowSuccess(true); // Open success dialog
  };

  const handleAddToWallet = () => {
    // Add to wallet logic
  };

  const handleViewTransaction = () => {
    // View transaction logic
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
            Supply
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="leading-relaxed tracking-wider">
              Supply {asset?.name}
            </DialogTitle>
            <DialogDescription className="flex flex-col space-y-2">
              <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                <div>
                  <label htmlFor="">Amount</label>
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
                <button
                  type="submit"
                  className="rounded-lg bg-[#CE192D] py-3 px-6 text-white"
                >
                  Supply
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
        onAddToWallet={handleAddToWallet}
        onViewTransaction={handleViewTransaction}
        onClose={handleClose}
      />
    </>
  );
};

export default SupplyDialog;