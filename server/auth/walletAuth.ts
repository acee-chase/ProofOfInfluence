// Wallet-based authentication module
// Provides wallet signature verification and session creation as an alternative to Replit Auth
import { ethers } from "ethers";
import type { Request } from "express";
import { getWalletNonce, consumeWalletNonce } from "./walletNonce";
import { storage } from "../storage";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "@shared/schema";

export interface WalletAuthUser {
  claims: {
    sub: string; // userId
    wallet_address: string;
    auth_type: "wallet";
  };
  expires_at: number; // Unix timestamp in seconds
}

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 1 week

/**
 * Verify wallet signature against nonce
 */
export function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  nonce: string
): boolean {
  try {
    const message = `Sign this nonce to prove ownership: ${nonce}`;
    const recovered = ethers.utils.verifyMessage(message, signature);
    return recovered.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error("[WalletAuth] Signature verification failed:", error);
    return false;
  }
}

/**
 * Get or create user by wallet address
 */
export async function getOrCreateWalletUser(
  walletAddress: string
): Promise<{ id: string; walletAddress: string | null }> {
  const normalized = walletAddress.toLowerCase();

  // Try to find existing user by wallet
  let user = await storage.getUserByWallet(normalized);

  if (user) {
    // Update last login time
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
    return { id: user.id, walletAddress: user.walletAddress || null };
  }

  // Create new user with wallet address
  // Generate a unique ID for wallet-only users
  const userId = `wallet_${normalized.slice(2, 10)}_${Date.now()}`;

  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      walletAddress: normalized,
      role: "user",
      lastLoginAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.walletAddress,
      set: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();

  return { id: newUser.id, walletAddress: newUser.walletAddress || null };
}

/**
 * Authenticate wallet and create session user object
 */
export async function authenticateWallet(
  walletAddress: string,
  signature: string
): Promise<WalletAuthUser | null> {
  const normalized = walletAddress.toLowerCase();

  // Get and verify nonce
  const nonce = getWalletNonce(normalized);
  if (!nonce) {
    console.error("[WalletAuth] Nonce not found or expired");
    return null;
  }

  // Verify signature
  if (!verifyWalletSignature(normalized, signature, nonce)) {
    console.error("[WalletAuth] Signature verification failed");
    return null;
  }

  // Consume nonce to prevent replay attacks
  if (!consumeWalletNonce(normalized, nonce)) {
    console.error("[WalletAuth] Nonce already used");
    return null;
  }

  // Get or create user
  const user = await getOrCreateWalletUser(normalized);

  // Create session user object
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;

  return {
    claims: {
      sub: user.id,
      wallet_address: normalized,
      auth_type: "wallet",
    },
    expires_at: expiresAt,
  };
}

/**
 * Check if request has valid wallet authentication session
 */
export function getWalletAuthUser(req: Request): WalletAuthUser | null {
  const user = req.user as any;

  // Check if user is authenticated via wallet
  if (!user || user.claims?.auth_type !== "wallet") {
    return null;
  }

  // Check if session is expired
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now > user.expires_at) {
    return null;
  }

  return user as WalletAuthUser;
}

