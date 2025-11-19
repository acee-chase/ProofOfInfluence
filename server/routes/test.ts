import { type Express } from "express";
import { isAuthenticated } from "../auth";
import { TestWalletService } from "../services/testWalletService";
import { TestScenarioRunner, type ScenarioName } from "../services/testScenarioRunner";
import { getImmortalityAgentKitService } from "../services/agentkit";
import { storage } from "../storage";
import { db } from "../db";
import { testWallets, users } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerTestRoutes(app: Express) {
  // 运行测试场景
  app.post("/api/test/run-scenario", isAuthenticated, async (req: any, res) => {
    try {
      const { scenario, label, walletCount, params } = req.body as {
        scenario?: ScenarioName;
        label?: string;
        walletCount?: number;
        params?: Record<string, any>;
      };

      if (!scenario) {
        return res.status(400).json({ ok: false, error: "scenario is required" });
      }

      const desiredWalletCount = typeof walletCount === "number" && walletCount > 0 ? walletCount : 1;
      const resolvedLabel = label || `test:${scenario}`;

      const agentKit = getImmortalityAgentKitService();
      const walletService = new TestWalletService(agentKit);
      const runner = new TestScenarioRunner(agentKit);

      let wallets = await walletService.listTestWallets(resolvedLabel, desiredWalletCount);

      const missing = desiredWalletCount - wallets.length;
      if (missing > 0) {
        const newWallets = await walletService.createManyTestWallets(resolvedLabel, missing);
        wallets = wallets.concat(newWallets);
      }

      if (wallets.length > desiredWalletCount) {
        wallets = wallets.slice(0, desiredWalletCount);
      }

      const result = await runner.runScenario(scenario, wallets, params || {});

      res.json({
        ok: true,
        scenario,
        label: resolvedLabel,
        walletCount: wallets.length,
        results: result.results,
      });
    } catch (error: any) {
      console.error("[TestRunner] run-scenario failed", error);
      res.status(500).json({ ok: false, error: error?.message || "Unknown error" });
    }
  });

  // 获取 demo 用户列表（基于 testWallets）
  app.get("/api/test/demo-users", isAuthenticated, async (req: any, res) => {
    try {
      const label = (req.query.label as string) || "immortality-demo-seed";
      const limit = parseInt(req.query.limit as string) || 50;

      // 查询 testWallets（如果表存在）
      let wallets: any[] = [];
      try {
        wallets = await db
          .select()
          .from(testWallets)
          .where(eq(testWallets.label, label))
          .orderBy(desc(testWallets.createdAt))
          .limit(limit);
      } catch (err: any) {
        // 如果 testWallets 表不存在，返回空数组
        console.warn("[TestRunner] testWallets table not found, returning empty list:", err.message);
        return res.json([]);
      }

      // 尝试查找对应的用户记录（通过 walletAddress）
      const demoUsers = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const [user] = await db
              .select({
                id: users.id,
                email: users.email,
                username: users.username,
                walletAddress: users.walletAddress,
              })
              .from(users)
              .where(eq(users.walletAddress, wallet.address.toLowerCase()))
              .limit(1);

            return {
              walletId: wallet.id,
              address: wallet.address,
              label: wallet.label,
              createdAt: wallet.createdAt.toISOString(),
              userId: user?.id || null,
              email: user?.email || null,
              username: user?.username || null,
            };
          } catch (err) {
            return {
              walletId: wallet.id,
              address: wallet.address,
              label: wallet.label,
              createdAt: wallet.createdAt.toISOString(),
              userId: null,
              email: null,
              username: null,
            };
          }
        }),
      );

      res.json(demoUsers);
    } catch (error: any) {
      console.error("[TestRunner] demo-users failed", error);
      res.status(500).json({ message: error?.message || "Unknown error" });
    }
  });
}
