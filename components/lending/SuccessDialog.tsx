import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Plus, ExternalLink } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  amount: string;
  assetName: string;
  txHash: string;
  // onAddToWallet: () => void;
  // onViewTransaction: () => void;
  onClose: () => void;  // Add this
}

const SuccessDialog = ({
  open,
  amount,
  assetName,
  txHash,
  // onAddToWallet,
  // onViewTransaction,
  onClose,
}: SuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
            Supply Successful
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Amount Supplied</span>
                <span>{amount} {assetName}</span>
              </div>
              
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                className="flex items-center justify-center gap-2 w-full p-3 border rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                // onClick={onAddToWallet}
              >
                <Plus size={18} />
                Add to Wallet
              </button>
              
             

              <button 
                className="flex items-center justify-center gap-2 w-full p-3 bg-[#CE192D] text-white rounded-lg hover:bg-[#CE192D]/90"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;