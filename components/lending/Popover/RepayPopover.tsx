import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AssetProps {
  data: {
    name: string;
  };
  selectedToken: string;
  setSelectedToken: (token: string) => void;
}

const RepayPopover = ({ data, selectedToken, setSelectedToken }: AssetProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="px-2 py-1 border rounded-md">
          {selectedToken}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <button
          className="block w-full text-left px-2 py-1 hover:bg-gray-200"
          onClick={() => setSelectedToken("USDC")}
        >
          USDC
        </button>
        <button
          className="block w-full text-left px-2 py-1 hover:bg-gray-200"
          onClick={() => setSelectedToken("aUSDC")}
        >
          aUSDC
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default RepayPopover;
