"use client";

import React, { useEffect, useState } from "react";
import { useContract } from "@/lending/index";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import SupplyAssetsTable from "@/components/table/LendingTable";
import { borrowAssets, supplyAssets } from "@/constants/lending";
import AssetsTable from "@/components/table/LendingTable";
const LendingPage = () => {
  const {fetchAaveData} = useContract();
  const [reservesData, setReservesData] = useState([]);
  const [userReservesData, setUserReservesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAaveData();
        console.log(data);
         // Modify fetchAaveData to return reserves and user reserves
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
      <Tables reservesData={reservesData} userReserves={userReservesData} />
    </div>
  );
};

const Tables = ({ reservesData, userReserves }) => (
  <main className="w-full flex flex-row items-center justify-between space-x-10">
    <Card className="border shadow-lg bg-neutral-200 w-1/2">
      <CardHeader className="text-xl font-semibold">Assets to supply</CardHeader>
      <CardDescription>
        {/* <AssetsTable
          title="Assets to Supply"
          assets={supplyAssets}
          actionLabel="Supply"
        /> */}
        <AssetsTable title="Assets to supply" assets={supplyAssets} actionLabel="Supply" />
      </CardDescription>
    </Card>



    {/* borrows */}
    <Card className="border shadow-lg bg-neutral-200 w-1/2">
      <CardHeader className="text-xl font-semibold">Assets to Borrow</CardHeader>
      <CardDescription>
        <AssetsTable title="Assets to Borrow" assets={borrowAssets} actionLabel="Borrow" />
      </CardDescription>
    </Card>
  </main>
);

export default LendingPage;
