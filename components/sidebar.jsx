"use client";
import React from "react";
import { useAccount } from "wagmi";
import {
  House,
  Settings,
  BadgeDollarSign,
  BriefcaseBusiness,
  ArrowUpDown,
} from "lucide-react"; // Import valid icons
import Link from "next/link";

const items = [
  { name: "Home", icon: <House />, href: "/" },
  { name: "Assets", icon: <BriefcaseBusiness />, href: "/assets" }, // Replace "ass" with a valid icon
  { name: "Transactions", icon: <ArrowUpDown />, href: "/transactions" },
  { name: "Staking", icon: <BadgeDollarSign />, href: "/staking" },
];

const Sidebar = () => {
  const { isConnected, address } = useAccount();

  return (
    <div className="h-full w-64 text-white flex flex-col p-4 justify-between sticky">
      <div className="flex flex-col space-y-4 h-full ">
        <p>{isConnected ? address : "Not connected"}</p>
        <div>
          {items.map((item, index) => (
            <Link key={index} href={item.href}>
              <div  className="flex gap-2 items-center py-2">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-600 pt-2 justify-self-end">
        <Link href="/settings">
          <div className="flex gap-2 items-center py-2">
            <span><Settings /></span>
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
