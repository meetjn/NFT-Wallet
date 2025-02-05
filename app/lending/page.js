"use client";

import React, { useEffect, useState } from "react";
import { useContract } from "@/lending/index";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import SupplyAssetsTable from "@/components/lending/LendingTable";
import { borrowAssets, supplyAssets } from "@/constants/lending";

import AssetsTable from "@/components/lending/LendingTable";
import BorrowingTable from "@/components/lending/BorrowingTable"
import { ethers } from "ethers";
const LendingPage = () => {
  const {fetchAaveData, supplyWithPermit, checkWalletBalance} = useContract();
  const [reservesData, setReservesData] = useState([]);
  const [userReservesData, setUserReservesData] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAaveData();
        console.log("data from page: ",data);
         // Modify fetchAaveData to return reserves and user reserves
        if (data) {
          setReservesData(data.formattedPoolReserves|| []);
          setUserReservesData(data.userReserves || []);
        }
      } catch (error) {
        console.error("Error fetching Aave data:", error);
      }
    };

    fetchData();
  }, [fetchAaveData]);

  console.log("reserve data: ", reservesData);

  // const fetchBalances = async () => {
  //   const balances = {};
  //   for (const asset of reservesData) {
  //     try {
  //       const balance = await checkWalletBalance(asset.underlyingAsset);
  //       balances[asset.underlyingAsset] = balance;
  //       console.log("Balance bro:", balance)
  //     } catch (error) {
  //       console.error(`Error fetching balance for ${asset.name}`, error);
  //       balances[asset.underlyingAsset] = ethers.BigNumber.from(0);
  //     }
  //   }
  //   setAssetBalances(balances);
  // };

  // Fetch balances whenever reservesData changes
  // useEffect(() => {
  //   if (reservesData.length > 0) {
  //     fetchBalances();
  //   }
  // }, [reservesData]);

  const handleSupply = async (asset) => {
    try {
      const amount = ethers.utils.parseUnits("1",asset.decimals);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const walletBalance =  await checkWalletBalance(asset.underlyingAsset);
      if(walletBalance.lt(amount)){
        console.log("Insufficient balane: ");
        alert("Insufficient balance to supply this asset");
        return;
      }
      alert("Supply txn successfull!!!!");
    } catch (error) {
      console.log("Error supplying asset", error);
    }
  }
  return (
    <div className="flex flex-col space-y-10  w-full px-4">
      <h1 className="text-3xl font-bold my-8">Lending Dashboard</h1>
      <section className="flex flex-row justify-between space-x-10">
        <Card className="border shadow-lg bg-neutral-200 w-1/2">
          <CardHeader className="text-xl font-semibold">Your supplies</CardHeader>
          {/* your supply */}
          <CardDescription className="p-6">
            Nothing Supplied Yet
          </CardDescription>
        </Card>
        <Card className="border shadow-lg bg-neutral-200 w-1/2">
          <CardHeader className="text-xl font-semibold">Your Borrows</CardHeader>
          <CardDescription className="p-6">
            Nothing Borrowed Yet
          </CardDescription>
        </Card>
      </section>
      <Tables reservesData={reservesData} onSupply={handleSupply} userReserves={userReservesData}  />
    </div>
  );
};

const Tables = ({ reservesData, }) => (
  <main className="w-full flex flex-row items-center justify-between space-x-10">
    <Card className="border shadow-lg bg-neutral-200 w-1/2">
      <CardHeader className="text-xl font-semibold">Assets to supply</CardHeader>
      <CardDescription>
        {/* <AssetsTable
          title="Assets to Supply"
          assets={supplyAssets}
          actionLabel="Supply"
        /> */}
        <AssetsTable title="Assets to supply" assets={reservesData} actionLabel="Supply" />
      </CardDescription>
    </Card>



    {/* borrows */}
    <Card className="border shadow-lg bg-neutral-200 w-1/2">
      <CardHeader className="text-xl font-semibold">Assets to Borrow</CardHeader>
      <CardDescription>
        {/* <AssetsTable title="Assets to Borrow" assets={reservesData} actionLabel="Borrow" /> */}
        <BorrowingTable title="Assets to borrow" assets={reservesData} actionLabel="Borrow"/>
      </CardDescription>
    </Card>
  </main>
);

export default LendingPage;
