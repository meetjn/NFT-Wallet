import React from "react";

interface AssetProps {
  data: {
    name: string;
  };
  selectedToken: string;
  setSelectedToken: (token: string) => void;
}

const RepaySelect = ({ data, selectedToken, setSelectedToken }: AssetProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(e.target.value);
  };

  return (
    <select
      value={selectedToken}
      onChange={handleChange}
      className="px-2 py-1 border rounded-md"
    >
      <option value="USDC">USDC</option>
      <option value="aUSDC">aUSDC</option>
    </select>
  );
};

export default RepaySelect;