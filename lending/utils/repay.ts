import { ethers, providers } from "ethers";
import { Pool, EthereumTransactionTypeExtended, InterestRate } from "@aave/contract-helpers";
import { submitTransaction } from "./submitTransaction";

interface RepayParams {
  user: string;
  reserve: string;
  amount: string;
  interestRateMode: InterestRate;
  pool: Pool;
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;
  deadline: number;
  onBehalfOf?: string; // Optional parameter
}

interface RepayWithPermitParams extends RepayParams {
  signature: string; // Signature for gasless approval
}

interface RepayWithATokensParams {
  user: string;
  reserve: string;
  amount: string;
  rateMode: InterestRate;
  pool: Pool;
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;
}

/**
 * Repays a borrow on the specific reserve, optionally on behalf of another user.
 * Handles approval transactions if necessary.
 */
export const repay = async ({
  user,
  reserve,
  amount,
  interestRateMode,
  pool,
  provider,
  signer,
  onBehalfOf,
}: RepayParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Performing repay...");

    // Call the repay method on the Pool instance
    const txs: EthereumTransactionTypeExtended[] = await pool.repay({
      user,
      reserve,
      amount,
      interestRateMode,
      onBehalfOf: onBehalfOf || user, // Default to user if onBehalfOf is not provided
    });

    console.log("Transactions array:", txs);
    if (!txs || txs.length === 0) {
      throw new Error("No transactions returned from repay.");
    }

    // Submit the first transaction (approval or repay)
    console.log("Submitting the transaction...");
    return await submitTransaction({ tx: txs[0], provider, signer });
  } catch (error) {
    console.error("Error during repay:", error);
    throw error;
  }
};

/**
 * Repays a borrow using a gasless signature for approval.
 */
export const repayWithPermit = async ({
  user,
  reserve,
  amount,
  interestRateMode,
  signature,
  pool,
  provider,
  signer,
  deadline,
  onBehalfOf,
}: RepayWithPermitParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Performing repay with permit...");

    // Call the repayWithPermit method on the Pool instance
    const txs: EthereumTransactionTypeExtended[] = await pool.repayWithPermit({
      user,
      reserve,
      amount,
      interestRateMode,
      signature,
      deadline: deadline.toString(),
      onBehalfOf: onBehalfOf || user, // Default to user if onBehalfOf is not provided
    });

    console.log("Transactions array:", txs);
    if (!txs || txs.length === 0) {
      throw new Error("No transactions returned from repayWithPermit.");
    }

    // Submit the first transaction (repay)
    console.log("Submitting the transaction...");
    return await submitTransaction({ tx: txs[0], provider, signer });
  } catch (error) {
    console.error("Error during repayWithPermit:", error);
    throw error;
  }
};

/**
 * Repays a borrow using aTokens, deducting funds from the user's aToken balance.
 */
export const repayWithATokens = async ({
  user,
  reserve,
  amount,
  rateMode,
  pool,
  provider,
  signer,
}: RepayWithATokensParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Performing repay with aTokens...");

    // Call the repayWithATokens method on the Pool instance
    const txs: EthereumTransactionTypeExtended[] = await pool.repayWithATokens({
      user,
      reserve,
      amount,
      rateMode,
    });

    console.log("Transactions array:", txs);
    if (!txs || txs.length === 0) {
      throw new Error("No transactions returned from repayWithATokens.");
    }

    // Submit the first transaction (repay)
    console.log("Submitting the transaction...");
    return await submitTransaction({ tx: txs[0], provider, signer });
  } catch (error) {
    console.error("Error during repayWithATokens:", error);
    throw error;
  }
};