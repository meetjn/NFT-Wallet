"use client";
import React from "react";
import { useAccount } from "wagmi";
import {
  House,
  Settings,
  BadgeDollarSign,
  BriefcaseBusiness,
  ArrowUpDown,
  BarChart,
  PieChart,
  Banknote,
  Image,
  Leaf,
  ChartAreaIcon,
} from "lucide-react"; // Import valid icons
import Link from "next/link";

const items = [
  { name: "Home", icon: <House />, href: "/" },
  { name: "Assets", icon: <BriefcaseBusiness />, href: "/assets" },
  { name: "NFTs", icon: <Image />, href: "/nfts" },
  { name: "Lending", icon: <Banknote />, href: "/lending" },
  { name: "Staking", icon: <BadgeDollarSign />, href: "/staking" },
  { name: "Farming", icon: <Leaf />, href: "/farming" },
  { name: "Crypto ETFs", icon: <BarChart />, href: "/etfs" },
  { name: "Index Funds", icon: <PieChart />, href: "/index" },
  { name: "Transactions", icon: <ArrowUpDown />, href: "/transactions" },
  { name: "Trading", icon: <ChartAreaIcon />, href: "/trading" },
];

const Sidebar = () => {
  const { isConnected, address } = useAccount();

  return (
    <div className="h-screen w-64 text-white flex flex-col p-4 justify-between sticky border-r border-gray-600 border-opacity-50">
      <div className="flex flex-col space-y-4 h-full ">
        <div>
          {items.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="flex gap-2 items-center py-2">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-600 pt-2 justify-self-end flex flex-col space-y-4">
        <Link href="/settings">
          <div className="flex gap-2 items-center py-2">
            <span>
              <Settings />
            </span>
            <span>Settings</span>
          </div>
        </Link>
        <p>
          <w3m-button />
          {isConnected && <w3m-network-button />}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
