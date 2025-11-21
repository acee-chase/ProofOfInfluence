/**
 * AgentKit Client - Now uses ethers.js wallet instead of CDP AgentKit
 * 
 * This replacement solves the issue where CDP AgentKit creates a new wallet
 * on each initialization. We now use a fixed private key to ensure consistent
 * wallet address across all initializations.
 * 
 * Migration: Replaced CDP AgentKit with ethers.js wallet client
 * - Uses AGENTKIT_PRIVATE_KEY, PRIVATE_KEY, or DEPLOYER_PRIVATE_KEY
 * - Maintains same interface for backward compatibility
 */

import { getAgentKitWalletProvider, type AgentKitWalletProvider } from "./walletClient";

type AgentKitContext = {
  walletProvider: AgentKitWalletProvider;
  // Legacy agentkit field - kept for compatibility but not used
  agentkit?: any;
};

let contextPromise: Promise<AgentKitContext> | null = null;

/**
 * Initialize AgentKit context using ethers.js wallet
 * This replaces the CDP AgentKit implementation
 */
async function initAgentKit(): Promise<AgentKitContext> {
  console.log("[AgentKit] Using ethers.js wallet client (replaced CDP AgentKit)");
  
  const walletProvider = await getAgentKitWalletProvider();
  
  return {
    walletProvider,
    // agentkit field kept for backward compatibility but not used
    agentkit: undefined,
  };
}

/**
 * Get AgentKit context (now using ethers.js wallet)
 * Maintains same interface for backward compatibility
 */
export async function getAgentKitContext(): Promise<AgentKitContext> {
  if (!contextPromise) {
    contextPromise = initAgentKit();
  }
  return contextPromise;
}

