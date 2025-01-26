"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TokenboundClient } from "@tokenbound/sdk";
import { sepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { CurrencyAmount, TradeType, Percent, Token } from "@uniswap/sdk-core";
import { Pool, Route, Trade, SwapRouter } from "@uniswap/v3-sdk";

export default function TokenSwapInterface() {
  const { isConnected, address } = useAccount();
  const [tokenBoundClient, setTokenBoundClient] = useState(null);
  const [tbaAddress, setTbaAddress] = useState("");
  const [inputTokenAddress, setInputTokenAddress] = useState("");
  const [outputTokenAddress, setOutputTokenAddress] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const [slippage, setSlippage] = useState("1.0");

  useEffect(() => {
    if (isConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const client = new TokenboundClient({
        signer: provider.getSigner(),
        chainId: sepolia.id,
      });
      setTokenBoundClient(client);
    }
  }, [isConnected]);

  const handleSwap = async () => {
    if (
      !tokenBoundClient ||
      !tbaAddress ||
      !inputTokenAddress ||
      !outputTokenAddress ||
      !swapAmount
    ) {
      return alert("Please fill out all fields.");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const inputToken = new Token(
        11155111,
        inputTokenAddress,
        18,
        "INPUT",
        "Input Token"
      );
      const outputToken = new Token(
        11155111,
        outputTokenAddress,
        18,
        "OUTPUT",
        "Output Token"
      );

      // Placeholder for pool data; replace with actual fetched data.
      const pool = new Pool(
        inputToken,
        outputToken,
        3000, // Fee tier (0.3%)
        ethers.utils.parseUnits("1", 18).toString(),
        ethers.utils.parseUnits("1", 18).toString(),
        1.0001 ** 1234 // sqrtPriceX96
      );

      const route = new Route([pool], inputToken, outputToken);
      const tradeAmount = CurrencyAmount.fromRawAmount(
        inputToken,
        ethers.utils.parseUnits(swapAmount, 18).toString()
      );

      const trade = Trade.createUncheckedTrade({
        route,
        inputAmount: tradeAmount,
        outputAmount: CurrencyAmount.fromRawAmount(outputToken, "0"),
        tradeType: TradeType.EXACT_INPUT,
      });

      const slippageTolerance = new Percent(slippage, "100");
      const swapParams = SwapRouter.swapCallParameters(trade, {
        slippageTolerance,
        recipient: tbaAddress,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
      });

      const tx = await signer.sendTransaction({
        to: swapParams.calldata[0],
        data: swapParams.calldata,
        value: swapParams.value,
      });

      console.log("Transaction Hash:", tx.hash);
      alert(`Swap successful! Transaction Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Swap failed:", error);
      alert("Swap failed. Check the console for more details.");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Token Swap via TBA</h1>

      <label>
        <strong>TBA Address:</strong>
        <input
          type="text"
          value={tbaAddress}
          onChange={(e) => setTbaAddress(e.target.value)}
          placeholder="Enter your TBA Address"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>

      <label>
        <strong>Input Token Address:</strong>
        <input
          type="text"
          value={inputTokenAddress}
          onChange={(e) => setInputTokenAddress(e.target.value)}
          placeholder="Enter the token address you own"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>

      <label>
        <strong>Output Token Address:</strong>
        <input
          type="text"
          value={outputTokenAddress}
          onChange={(e) => setOutputTokenAddress(e.target.value)}
          placeholder="Enter the token address you wish to swap to"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>

      <label>
        <strong>Amount to Swap:</strong>
        <input
          type="text"
          value={swapAmount}
          onChange={(e) => setSwapAmount(e.target.value)}
          placeholder="Enter the amount to swap"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>

      <label>
        <strong>Slippage Tolerance (%):</strong>
        <input
          type="text"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
          placeholder="Enter slippage tolerance (e.g., 1.0)"
          style={{ width: "100%", margin: "10px 0" }}
        />
      </label>

      <button
        onClick={handleSwap}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Perform Swap
      </button>
    </div>
  );
}
