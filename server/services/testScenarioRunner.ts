import { testWalletService } from "./testWalletService";
import { immortalityAgentKitService } from "./immortalityAgentKitService";
import { storage } from "../storage";
import type { TestWallet } from "@shared/schema";

export type ScenarioName = "immortality-playable-agent" | "immortality-demo-seed";

export interface ScenarioParams {
  wallets?: number;
  userId?: string;
  walletId?: number;
  [key: string]: any;
}

export interface ScenarioResult {
  success: boolean;
  result?: any;
  txHashes?: string[];
  errors?: string[];
  steps?: Array<{ name: string; status: "success" | "failed"; message?: string }>;
}

export class TestScenarioRunner {
  /**
   * Main entry point for running test scenarios
   */
  async runScenario(scenarioName: ScenarioName, params: ScenarioParams): Promise<ScenarioResult> {
    try {
      switch (scenarioName) {
        case "immortality-playable-agent":
          return await this.runImmortalityPlayableAgent(params);
        case "immortality-demo-seed":
          return await this.runImmortalityDemoSeed(params);
        default:
          throw new Error(`Unknown scenario: ${scenarioName}`);
      }
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || String(error)],
      };
    }
  }

  /**
   * Complete E2E test scenario for Immortality playable agent
   */
  async runImmortalityPlayableAgent(params: ScenarioParams): Promise<ScenarioResult> {
    const steps: Array<{ name: string; status: "success" | "failed"; message?: string }> = [];
    const txHashes: string[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Allocate/Create test wallet and user
      let wallet: TestWallet;
      let userId: string;

      steps.push({ name: "Allocate test wallet", status: "success" });
      try {
        wallet = await testWalletService.allocateWallet("immortality-playable-agent", params.walletId);
        userId = params.userId || (await storage.findOrCreateUserByWallet(wallet.walletAddress)).id;
        steps[steps.length - 1].message = `Wallet: ${wallet.walletAddress}, User: ${userId}`;
      } catch (error: any) {
        steps[steps.length - 1].status = "failed";
        steps[steps.length - 1].message = error.message;
        throw error;
      }

      // Step 2: Initialize memories
      steps.push({ name: "Create test memories", status: "success" });
      try {
        const timestamp = Date.now();
        const memory1 = await immortalityAgentKitService.createMemory(
          userId,
          `测试记忆-${timestamp}-1：今天是一个重要的日子，我开始了我的赛博永生之旅。`,
          "excited"
        );
        const memory2 = await immortalityAgentKitService.createMemory(
          userId,
          `测试记忆-${timestamp}-2：我意识到记忆是连接过去与未来的桥梁。`,
          "contemplative"
        );
        steps[steps.length - 1].message = `Created ${memory1.id} and ${memory2.id}`;
      } catch (error: any) {
        steps[steps.length - 1].status = "failed";
        steps[steps.length - 1].message = error.message;
        errors.push(`Memory creation failed: ${error.message}`);
      }

      // Step 3: AI conversation test
      steps.push({ name: "Test AI conversation", status: "success" });
      try {
        const reply1 = await immortalityAgentKitService.generateChatReply(
          userId,
          `请回忆一下测试记忆-${Date.now()}相关的内容`
        );
        steps[steps.length - 1].message = `Reply generated: ${reply1.reply.substring(0, 50)}...`;
      } catch (error: any) {
        steps[steps.length - 1].status = "failed";
        steps[steps.length - 1].message = error.message;
        errors.push(`AI conversation failed: ${error.message}`);
      }

      // Step 4: Badge minting test
      steps.push({ name: "Mint badge", status: "success" });
      try {
        const txHash = await immortalityAgentKitService.mintBadgeForUser(wallet.walletAddress);
        txHashes.push(txHash);
        steps[steps.length - 1].message = `TxHash: ${txHash}`;
      } catch (error: any) {
        steps[steps.length - 1].status = "failed";
        steps[steps.length - 1].message = error.message;
        errors.push(`Badge minting failed: ${error.message}`);
      }

      // Step 5: Verify on-chain state
      steps.push({ name: "Verify badge ownership", status: "success" });
      try {
        const rpcUrl = process.env.BASE_RPC_URL || process.env.VITE_BASE_RPC_URL || "https://sepolia.base.org";
        const hasBadge = await immortalityAgentKitService.verifyBadgeOwnership(wallet.walletAddress, rpcUrl);
        steps[steps.length - 1].message = `Badge ownership verified: ${hasBadge}`;
        if (!hasBadge) {
          steps[steps.length - 1].status = "failed";
          errors.push("Badge ownership verification failed");
        }
      } catch (error: any) {
        steps[steps.length - 1].status = "failed";
        steps[steps.length - 1].message = error.message;
        errors.push(`Badge verification failed: ${error.message}`);
      }

      // Release wallet
      try {
        await testWalletService.releaseWallet(wallet.id);
      } catch (error) {
        console.warn("Failed to release wallet:", error);
      }

      return {
        success: errors.length === 0,
        result: {
          walletId: wallet.id,
          walletAddress: wallet.walletAddress,
          userId,
        },
        txHashes,
        errors: errors.length > 0 ? errors : undefined,
        steps,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || String(error), ...errors],
        steps,
      };
    }
  }

  /**
   * Batch generate demo users
   */
  async runImmortalityDemoSeed(params: ScenarioParams): Promise<ScenarioResult> {
    const wallets = params.wallets || 5;
    const results: Array<{ userId: string; walletAddress: string; label: string; username?: string }> = [];

    try {
      for (let i = 0; i < wallets; i++) {
        const label = `immortality-demo-${i + 1}`;
        const wallet = await testWalletService.generateTestWallet("immortality-demo-seed", label);
        const user = await storage.findOrCreateUserByWallet(wallet.walletAddress);

        // Optionally create initial memory
        try {
          await immortalityAgentKitService.createMemory(
            user.id,
            `这是 ${label} 的初始记忆。`,
            "neutral"
          );
        } catch (error) {
          console.warn(`Failed to create initial memory for ${label}:`, error);
        }

        results.push({
          userId: user.id,
          walletAddress: wallet.walletAddress,
          label,
          username: user.username || undefined,
        });
      }

      return {
        success: true,
        result: results,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [error.message || String(error)],
      };
    }
  }
}

export const testScenarioRunner = new TestScenarioRunner();
