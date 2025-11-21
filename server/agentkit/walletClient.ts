import { ethers } from "ethers";
import { getRpcUrl } from "../utils/rpcProvider";

/**
 * Wallet Client - Ethers.js based replacement for AgentKit CDP Wallet
 * 
 * Uses a fixed private key to ensure consistent wallet address across initializations.
 * This solves the issue where CDP AgentKit creates a new wallet on each initialization.
 */

type WalletClient = {
  wallet: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
  address: string;
};

let walletClientPromise: Promise<WalletClient> | null = null;

/**
 * Initialize wallet client from private key
 * Uses AGENTKIT_PRIVATE_KEY, PRIVATE_KEY, or DEPLOYER_PRIVATE_KEY (in order of preference)
 */
async function initWalletClient(): Promise<WalletClient> {
  // Try multiple environment variables for flexibility
  const privateKey = 
    process.env.AGENTKIT_PRIVATE_KEY || 
    process.env.PRIVATE_KEY || 
    process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error(
      "AGENTKIT_PRIVATE_KEY, PRIVATE_KEY, or DEPLOYER_PRIVATE_KEY must be set. " +
      "This is required for backend wallet operations (minting badges, etc)."
    );
  }

  const rpcUrl = getRpcUrl();
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const address = await wallet.getAddress();

  console.log(`[WalletClient] Initialized with wallet address: ${address}`);
  console.log(`[WalletClient] Network: ${process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia"}`);
  console.log(`[WalletClient] RPC: ${rpcUrl}`);

  // Verify wallet has balance (optional check)
  try {
    const balance = await provider.getBalance(address);
    console.log(`[WalletClient] Balance: ${ethers.utils.formatEther(balance)} ETH`);
  } catch (error) {
    console.warn(`[WalletClient] Could not fetch balance:`, error);
  }

  return { wallet, provider, address };
}

/**
 * Get or create wallet client (singleton pattern)
 */
export async function getWalletClient(): Promise<WalletClient> {
  if (!walletClientPromise) {
    walletClientPromise = initWalletClient();
  }
  return walletClientPromise;
}

/**
 * AgentKit-compatible interface adapter
 * This allows existing code to work without changes
 */
export type AgentKitWalletProvider = {
  getAddress: () => Promise<string>;
  sendTransaction: (tx: { to: string; data: string; value: bigint }) => Promise<`0x${string}`>;
  waitForTransactionReceipt: (txHash: `0x${string}`) => Promise<any>;
  request: (request: { method: string; params: any[] }) => Promise<any>;
};

/**
 * Get AgentKit-compatible wallet provider
 * This maintains compatibility with existing AgentKit code
 */
export async function getAgentKitWalletProvider(): Promise<AgentKitWalletProvider> {
  const { wallet, provider, address } = await getWalletClient();
  
  return {
    getAddress: async () => address,
    
    sendTransaction: async (tx: { to: string; data: string; value: bigint }) => {
      console.log(`[WalletClient] Sending transaction to ${tx.to}`);
      const txResponse = await wallet.sendTransaction({
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      console.log(`[WalletClient] Transaction sent: ${txResponse.hash}`);
      return txResponse.hash as `0x${string}`;
    },
    
    waitForTransactionReceipt: async (txHash: `0x${string}`) => {
      console.log(`[WalletClient] Waiting for transaction receipt: ${txHash}`);
      const receipt = await provider.waitForTransaction(txHash);
      console.log(`[WalletClient] Transaction confirmed in block ${receipt.blockNumber}`);
      return receipt as any;
    },
    
    request: async (request: { method: string; params: any[] }) => {
      if (request.method === "eth_call") {
        const [callData, blockTag] = request.params;
        const result = await provider.call(callData, blockTag);
        return result;
      }
      throw new Error(`Method ${request.method} not supported by WalletClient`);
    },
  };
}

