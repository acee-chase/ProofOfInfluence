// Storage implementation - includes Replit Auth required methods from blueprint:javascript_log_in_with_replit
import {
  users,
  profiles,
  links,
  transactions,
  poiTiers,
  poiFeeCredits,
  poiBurnIntents,
  poiFeeCreditLocks,
  type User,
  type UpsertUser,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Link,
  type InsertLink,
  type Transaction,
  type InsertTransaction,
  type PoiTier,
  type InsertPoiTier,
  type PoiFeeCredit,
  type InsertPoiFeeCredit,
  type PoiBurnIntent,
  type InsertPoiBurnIntent,
  type PoiFeeCreditLock,
  type InsertPoiFeeCreditLock,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;
  updateUserUsername(userId: string, username: string): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile>;
  incrementProfileViews(userId: string): Promise<void>;
  
  // Link operations
  getLinks(userId: string): Promise<Link[]>;
  getVisibleLinks(userId: string): Promise<Link[]>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(linkId: string, updates: Partial<InsertLink>): Promise<Link>;
  deleteLink(linkId: string): Promise<void>;
  incrementLinkClicks(linkId: string): Promise<void>;
  reorderLinks(userId: string, linkIds: string[]): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionBySessionId(sessionId: string): Promise<Transaction | undefined>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  
  // POI Tier operations
  getAllTiers(): Promise<PoiTier[]>;
  getUserTier(poiBalance: number): Promise<PoiTier | undefined>;
  
  // POI Fee Credit operations
  getFeeCredit(userId: string): Promise<PoiFeeCredit | undefined>;
  createFeeCredit(feeCredit: InsertPoiFeeCredit): Promise<PoiFeeCredit>;
  updateFeeCreditBalance(userId: string, amountCents: number): Promise<PoiFeeCredit>;
  
  // POI Burn Intent operations
  createBurnIntent(burnIntent: InsertPoiBurnIntent): Promise<PoiBurnIntent>;
  getBurnIntentByTxHash(txHash: string): Promise<PoiBurnIntent | undefined>;
  
  // POI Fee Credit Lock operations
  createFeeCreditLock(lock: InsertPoiFeeCreditLock): Promise<PoiFeeCreditLock>;
  getFeeCreditLock(orderId: string): Promise<PoiFeeCreditLock | undefined>;
  updateFeeCreditLockStatus(lockId: string, status: string): Promise<PoiFeeCreditLock>;
  releaseFeeCreditLock(orderId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        lastLoginAt: now,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: now,
          lastLoginAt: now,
        },
      })
      .returning();
    return user;
  }

  // User management
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletAddress, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserUsername(userId: string, username: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const [result] = await db
      .select({ profile: profiles })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(users.username, username));
    return result?.profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async incrementProfileViews(userId: string): Promise<void> {
    await db
      .update(profiles)
      .set({ totalViews: sql`${profiles.totalViews} + 1` })
      .where(eq(profiles.userId, userId));
  }

  // Link operations
  async getLinks(userId: string): Promise<Link[]> {
    return await db.select().from(links).where(eq(links.userId, userId)).orderBy(links.position);
  }

  async getVisibleLinks(userId: string): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(and(eq(links.userId, userId), eq(links.visible, true)))
      .orderBy(links.position);
  }

  async createLink(link: InsertLink): Promise<Link> {
    const [newLink] = await db.insert(links).values(link).returning();
    return newLink;
  }

  async updateLink(linkId: string, updates: Partial<InsertLink>): Promise<Link> {
    const [link] = await db
      .update(links)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(links.id, linkId))
      .returning();
    return link;
  }

  async deleteLink(linkId: string): Promise<void> {
    await db.delete(links).where(eq(links.id, linkId));
  }

  async incrementLinkClicks(linkId: string): Promise<void> {
    await db
      .update(links)
      .set({ clicks: sql`${links.clicks} + 1` })
      .where(eq(links.id, linkId));
  }

  async reorderLinks(userId: string, linkIds: string[]): Promise<void> {
    for (let i = 0; i < linkIds.length; i++) {
      await db
        .update(links)
        .set({ position: i, updatedAt: new Date() })
        .where(and(eq(links.id, linkIds[i]), eq(links.userId, userId)));
    }
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionBySessionId(sessionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.stripeSessionId, sessionId));
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // POI Tier operations
  async getAllTiers(): Promise<PoiTier[]> {
    return await db
      .select()
      .from(poiTiers)
      .orderBy(poiTiers.minPoi);
  }

  async getUserTier(poiBalance: number): Promise<PoiTier | undefined> {
    const tiers = await db
      .select()
      .from(poiTiers)
      .where(gte(sql`${poiBalance}`, poiTiers.minPoi))
      .orderBy(desc(poiTiers.minPoi))
      .limit(1);
    return tiers[0];
  }

  // POI Fee Credit operations
  async getFeeCredit(userId: string): Promise<PoiFeeCredit | undefined> {
    const [feeCredit] = await db
      .select()
      .from(poiFeeCredits)
      .where(eq(poiFeeCredits.userId, userId));
    return feeCredit;
  }

  async createFeeCredit(feeCredit: InsertPoiFeeCredit): Promise<PoiFeeCredit> {
    const [newFeeCredit] = await db
      .insert(poiFeeCredits)
      .values(feeCredit)
      .returning();
    return newFeeCredit;
  }

  async updateFeeCreditBalance(userId: string, amountCents: number): Promise<PoiFeeCredit> {
    // Check if user has fee credit record
    const existing = await this.getFeeCredit(userId);
    
    if (!existing) {
      // Create new record
      return await this.createFeeCredit({
        userId,
        balanceCents: amountCents,
      });
    }

    // Update existing record
    const [updated] = await db
      .update(poiFeeCredits)
      .set({
        balanceCents: sql`${poiFeeCredits.balanceCents} + ${amountCents}`,
        updatedAt: new Date(),
      })
      .where(eq(poiFeeCredits.userId, userId))
      .returning();
    return updated;
  }

  // POI Burn Intent operations
  async createBurnIntent(burnIntent: InsertPoiBurnIntent): Promise<PoiBurnIntent> {
    const [newBurnIntent] = await db
      .insert(poiBurnIntents)
      .values(burnIntent)
      .returning();
    return newBurnIntent;
  }

  async getBurnIntentByTxHash(txHash: string): Promise<PoiBurnIntent | undefined> {
    const [burnIntent] = await db
      .select()
      .from(poiBurnIntents)
      .where(eq(poiBurnIntents.burnTxHash, txHash));
    return burnIntent;
  }

  // POI Fee Credit Lock operations
  async createFeeCreditLock(lock: InsertPoiFeeCreditLock): Promise<PoiFeeCreditLock> {
    const [newLock] = await db
      .insert(poiFeeCreditLocks)
      .values(lock)
      .returning();
    return newLock;
  }

  async getFeeCreditLock(orderId: string): Promise<PoiFeeCreditLock | undefined> {
    const [lock] = await db
      .select()
      .from(poiFeeCreditLocks)
      .where(eq(poiFeeCreditLocks.orderId, orderId));
    return lock;
  }

  async updateFeeCreditLockStatus(lockId: string, status: string): Promise<PoiFeeCreditLock> {
    const [updated] = await db
      .update(poiFeeCreditLocks)
      .set({ status, updatedAt: new Date() })
      .where(eq(poiFeeCreditLocks.id, lockId))
      .returning();
    return updated;
  }

  async releaseFeeCreditLock(orderId: string): Promise<void> {
    await db
      .update(poiFeeCreditLocks)
      .set({ status: 'released', updatedAt: new Date() })
      .where(eq(poiFeeCreditLocks.orderId, orderId));
  }
}

export const storage = new DatabaseStorage();
