import { ethers, providers } from "ethers";
import { Pool, EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { submitTransaction } from "./submitTransaction";

interface SupplyWithPermitParams {
  reserve: string;
  amount: string;
  deadline: number;
  pool: Pool;
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;
  user: string;
  onBehalfOf?: string;
}


export const supplyWithPermit = async ({
  reserve,
  amount,
  deadline,
  pool,
  provider,
  signer,
  user,
  onBehalfOf,
}: SupplyWithPermitParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Performing supply with permit...");

    // Call the supplyWithPermit method on the Pool instance
    const txs: EthereumTransactionTypeExtended[] = await pool.supply({
      user,
      reserve,
      amount,
      onBehalfOf,
    });

    console.log("Transactions array:", txs);
    if (!txs || txs.length === 0) {
      throw new Error("No transactions returned from supplyWithPermit.");
    }

    console.log("Submitting the first transaction...");
    return await submitTransaction({ tx: txs[0], provider, signer });
  } catch (error) {
    console.error("Error during supplyWithPermit:", error);
    throw error;
  }
};