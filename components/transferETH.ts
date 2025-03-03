// transferETH.ts
import { User } from "lucide-react";
import { SupportedChain } from "../utils/chains";
import { getClients } from "./Client";
import { getTBAAddress } from "./utils";
import { parseEther } from "viem";

export async function transferFromTBA(
  chain: SupportedChain,
  amount: string,
  toAddress: `0x${string}`
) {
  const { tokenboundClient, publicClient} = await getClients(chain);
  const tbaAddress = getTBAAddress(chain);

  // ✅ Ensure the TBA is actually deployed before executing transactions
  const isDeployed = await tokenboundClient.checkAccountDeployment({
    accountAddress: tbaAddress,
  });

  if (!isDeployed) {
    throw new Error(`TBA is not deployed on ${chain}. Please deploy before transferring funds.`);
  }
  const balance = await publicClient.getBalance({ address: tbaAddress });
  console.log("TBA Balance:", balance.toString());
  if (balance < parseEther(amount)) {
    throw new Error("Insufficient funds in TBA to cover the transfer amount and gas fees.");
  }

  // ✅ Explicitly provide the account in execute()
  const txHash = await tokenboundClient.execute({
    account: tbaAddress, // ✅ Provide the executing account
    to: toAddress,
    value: parseEther(amount),
    data: "0x",
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}
