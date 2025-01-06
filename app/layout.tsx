import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import ContextProvider from "@/context";
import { ContractProvider } from "@/lending/index";
import NavBar from "@/components/navbar"; // Import the NavBar component

const inter = Inter({ subsets: ["latin"] });

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
            <NavBar />
            {children}
          </ContractProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
