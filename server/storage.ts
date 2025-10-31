// Storage implementation - includes Replit Auth required methods from blueprint:javascript_log_in_with_replit
import {
  users,
  profiles,
  links,
  payments,
  subscriptions,
  type User,
  type UpsertUser,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type Link,
  type InsertLink,
  type Payment,
  type InsertPayment,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;
  
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
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(paymentId: string, updates: Partial<InsertPayment>): Promise<Payment>;
  getPayments(userId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(subscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription>;
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
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
      .set({ totalViews: db.raw(`total_views + 1`) })
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
      .set({ clicks: db.raw(`clicks + 1`) })
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

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(paymentId: string, updates: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payments.id, paymentId))
      .returning();
    return payment;
  }

  async getPayments(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  // Subscription operations
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db.insert(subscriptions).values(subscription).returning();
    return newSub;
  }

  async updateSubscription(subscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    return subscription;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }
}

export const storage = new DatabaseStorage();
