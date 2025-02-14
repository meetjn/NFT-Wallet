"use client";

import React, { useEffect, useState } from "react";
import { useContract } from "@/lending/index";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import SupplyAssetsTable from "@/components/lending/LendingTable";
import { borrowAssets, supplyAssets } from "@/constants/lending";

import AssetsTable from "@/components/lending/LendingTable";
import BorrowingTable from "@/components/lending/BorrowingTable"
import { ethers } from "ethers";
import { base58 } from "ethers/lib/utils";
const LendingPage = () => {
  const {fetchAaveData, supplyWithPermit} = useContract();
  const [reservesData, setReservesData] = useState([]);
  const [userReservesData, setUserReservesData] = useState([]);
  const [userSummary, setUserSummary] = useState([]);
  const [baseCurrencyData, setBaseCurrencyData] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAaveData();
        console.log("data from page: ",data);
         // Modify fetchAaveData to return reserves and user reserves
        if (data) {
          setReservesData(data.formattedReserves|| []);
          setUserReservesData(data.userReserves || []);
          setUserSummary(data.userSummary || []);
          setBaseCurrencyData(data.baseCurrencyData || []);
        }
      } catch (error) {
        console.error("Error fetching Aave data:", error);
      }
    };

    fetchData();
  }, [fetchAaveData]);

  console.log("reserve data: ", reservesData);
  console.log("user summary data...checking state", userSummary);
  console.log("base currency data from page.js: ",baseCurrencyData)

 
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
      <Tables reservesData={reservesData}  userReserves={userReservesData}  userSummary={userSummary} baseCurrencyData={baseCurrencyData}/>
    </div>
  );
};

const Tables = ({ reservesData, userSummary, baseCurrencyData}) => (
  <main className="w-full flex flex-row items-center justify-between space-x-10">
    <Card className="border shadow-lg bg-neutral-200 w-1/2">
      <CardHeader className="text-xl font-semibold">Assets to supply</CardHeader>
      <CardDescription>
        {/* <AssetsTable
          title="Assets to Supply"
          assets={supplyAssets}
          actionLabel="Supply"
        /> */}
        <AssetsTable title="Assets to supply" assets={reservesData} summary={userSummary} actionLabel="Supply" />
      </CardDescription>
    </Card>



    {/* borrows */}
    <Card className="border shadow-lg bg-neutral-200 w-1/2">
      <CardHeader className="text-xl font-semibold">Assets to Borrow</CardHeader>
      <CardDescription>
        {/* <AssetsTable title="Assets to Borrow" assets={reservesData} actionLabel="Borrow" /> */}
        <BorrowingTable title="Assets to borrow" assets={reservesData} summary={userSummary} baseCurrencyData={baseCurrencyData} actionLabel="Borrow"/>
      </CardDescription>
    </Card>
  </main>
);

export default LendingPage;
