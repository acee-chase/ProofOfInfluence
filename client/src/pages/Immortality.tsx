import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedBadge } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Brain, Zap, Coins, Activity, ArrowRight, Shield } from "lucide-react";

interface ImmortalityBalanceResponse {
  credits: number;
  poiCredits: number;
}

const mockHistory = [
  {
    id: "mint_2031",
    title: "意识上链 #3",
    date: "2025-11-16",
    credits: 50,
    status: "completed",
    txHash: "0x1234...beef",
  },
  {
    id: "mint_2030",
    title: "意识上链 #2",
    date: "2025-11-10",
    credits: 50,
    status: "queued",
    txHash: null,
  },
];

export default function Immortality() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const { data: balance, isFetching } = useQuery<ImmortalityBalanceResponse>({
    queryKey: ["/api/immortality/balance"],
    enabled: isAuthenticated,
  });

  const credits = balance?.credits ?? 0;
  const poiCredits = balance?.poiCredits ?? 0;

  const heroTitle =
    theme === "cyberpunk"
      ? "Immortality Control Room"
      : "Immortality Playground";

  const heroSubtitle =
    theme === "cyberpunk"
      ? "掌控 AI Agent、法币 Credits 与链上身份，一切尽在同一面板。"
      : "充值 Credits、升级你的 AI Agent、随时把记忆和社交证明上链。";

  const consciousnessCTA = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
        <Brain className="w-4 h-4" />
        Consciousness Upload
      </div>
      <p className="text-sm opacity-80">
        将你的社交链接、互动记忆和 Agent 状态写入链上存证。操作会扣除 50 Credits，并生成可分享的
        Immortality 证书。
      </p>
      <div className="text-xs opacity-60">
        下一步：完成 Ledger 打通后，即可调用链上存证合约。
      </div>
      <div className="flex flex-wrap gap-2">
        <ThemedBadge>社交凭据</ThemedBadge>
        <ThemedBadge>AI 互动日志</ThemedBadge>
        <ThemedBadge>链上签名</ThemedBadge>
      </div>
      <div className="flex gap-3 flex-wrap">
        <ThemedButton emphasis disabled>
          意识上链（即将开放）
        </ThemedButton>
        <ThemedButton variant="outline" asChild>
          <Link href="/recharge">充值 Credits</Link>
        </ThemedButton>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <Section className="pt-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <ThemedCard className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70">
                  {theme === "cyberpunk" ? "Layer 3 • Immortality Plan" : "Layer 3 · Immortality"}
                </p>
                <h1
                  className={cn(
                    "text-3xl font-bold",
                    theme === "cyberpunk" ? "font-orbitron text-cyan-100" : "font-fredoka text-slate-900",
                  )}
                >
                  {heroTitle}
                </h1>
              </div>
              <button
                type="button"
                className={cn(
                  "px-3 py-1 rounded-full text-xs flex items-center gap-1",
                  theme === "cyberpunk" ? "bg-cyan-400/15 text-cyan-200" : "bg-blue-100 text-blue-600",
                )}
              >
                <Activity className="w-3 h-3" />
                Agent {user?.username ?? "Guest"}{" "}
              </button>
            </div>
            <p className="text-sm opacity-80">{heroSubtitle}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase opacity-70">Immortality Credits</p>
                <p className="text-2xl font-bold">{credits.toLocaleString()}</p>
                {isFetching && <p className="text-xs opacity-50">刷新中…</p>}
              </div>
              <div>
                <p className="text-xs uppercase opacity-70">POI Credits</p>
                <p className="text-2xl font-bold">{poiCredits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase opacity-70">AI Agent Status</p>
                <p className="text-sm font-semibold text-green-400">Online · Mining</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ThemedButton emphasis asChild>
                <Link href="/recharge">
                  充值 Credits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </ThemedButton>
              <ThemedButton variant="outline" asChild>
                <Link href="/market">链上购买 POI</Link>
              </ThemedButton>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6 space-y-4">{consciousnessCTA}</ThemedCard>
        </div>
      </Section>

      <Section title="账本与上链记录" subtitle="Ledger、Credits、以及每一次意识上链的足迹">
        <div className="grid gap-6 lg:grid-cols-3">
          <ThemedCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span className="font-semibold text-sm">中心化账本</span>
            </div>
            <p className="text-sm opacity-80">
              Stripe 充值成功后会立即写入 `fiat_transactions`、`user_balances` 与 `immortality_ledger`。
              所有 Credits 增减都可追溯。
            </p>
            <Link href="/recharge">
              <a className="text-xs font-semibold text-primary hover:underline">查看账本指南 →</a>
            </Link>
          </ThemedCard>

          <ThemedCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-semibold text-sm">合规安全</span>
            </div>
            <p className="text-sm opacity-80">
              我们在 Layer 2 记录 Credits，待取得牌照后再映射到链上。这让法币 inflow 更安全、更可控。
            </p>
            <span className="text-xs opacity-60">MSB / MTL 准备中</span>
          </ThemedCard>

          <ThemedCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="font-semibold text-sm">Layer 1 入口</span>
            </div>
            <p className="text-sm opacity-80">
              如果你已有 Base 网络的钱包，可以直接使用 TGESale 合约购买 POI。Credits 与 POI 会共享同一经济体系。
            </p>
            <ThemedButton asChild size="sm" className="mt-2">
              <Link href="/market">前往 TGESale</Link>
            </ThemedButton>
          </ThemedCard>
        </div>
      </Section>

      <Section title="意识上链历史" subtitle="最近的 Consciousness Upload 记录">
        <ThemedCard className="p-6 space-y-4">
          {!mockHistory.length && (
            <div className="flex items-center gap-2 text-sm opacity-70">
              <AlertCircle className="w-4 h-4" />
              还没有历史记录。完成第一笔上链后，这里会显示详细信息。
            </div>
          )}
          {mockHistory.length > 0 && (
            <div className="space-y-4">
              {mockHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "p-4 rounded-lg border flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
                    theme === "cyberpunk"
                      ? "border-cyan-400/20 bg-cyan-400/5"
                      : "border-slate-200 bg-white",
                  )}
                >
                  <div>
                    <div className="font-semibold">{entry.title}</div>
                    <div className="text-xs opacity-60">{entry.date}</div>
                  </div>
                  <div className="text-sm font-semibold">消耗 {entry.credits} Credits</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        entry.status === "completed"
                          ? "bg-green-500/10 text-green-400"
                          : entry.status === "queued"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400",
                      )}
                    >
                      {entry.status === "completed" ? "已上链" : "排队中"}
                    </span>
                    {entry.txHash ? (
                      <a
                        href={`https://basescan.org/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {entry.txHash}
                      </a>
                    ) : (
                      <span className="text-xs opacity-60">等待上链</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}


