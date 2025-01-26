import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GetCookies from "./getcookies";
import { headers } from "next/headers";
import ContextProvider from "@/context";
import { ContractProvider } from "@/lending/index";
import NavBar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Q-NFT Wallet",
  description: "Quranium Node Sell",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          <NotificationProvider>
            <ContractProvider>
              <div className="flex flex-row w-full gap-4">
                <Sidebar />
                {children}
              </div>
            </ContractProvider>
          </NotificationProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
