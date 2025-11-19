import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle, Code } from "lucide-react";
import { isDevEnvironment } from "@/lib/env";

type ScenarioName = "immortality-playable-agent" | "immortality-demo-seed" | "tge-purchase" | "swap-eth-usdc" | "chat-immortality";

interface ScenarioOption {
  value: ScenarioName;
  label: string;
  description: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    value: "immortality-playable-agent",
    label: "Immortality Playable Agent",
    description: "触发 immortality-playable-agent 单次回归测试",
  },
  {
    value: "immortality-demo-seed",
    label: "Immortality Demo Seed",
    description: "批量生成 demo 用户（immortality-demo-seed）",
  },
  {
    value: "tge-purchase",
    label: "TGE Purchase",
    description: "测试 TGE 购买场景",
  },
  {
    value: "swap-eth-usdc",
    label: "Swap ETH/USDC",
    description: "测试 ETH/USDC 交换场景",
  },
  {
    value: "chat-immortality",
    label: "Chat Immortality",
    description: "测试 Immortality 聊天场景",
  },
];

interface RunScenarioResponse {
  ok: boolean;
  scenario?: string;
  label?: string;
  walletCount?: number;
  results?: Array<{
    walletId?: string;
    address?: string;
    ok: boolean;
    result?: any;
    error?: string;
  }>;
  error?: string;
}

export default function TestScenariosPage() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioName | "">("");
  const [walletCount, setWalletCount] = useState<string>("1");
  const [customParams, setCustomParams] = useState<string>("{}");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunScenarioResponse | null>(null);

  // 仅在 dev/staging 环境显示
  if (!isDevEnvironment()) {
    return (
      <PageLayout>
        <Section>
          <ThemedCard className="p-6">
            <p className="text-sm opacity-70">此页面仅在开发/测试环境可用。</p>
          </ThemedCard>
        </Section>
      </PageLayout>
    );
  }

  // 需要登录
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Section>
          <ThemedCard className="p-6">
            <p className="text-sm opacity-70">请先登录以访问此页面。</p>
          </ThemedCard>
        </Section>
      </PageLayout>
    );
  }

  const handleRunScenario = async () => {
    if (!selectedScenario) {
      toast({
        title: "请选择场景",
        description: "请先选择一个测试场景",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      let params: Record<string, any> = {};
      try {
        params = JSON.parse(customParams || "{}");
      } catch (e) {
        toast({
          title: "参数格式错误",
          description: "自定义参数必须是有效的 JSON 格式",
          variant: "destructive",
        });
        setIsRunning(false);
        return;
      }

      const walletCountNum = parseInt(walletCount, 10);
      if (isNaN(walletCountNum) || walletCountNum < 1) {
        toast({
          title: "钱包数量无效",
          description: "钱包数量必须是大于 0 的数字",
          variant: "destructive",
        });
        setIsRunning(false);
        return;
      }

      const response = await fetch("/api/test/run-scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          walletCount: walletCountNum,
          label: `test:${selectedScenario}`,
          params,
        }),
      });

      const data: RunScenarioResponse = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "运行场景失败");
      }

      setResult(data);
      toast({
        title: "场景运行成功",
        description: `已使用 ${data.walletCount || 0} 个钱包运行场景`,
      });
    } catch (error: any) {
      console.error("[TestScenarios] Run scenario failed", error);
      toast({
        title: "运行失败",
        description: error?.message || "未知错误",
        variant: "destructive",
      });
      setResult({
        ok: false,
        error: error?.message || "未知错误",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PageLayout>
      <Section className="pt-12">
        <div className="mb-6">
          <h1
            className={cn(
              "text-3xl font-bold mb-2",
              theme === "cyberpunk" ? "font-orbitron text-cyan-100" : "font-fredoka text-slate-900",
            )}
          >
            Test Scenarios 控制台
          </h1>
          <p className="text-sm opacity-70">
            内部工具：用于触发自动化测试场景，生成 demo 用户，以及回归测试
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：配置面板 */}
          <ThemedCard className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">选择场景</label>
              <select
                className={cn(
                  "w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
                  theme === "cyberpunk"
                    ? "border-cyan-500/40 focus:ring-cyan-400/40"
                    : "border-slate-200 focus:ring-blue-200",
                )}
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as ScenarioName)}
                disabled={isRunning}
              >
                <option value="">-- 选择场景 --</option>
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.value} value={scenario.value}>
                    {scenario.label}
                  </option>
                ))}
              </select>
              {selectedScenario && (
                <p className="mt-2 text-xs opacity-60">
                  {SCENARIOS.find((s) => s.value === selectedScenario)?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">钱包数量</label>
              <input
                type="number"
                min="1"
                className={cn(
                  "w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
                  theme === "cyberpunk"
                    ? "border-cyan-500/40 focus:ring-cyan-400/40"
                    : "border-slate-200 focus:ring-blue-200",
                )}
                value={walletCount}
                onChange={(e) => setWalletCount(e.target.value)}
                placeholder="1"
                disabled={isRunning}
              />
              <p className="mt-1 text-xs opacity-60">默认值：1（immortality-demo-seed 建议使用 5）</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">自定义参数（JSON）</label>
              <textarea
                className={cn(
                  "w-full rounded-xl border bg-transparent p-3 text-sm font-mono outline-none focus:ring-2",
                  theme === "cyberpunk"
                    ? "border-cyan-500/40 focus:ring-cyan-400/40"
                    : "border-slate-200 focus:ring-blue-200",
                )}
                rows={4}
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                placeholder='{"usdcAmount": "1000000", "delayMs": 100}'
                disabled={isRunning}
              />
              <p className="mt-1 text-xs opacity-60">
                可选：场景特定的参数，例如 tge-purchase 需要 usdcAmount
              </p>
            </div>

            <ThemedButton
              emphasis
              className="w-full"
              onClick={handleRunScenario}
              disabled={isRunning || !selectedScenario}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  运行场景
                </>
              )}
            </ThemedButton>
          </ThemedCard>

          {/* 右侧：结果展示 */}
          <ThemedCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">运行结果</h2>
              {result && (
                <div className="flex items-center gap-2">
                  {result.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={cn("text-sm", result.ok ? "text-green-400" : "text-red-400")}>
                    {result.ok ? "成功" : "失败"}
                  </span>
                </div>
              )}
            </div>

            {!result && !isRunning && (
              <p className="text-sm opacity-60">运行场景后，结果将显示在这里</p>
            )}

            {isRunning && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin opacity-60" />
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.scenario && (
                  <div>
                    <p className="text-xs opacity-60 mb-1">场景</p>
                    <p className="text-sm font-mono">{result.scenario}</p>
                  </div>
                )}

                {result.label && (
                  <div>
                    <p className="text-xs opacity-60 mb-1">标签</p>
                    <p className="text-sm font-mono">{result.label}</p>
                  </div>
                )}

                {result.walletCount !== undefined && (
                  <div>
                    <p className="text-xs opacity-60 mb-1">钱包数量</p>
                    <p className="text-sm">{result.walletCount}</p>
                  </div>
                )}

                {result.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-semibold mb-1">错误</p>
                    <p className="text-sm text-red-300">{result.error}</p>
                  </div>
                )}

                {result.results && result.results.length > 0 && (
                  <div>
                    <p className="text-xs opacity-60 mb-2">详细结果</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {result.results.map((item, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-lg border text-sm",
                            item.ok
                              ? theme === "cyberpunk"
                                ? "border-green-500/20 bg-green-500/5"
                                : "border-green-200 bg-green-50"
                              : theme === "cyberpunk"
                              ? "border-red-500/20 bg-red-500/5"
                              : "border-red-200 bg-red-50",
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs opacity-60">
                              {item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : `Wallet ${idx + 1}`}
                            </span>
                            {item.ok ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          {item.error && (
                            <p className="text-xs text-red-400 mt-1">{item.error}</p>
                          )}
                          {item.result && (
                            <details className="mt-2">
                              <summary className="text-xs opacity-60 cursor-pointer">查看详情</summary>
                              <pre className="mt-2 text-xs font-mono overflow-x-auto">
                                {JSON.stringify(item.result, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <details>
                    <summary className="text-xs opacity-60 cursor-pointer flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      查看完整 JSON 响应
                    </summary>
                    <pre className="mt-2 text-xs font-mono overflow-x-auto p-3 rounded bg-black/20">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}

