import { ethers, providers } from "ethers";
import { EthereumTransactionTypeExtended } from "@aave/contract-helpers";

interface SubmitTransactionParams {
  tx: EthereumTransactionTypeExtended;
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;
}

export const submitTransaction = async ({
  tx,
  provider,
  signer,
}: SubmitTransactionParams): Promise<providers.TransactionResponse> => {
  try {
    console.log("Fetching extended transaction data...");
    const extendedTxData = await tx.tx();
    console.log("Extended Transaction Data:", extendedTxData);

    if (!extendedTxData) {
      throw new Error("Extended transaction data is undefined.");
    }

    const { from, ...txData } = extendedTxData;

    console.log("Final transaction data before sending:", txData);

    const txResponse = await signer.sendTransaction({
      ...txData,
      value: txData.value ? ethers.BigNumber.from(txData.value) : undefined,
    });

    console.log("Transaction submitted successfully:", txResponse);
    return txResponse;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw error;
  }
};