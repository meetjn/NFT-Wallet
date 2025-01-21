"use client";

import React, { useEffect, useState } from "react";
import { useContract } from "@/lending/index";

const LendingPage = () => {
  const { fetchAaveData } = useContract();
  const [reservesData, setReservesData] = useState([]);
  const [userReservesData, setUserReservesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAaveData(); // Modify fetchAaveData to return reserves and user reserves
        if (data) {
          setReservesData(data.formattedPoolReserves || []);
          setUserReservesData(data.userReserves || []);
        }
      } catch (error) {
        console.error("Error fetching Aave data:", error);
      }
    };

    fetchData();
  }, [fetchAaveData]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      <h1 className="text-3xl font-bold my-8">Lending Dashboard</h1>
      <Tables reservesData={reservesData} userReserves={userReservesData} />
    </div>
  );
};

const Tables = ({ reservesData, userReserves }) => (
  <>
    {/* Supply Table */}
    <div className="w-full max-w-5xl my-8">
      <h2 className="text-2xl font-bold mb-4">Supply Table</h2>
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Token</th>
            <th className="border border-gray-300 px-4 py-2">Total Liquidity</th>
            <th className="border border-gray-300 px-4 py-2">Available Liquidity</th>
            <th className="border border-gray-300 px-4 py-2">Supply APY</th>
            <th className="border border-gray-300 px-4 py-2">Collateral Enabled</th>
          </tr>
        </thead>
        <tbody>
          {reservesData.map((reserve, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{reserve.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {parseFloat(reserve.totalLiquidityUSD).toFixed(2)} USD
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {parseFloat(reserve.availableLiquidityUSD).toFixed(2)} USD
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {(reserve.supplyAPY * 100).toFixed(2)}%
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {reserve.usageAsCollateralEnabled ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Borrow Table */}
    <div className="w-full max-w-5xl my-8">
      <h2 className="text-2xl font-bold mb-4">Borrow Table</h2>
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Token</th>
            <th className="border border-gray-300 px-4 py-2">Borrowed Amount</th>
            <th className="border border-gray-300 px-4 py-2">Stable Borrow Rate</th>
            <th className="border border-gray-300 px-4 py-2">Variable Borrow Rate</th>
            <th className="border border-gray-300 px-4 py-2">Usage as Collateral</th>
          </tr>
        </thead>
        <tbody>
          {userReserves.map((reserve, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{reserve.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                {parseFloat(reserve.scaledATokenBalance || 0).toFixed(2)}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {reserve.stableBorrowRate
                  ? `${(reserve.stableBorrowRate * 100).toFixed(2)}%`
                  : "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {reserve.variableBorrowRate
                  ? `${(reserve.variableBorrowRate * 100).toFixed(2)}%`
                  : "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {reserve.usageAsCollateralEnabledOnUser ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

export default LendingPage;
