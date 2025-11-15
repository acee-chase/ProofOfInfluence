import { utils } from "ethers";
import badgeConfig from "@shared/contracts/immortality_badge.json";
import { getAgentKitContext } from "./agentkitClient";

const BADGE_ID = 1;

export async function mintTestBadge(to: string): Promise<string> {
  if (!badgeConfig.address) {
    throw new Error("Immortality badge contract address is not configured");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(badgeConfig.abi as any);
  const data = iface.encodeFunctionData("mint", [to, BADGE_ID, 1]);
  const txHash = await walletProvider.sendTransaction({
    to: badgeConfig.address as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  return txHash;
}

