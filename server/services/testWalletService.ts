import { Wallet } from "ethers";
import { storage } from "../storage";
import type { InsertTestWallet, TestWallet } from "@shared/schema";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.TEST_WALLET_ENCRYPTION_KEY || "default-key-change-in-production";
const ALGORITHM = "aes-256-cbc";

/**
 * Encrypts a private key using AES-256-CBC
 */
function encryptPrivateKeyValue(privateKey: string): string {
  // Derive a 32-byte key from the encryption key
  const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts an encrypted private key
 */
function decryptPrivateKeyValue(encryptedKey: string): string {
  const parts = encryptedKey.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted key format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  // Derive the same 32-byte key from the encryption key
  const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export class TestWalletService {
  /**
   * Generates a new test wallet
   */
  async generateTestWallet(
    scenario: string,
    label?: string,
    chainId: number = 84532, // Base Sepolia default
    network: string = "base-sepolia"
  ): Promise<TestWallet> {
    const wallet = Wallet.createRandom();
    const encryptedKey = encryptPrivateKeyValue(wallet.privateKey);

    const data: InsertTestWallet = {
      walletAddress: wallet.address.toLowerCase(),
      privateKey: encryptedKey,
      chainId,
      network,
      label: label || `test-${scenario}-${Date.now()}`,
      scenario,
      status: "idle",
      metadata: null,
    };

    return await storage.createTestWallet(data);
  }

  /**
   * Encrypts a private key (public method for external use)
   */
  encryptPrivateKey(privateKey: string): string {
    return encryptPrivateKeyValue(privateKey);
  }

  /**
   * Decrypts an encrypted private key (public method for external use)
   */
  decryptPrivateKey(encryptedKey: string): string {
    return decryptPrivateKeyValue(encryptedKey);
  }

  /**
   * Allocates an available wallet for use (marks as in_use)
   */
  async allocateWallet(scenario: string, walletId?: number): Promise<TestWallet> {
    let wallet: TestWallet | undefined;

    if (walletId) {
      wallet = await storage.getTestWallet(walletId);
      if (!wallet || wallet.scenario !== scenario) {
        throw new Error(`Wallet ${walletId} not found or scenario mismatch`);
      }
    } else {
      const available = await storage.getAvailableTestWallets(scenario);
      if (available.length === 0) {
        // Generate a new wallet if none available
        return await this.generateTestWallet(scenario);
      }
      wallet = available[0];
    }

    if (wallet.status !== "idle") {
      throw new Error(`Wallet ${wallet.id} is not available (status: ${wallet.status})`);
    }

    return await storage.updateTestWalletStatus(wallet.id, "in_use");
  }

  /**
   * Releases a wallet (marks as idle)
   */
  async releaseWallet(walletId: number): Promise<TestWallet> {
    const wallet = await storage.getTestWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    return await storage.updateTestWalletStatus(walletId, "idle");
  }

  /**
   * Gets a wallet signer for chain operations
   */
  async getWalletSigner(walletId: number, rpcUrl?: string): Promise<Wallet> {
    const wallet = await storage.getTestWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    const privateKey = decryptPrivateKeyValue(wallet.privateKey);
    const provider = rpcUrl
      ? new (await import("ethers")).providers.JsonRpcProvider(rpcUrl)
      : undefined;

    return new Wallet(privateKey, provider);
  }
}

export const testWalletService = new TestWalletService();
