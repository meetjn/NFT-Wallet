import { ethers, providers } from "ethers";
import { Pool, EthereumTransactionTypeExtended, InterestRate } from "@aave/contract-helpers";
import { submitTransaction } from "./submitTransaction";

interface BorrowParams {
  user: string;
  reserve: string;
  amount: string;
  pool: Pool;
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;
  interestRateMode: InterestRate;
  onBehalfOf?: string; // Optional parameter
}

export const borrow = async ({
  user,
  reserve,
  amount,
  pool,
  provider,
  signer,
  interestRateMode,
  onBehalfOf,
}: BorrowParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Performing borrow...");

    // Call the borrow method on the Pool instance
    const txs: EthereumTransactionTypeExtended[] = await pool.borrow({
      user,
      reserve,
      amount,
      interestRateMode,
      onBehalfOf: onBehalfOf || user, // Default to user if onBehalfOf is not provided
    });

    console.log("Transactions array:", txs);
    if (!txs || txs.length === 0) {
      throw new Error("No transactions returned from borrow.");
    }

    console.log("Submitting the transaction...");
    return await submitTransaction({ tx: txs[0], provider, signer });
  } catch (error) {
    console.error("Error during borrow:", error);
    throw error;
  }
};