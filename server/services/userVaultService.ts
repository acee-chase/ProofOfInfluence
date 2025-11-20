import { db } from "../db";
import {
  userVaults,
  vaultWallets,
  type InsertUserVault,
  type InsertVaultWallet,
  type UserVault,
  type VaultWallet,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { ethers } from "ethers";

/**
 * UserVaultService - Manages user vaults and their associated wallets
 */
export class UserVaultService {
  /**
   * Get or create a demo vault for a demo user
   */
  async getOrCreateDemoVault(demoUserId: string): Promise<UserVault> {
    // Try to find existing vault
    const existing = await db
      .select()
      .from(userVaults)
      .where(and(eq(userVaults.type, "demo"), eq(userVaults.ownerUserId, demoUserId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new vault
    const [vault] = await db
      .insert(userVaults)
      .values({
        ownerUserId: demoUserId,
        type: "demo",
        label: `Demo Vault for ${demoUserId}`,
        status: "active",
      } as InsertUserVault)
      .returning();

    return vault;
  }

  /**
   * Get or create NFT wallet for a vault on a specific chain
   */
  async getNftWallet(
    vaultId: string,
    options: { chainId?: number; network?: string } = {}
  ): Promise<VaultWallet> {
    const chainId = options.chainId || 84532; // base-sepolia default
    const network = options.network || "base-sepolia";

    // Try to find existing wallet
    const existing = await db
      .select()
      .from(vaultWallets)
      .where(
        and(
          eq(vaultWallets.vaultId, vaultId),
          eq(vaultWallets.chainId, chainId),
          eq(vaultWallets.role, "nft")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address.toLowerCase();

    // Store wallet (in production, encrypt private key)
    // For now, we'll store it in metadata (NOT SECURE - should use encryption)
    const [vaultWallet] = await db
      .insert(vaultWallets)
      .values({
        vaultId,
        walletAddress,
        chainId,
        network,
        role: "nft",
        status: "idle",
        metadata: {
          // WARNING: In production, encrypt this!
          privateKey: wallet.privateKey,
        },
      } as InsertVaultWallet)
      .returning();

    return vaultWallet;
  }

  /**
   * Get vault by ID
   */
  async getVault(vaultId: string): Promise<UserVault | null> {
    const [vault] = await db.select().from(userVaults).where(eq(userVaults.id, vaultId)).limit(1);
    return vault || null;
  }

  /**
   * Get wallet by address
   */
  async getWalletByAddress(address: string): Promise<VaultWallet | null> {
    const [wallet] = await db
      .select()
      .from(vaultWallets)
      .where(eq(vaultWallets.walletAddress, address.toLowerCase()))
      .limit(1);
    return wallet || null;
  }
}

export const userVaultService = new UserVaultService();
