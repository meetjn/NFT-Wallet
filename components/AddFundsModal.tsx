import { CrossIcon, XIcon } from "lucide-react";
import React, { useState } from "react";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualTbaAddress: string;
  fundingAmount: string;
  setFundingAmount: (amount: string) => void;
  onFund: () => Promise<void>;
  fundingType: string;
  erc20Address?: string; // Optional for ERC20 funding
  setErc20Address?: (address: string) => void; // Optional setter for ERC20 funding
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  manualTbaAddress,
  fundingAmount,
  setFundingAmount,
  onFund,
  fundingType,
  erc20Address,
  setErc20Address,
}) => {
  if (!isOpen) return null;

  return (
    <section
      className="modal bg-black bg-opacity-70 fixed top-0 left-0 w-full h-full flex justify-center items-center"
      onClick={onClose}>
      <div
        className="bg-white rounded-lg min-w-[600px] flex flex-col "
        onClick={(e) => {e.stopPropagation();}}>
        <div className="w-full p-4 pb-5 flex justify-between items-center rounded-t-lg border-b border-opacity-10">
          <h2 className="text-2xl font-urbanist-medium">Add {fundingType} to your account</h2>
          <XIcon size={24} onClick={onClose} className="cursor-pointer" />
        </div>
        <div className="p-4 w-full h-full flex flex-col flex-grow gap-8">
          <p className="font-urbanist-medium text-lg">
            Address: {manualTbaAddress}
          </p>
          {fundingType === "ERC20 Token" && setErc20Address && (
            <input
              type="text"
              placeholder="Enter ERC20 Token Address"
              value={erc20Address}
              onChange={(e) => setErc20Address(e.target.value)}
              className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
            />
          )}
          <input
            type="text"
            placeholder={`Enter amount (${fundingType})`}
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            className="p-2 pr-10 rounded-md text-black bg-gray-100 border border-opacity-10"
          />
          <button
            onClick={onFund}
            className="font-urbanist-medium text-lg rounded-lg bg-[#CE192D] py-4 px-6 text-white">
            Add {fundingType}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AddFundsModal;
