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
    console.log("Generating data to sign for permit...");
    const dataToSign = await pool.signERC20Approval({
      user,
      reserve,
      amount,
      deadline: deadline.toString(),
    });

    console.log("Requesting signature from user...");
    const signature = await provider.send("eth_signTypedData_v4", [
      user,
      dataToSign,
    ]);

    console.log("Signature:", signature);
    if (!signature) {
      throw new Error("No signature received.");
    }

    console.log("Performing supply with permit...");
    const txs: EthereumTransactionTypeExtended[] = await pool.supplyWithPermit({
      user,
      reserve,
      amount,
      signature,
      onBehalfOf,
      deadline: deadline.toString()
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