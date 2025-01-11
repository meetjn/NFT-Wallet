import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GetCookies from "./getcookies";
// import { ThirdwebProvider } from "thirdweb/react";
const inter = Inter({ subsets: ["latin"] });
import { headers } from "next/headers";
import ContextProvider from "@/context";
// import { Sepolia } from "@thirdweb-dev/chains";
import { ContractProvider } from "@/lending/index";
import NavBar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Quranium Node Sell",
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
          <ContractProvider>
            <div className="flex flex-row w-full gap-4">
              <Sidebar />
              {children}
            </div>
          </ContractProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
