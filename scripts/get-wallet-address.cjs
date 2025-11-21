/**
 * Get Wallet Address from Private Key
 * 
 * This script retrieves the wallet address from the private key configured
 * in environment variables. This replaces the CDP AgentKit address script.
 * 
 * Usage:
 *   npm run get:wallet-address
 * 
 * Environment variables (in order of preference):
 *   - AGENTKIT_PRIVATE_KEY
 *   - PRIVATE_KEY
 *   - DEPLOYER_PRIVATE_KEY
 */

require("dotenv").config({ override: true });

async function main() {
  try {
    const { ethers } = require("ethers");
    
    // Try multiple environment variables for flexibility
    const privateKey = 
      process.env.AGENTKIT_PRIVATE_KEY || 
      process.env.PRIVATE_KEY || 
      process.env.DEPLOYER_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error(
        "AGENTKIT_PRIVATE_KEY, PRIVATE_KEY, or DEPLOYER_PRIVATE_KEY must be configured.\n" +
        "This is required for backend wallet operations (minting badges, etc)."
      );
    }

    console.log("🔍 Retrieving Wallet Address from Private Key...\n");

    // Create wallet from private key (no provider needed just to get address)
    const wallet = new ethers.Wallet(privateKey);
    const walletAddress = wallet.address;
    
    console.log("✅ Wallet Address:");
    console.log(`   ${walletAddress}\n`);
    console.log("📋 This address should be granted MINTER_ROLE and other required roles on contracts.\n");
    console.log("💡 To use this wallet for AgentKit operations, ensure one of these is set:");
    console.log(`   AGENTKIT_PRIVATE_KEY=${privateKey.substring(0, 10)}...`);
    console.log(`   PRIVATE_KEY=${privateKey.substring(0, 10)}...`);
    console.log(`   DEPLOYER_PRIVATE_KEY=${privateKey.substring(0, 10)}...\n`);
    
    // Optional: Check balance if RPC is available
    const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || "https://sepolia.base.org";
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(walletAddress);
      console.log(`💰 Balance on ${rpcUrl}: ${ethers.utils.formatEther(balance)} ETH\n`);
    } catch (error) {
      console.log("⚠️  Could not fetch balance (RPC may be unavailable)\n");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n💡 Make sure you have set one of these environment variables:");
    console.error("   - AGENTKIT_PRIVATE_KEY");
    console.error("   - PRIVATE_KEY");
    console.error("   - DEPLOYER_PRIVATE_KEY\n");
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

