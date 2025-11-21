import { ethers } from "ethers";
import { storage } from "../storage";

/**
 * Test Wallet Service - Manages test wallets for E2E scenarios
 * 
 * TODO: Migrate to UserVault/VaultWallets when schema is ready
 * For now, uses a simple in-memory pool with environment variable fallback
 */
class TestWalletService {
  private walletPool: Map<string, { id: string; walletAddress: string; status: string }> = new Map();

  /**
   * Allocate a test wallet for a scenario
   * Uses environment variable TEST_WALLET_PRIVATE_KEY if available, otherwise generates a new one
   */
  async allocateWallet(scenarioLabel: string): Promise<{ id: string; walletAddress: string }> {
    // Check if we have a test wallet in environment
    const testWalletPrivateKey = process.env.TEST_WALLET_PRIVATE_KEY;
    
    let wallet: ethers.Wallet;
    if (testWalletPrivateKey) {
      // Use configured test wallet
      wallet = new ethers.Wallet(testWalletPrivateKey);
    } else {
      // Generate a new wallet for testing (not funded, for demo purposes)
      wallet = ethers.Wallet.createRandom();
    }

    const walletAddress = wallet.address.toLowerCase();
    const id = `test-wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store in memory pool
    this.walletPool.set(id, {
      id,
      walletAddress,
      status: "in_use",
    });

    console.log(`[TestWalletService] Allocated wallet ${walletAddress} for scenario ${scenarioLabel}`);
    
    return { id, walletAddress };
  }

  /**
   * Release a test wallet back to the pool
   */
  async releaseWallet(walletId: string): Promise<void> {
    const wallet = this.walletPool.get(walletId);
    if (wallet) {
      wallet.status = "idle";
      console.log(`[TestWalletService] Released wallet ${wallet.walletAddress}`);
    }
  }

  /**
   * Generate a new test wallet (for demo seeding)
   */
  async generateTestWallet(
    scenarioLabel: string,
    label: string
  ): Promise<{ testWallet: { id: string; walletAddress: string } }> {
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address.toLowerCase();
    const id = `test-wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.walletPool.set(id, {
      id,
      walletAddress,
      status: "idle",
    });

    console.log(`[TestWalletService] Generated wallet ${walletAddress} for ${label}`);
    
    return {
      testWallet: { id, walletAddress },
    };
  }
}

export const testWalletService = new TestWalletService();
