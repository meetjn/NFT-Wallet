import React from 'react';
import { chains } from '../utils/chains';

interface NetworkSelectorProps {
  onSelect: (chainId: number) => void;
}

export default function NetworkSelector({ onSelect }: NetworkSelectorProps) {
  return (
    <div>
      <label htmlFor="network">Select a Network:</label>
      <select id="network" onChange={(e) => onSelect(Number(e.target.value))}>
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
    </div>
  );
}
