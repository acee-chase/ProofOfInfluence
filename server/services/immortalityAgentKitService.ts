import { storage } from "../storage";
import { generateImmortalityReply } from "../chatbot/generateReply";
import { mintTestBadge } from "../agentkit/badge";
import { ethers } from "ethers";
import badgeConfig from "@shared/contracts/immortality_badge.json";

const BADGE_ID = 1;

export class ImmortalityAgentKitService {
  /**
   * Creates a memory for a user
   */
  async createMemory(userId: string, text: string, emotion?: string | null): Promise<any> {
    return await storage.createUserMemory({
      userId,
      text,
      emotion: emotion ?? null,
      tags: null,
      mediaUrl: null,
    });
  }

  /**
   * Generates an AI chat reply for a user
   */
  async generateChatReply(userId: string, message: string): Promise<{ reply: string; suggestedActions: any[] }> {
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const [profile, memories] = await Promise.all([
      storage.getUserPersonalityProfile(userId),
      storage.listUserMemories({ userId, limit: 10 }),
    ]);

    return await generateImmortalityReply({
      message,
      profile,
      memories,
      apiKey: openAiKey,
      modelName: process.env.OPENAI_MODEL,
    });
  }

  /**
   * Mints a badge for a user's wallet address
   */
  async mintBadgeForUser(walletAddress: string): Promise<string> {
    if (!badgeConfig.address) {
      throw new Error("Immortality badge contract address is not configured");
    }

    const txHash = await mintTestBadge(walletAddress);
    return txHash;
  }

  /**
   * Verifies badge ownership on-chain
   */
  async verifyBadgeOwnership(walletAddress: string, rpcUrl?: string): Promise<boolean> {
    if (!badgeConfig.address) {
      throw new Error("Immortality badge contract address is not configured");
    }

    const provider = rpcUrl
      ? new ethers.providers.JsonRpcProvider(rpcUrl)
      : new ethers.providers.JsonRpcProvider(
          process.env.BASE_RPC_URL || process.env.VITE_BASE_RPC_URL || "https://sepolia.base.org"
        );

    const contract = new ethers.Contract(
      badgeConfig.address as string,
      badgeConfig.abi as any,
      provider
    );

    try {
      // Check if user has the badge (assuming hasBadge(address, uint256) method exists)
      const hasBadge = await contract.hasBadge(walletAddress.toLowerCase(), BADGE_ID);
      return hasBadge;
    } catch (error: any) {
      // If hasBadge doesn't exist, try balanceOf approach
      try {
        const balance = await contract.balanceOf(walletAddress.toLowerCase());
        return balance.gt(0);
      } catch (e) {
        console.error("Error verifying badge ownership:", error);
        return false;
      }
    }
  }
}

export const immortalityAgentKitService = new ImmortalityAgentKitService();
