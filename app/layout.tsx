import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
// import "./globals.css";
import GetCookies from "./getcookies";
// import { ThirdwebProvider } from "thirdweb/react";
const inter = Inter({ subsets: ["latin"] });
import { headers } from "next/headers";
import ContextProvider from "@/context";
// import { Sepolia } from "@thirdweb-dev/chains";
import { ContractProvider } from "@/lending/index";

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
  // const cookies = <GetCookies />;
  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>
          <ContractProvider>{children}</ContractProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
