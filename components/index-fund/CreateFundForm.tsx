"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const COMMON_TOKENS = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "DOT", "MATIC"];

export default function CreateFundForm() {
  const [fundName, setFundName] = useState("");
  const [description, setDescription] = useState(""); // 🔹 Added Description Field
  const [tokens, setTokens] = useState([]);
  const [customToken, setCustomToken] = useState("");
  const [weights, setWeights] = useState({});
  const router = useRouter();

  const addToken = (token) => {
    if (!token || tokens.includes(token)) return;
    setTokens([...tokens, token]);
  };

  const removeToken = (token) => {
    setTokens(tokens.filter((t) => t !== token));
    const newWeights = { ...weights };
    delete newWeights[token];
    setWeights(newWeights);
  };

  const updateWeight = (token, value) => {
    setWeights({ ...weights, [token]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fundName || tokens.length === 0 || !description) {
      alert("Please fill all fields and add at least one token.");
      return;
    }

    const fundData = {
      name: fundName,
      description, // 🔹 Store Description
      tokens: tokens.map((token) => ({
        symbol: token,
        weight: weights[token] || 0,
      })),
    };

    const response = await fetch("/api/index-fund/customfund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fundData),
    });

    if (response.ok) {
      router.push("/index-fund");
    } else {
      console.error("Failed to create fund");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create Index Fund</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Fund Name:
          <input
            type="text"
            value={fundName}
            onChange={(e) => setFundName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>

        {/* 🔹 Add Description Field */}
        <label className="block mb-2">
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>

        <div className="mb-4">
          <h3 className="font-semibold">Select Common Tokens</h3>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {COMMON_TOKENS.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => addToken(token)}
                className="p-2 border rounded hover:bg-gray-200"
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Add Custom Token</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
              className="p-2 border rounded flex-grow"
            />
            <button
              type="button"
              onClick={() => {
                addToken(customToken);
                setCustomToken("");
              }}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Token Allocations</h3>
          {tokens.map((token) => (
            <div key={token} className="flex justify-between items-center mb-2">
              <span className="text-lg">{token}</span>
              <input
                type="number"
                value={weights[token] || ""}
                onChange={(e) => updateWeight(token, e.target.value)}
                placeholder="%"
                className="w-16 p-1 border rounded text-center"
              />
              <button
                type="button"
                onClick={() => removeToken(token)}
                className="p-1 text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded mt-4 hover:bg-green-600"
        >
          Create Fund
        </button>
      </form>
    </div>
  );
}
