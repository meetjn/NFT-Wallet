import { Dialog, DialogHeader, DialogTrigger ,DialogContent, DialogDescription} from "@/components/ui/dialog";

import React from "react";

const RepayDialog = ({asset}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <button className="rounded-lg bg-[#CE192D] py-3 px-6 text-white disabled:opacity-50 disabled:cursor-not-allowed">
          Repay
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTrigger>Repay {asset.name} </DialogTrigger>
        </DialogHeader>
        <DialogDescription>
            
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default RepayDialog;
