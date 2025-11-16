import { AgentKit, CdpWalletProvider } from "@coinbase/agentkit";

type AgentKitContext = {
  agentkit: AgentKit;
  walletProvider: CdpWalletProvider;
};

let contextPromise: Promise<AgentKitContext> | null = null;

async function initAgentKit(): Promise<AgentKitContext> {
  const apiKeyName = process.env.CDP_API_KEY_NAME;
  const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY;
  if (!apiKeyName || !apiKeyPrivateKey) {
    throw new Error("CDP API credentials are not configured");
  }

  const walletProvider = await CdpWalletProvider.configureWithWallet({
    apiKeyName,
    apiKeyPrivateKey,
    networkId: process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia",
  });

  const agentkit = await AgentKit.from({
    walletProvider,
  });

  return { agentkit, walletProvider };
}

export async function getAgentKitContext(): Promise<AgentKitContext> {
  if (!contextPromise) {
    contextPromise = initAgentKit();
  }
  return contextPromise;
}

