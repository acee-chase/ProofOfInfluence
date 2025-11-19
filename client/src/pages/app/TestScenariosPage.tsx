import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { isDevEnvironment } from "@/lib/env";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type ScenarioName = "immortality-playable-agent" | "immortality-demo-seed";

interface ScenarioResult {
  success: boolean;
  result?: any;
  txHashes?: string[];
  errors?: string[];
  steps?: Array<{ name: string; status: "success" | "failed"; message?: string }>;
}

export default function TestScenariosPage() {
  const { theme } = useTheme();
  const [scenario, setScenario] = useState<ScenarioName>("immortality-playable-agent");
  const [wallets, setWallets] = useState<string>("1");
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runScenarioMutation = useMutation({
    mutationFn: async (params: { scenario: ScenarioName; params: Record<string, any> }) => {
      const res = await apiRequest("POST", "/api/test/run-scenario", params);
      return res.json() as Promise<ScenarioResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      setIsRunning(false);
    },
    onError: (error: any) => {
      setResult({
        success: false,
        errors: [error.message || "Failed to run scenario"],
      });
      setIsRunning(false);
    },
  });

  const handleRunScenario = () => {
    setIsRunning(true);
    setResult(null);
    
    const params: Record<string, any> = {};
    if (scenario === "immortality-demo-seed") {
      params.wallets = parseInt(wallets) || 5;
    }

    runScenarioMutation.mutate({
      scenario,
      params,
    });
  };

  // Only show in dev environment
  if (!isDevEnvironment()) {
    return (
      <PageLayout>
        <Section>
          <ThemedCard>
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Test Scenarios</h2>
              <p className="text-muted-foreground">This page is only available in development mode.</p>
            </div>
          </ThemedCard>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Section>
        <ThemedCard>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Test Scenarios Console</h1>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="scenario">Scenario</Label>
                <Select value={scenario} onValueChange={(value) => setScenario(value as ScenarioName)}>
                  <SelectTrigger id="scenario" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immortality-playable-agent">Immortality Playable Agent (E2E)</SelectItem>
                    <SelectItem value="immortality-demo-seed">Immortality Demo Seed (Batch Generate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scenario === "immortality-demo-seed" && (
                <div>
                  <Label htmlFor="wallets">Number of Wallets</Label>
                  <Input
                    id="wallets"
                    type="number"
                    value={wallets}
                    onChange={(e) => setWallets(e.target.value)}
                    className="mt-1"
                    min="1"
                    max="100"
                  />
                </div>
              )}

              <ThemedButton
                onClick={handleRunScenario}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Scenario...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Scenario
                  </>
                )}
              </ThemedButton>
            </div>

            {result && (
              <div className="mt-6 space-y-4">
                <Alert variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <strong>Status:</strong> {result.success ? "Success" : "Failed"}
                    </AlertDescription>
                  </div>
                </Alert>

                {result.steps && result.steps.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Steps:</h3>
                    <div className="space-y-2">
                      {result.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded border",
                            step.status === "success"
                              ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {step.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className="font-medium">{step.name}</span>
                          </div>
                          {step.message && (
                            <p className="text-sm text-muted-foreground mt-1 ml-6">{step.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.txHashes && result.txHashes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Transaction Hashes:</h3>
                    <div className="space-y-1">
                      {result.txHashes.map((txHash, idx) => (
                        <code key={idx} className="block text-sm bg-muted p-2 rounded">
                          {txHash}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-destructive">Errors:</h3>
                    <div className="space-y-1">
                      {result.errors.map((error, idx) => (
                        <p key={idx} className="text-sm text-destructive">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {result.result && (
                  <div>
                    <h3 className="font-semibold mb-2">Result:</h3>
                    <pre className="text-sm bg-muted p-4 rounded overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
