import { ethers, providers } from "ethers";
import { Pool, EthereumTransactionTypeExtended } from "@aave/contract-helpers";
import { submitTransaction } from "./submitTransaction";

interface WithdrawParams {
  user: string;
  reserve: string;
  amount: string;
  aTokenAddress: string;
  pool: Pool;
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;
  onBehalfOf?: string; 
}

export const withdraw = async ({
  user,
  reserve,
  amount,
  aTokenAddress,
  pool,
  provider,
  signer,
  onBehalfOf,
}: WithdrawParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Performing withdraw...");

    // Call the withdraw method on the Pool instance
    const txs: EthereumTransactionTypeExtended[] = await pool.withdraw({
      user,
      reserve,
      amount,
      aTokenAddress,
      onBehalfOf: onBehalfOf || user, // Default to user if onBehalfOf is not provided
    });

    console.log("Transactions array:", txs);
    if (!txs || txs.length === 0) {
      throw new Error("No transactions returned from withdraw.");
    }

    console.log("Submitting the transaction...");
    return await submitTransaction({ tx: txs[0], provider, signer });
  } catch (error) {
    console.error("Error during withdraw:", error);
    throw error;
  }
};