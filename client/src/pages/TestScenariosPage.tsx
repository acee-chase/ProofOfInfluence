import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type ScenarioKey = "immortality-playable-agent" | "immortality-demo-seed";

interface ScenarioResult {
  success: boolean;
  result?: any;
  txHashes?: string[];
  errors?: string[];
  steps?: Array<{ step: string; status: "success" | "error"; message?: string }>;
}

export default function TestScenariosPage() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("immortality-playable-agent");
  const [demoUserId, setDemoUserId] = useState("");
  const [params, setParams] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  const handleRunScenario = async () => {
    setLoading(true);
    setResult(null);

    try {
      let parsedParams = {};
      if (params.trim()) {
        try {
          parsedParams = JSON.parse(params);
        } catch (e) {
          alert("Invalid JSON in params field");
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/test-scenarios/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioKey,
          demoUserId: demoUserId || undefined,
          params: parsedParams,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        errors: [error.message || "Failed to run scenario"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios Runner</CardTitle>
          <CardDescription>
            Execute automated E2E test scenarios for Immortality features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Select value={scenarioKey} onValueChange={(v) => setScenarioKey(v as ScenarioKey)}>
              <SelectTrigger id="scenario">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immortality-playable-agent">
                  Immortality Playable Agent (Full E2E)
                </SelectItem>
                <SelectItem value="immortality-demo-seed">Immortality Demo Seed (Batch Users)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoUserId">Demo User ID (Optional)</Label>
            <Input
              id="demoUserId"
              value={demoUserId}
              onChange={(e) => setDemoUserId(e.target.value)}
              placeholder="Leave empty to use test wallet"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="params">Params (JSON, Optional)</Label>
            <Textarea
              id="params"
              value={params}
              onChange={(e) => setParams(e.target.value)}
              placeholder='{"memories": [...], "chatMessages": [...], "mintBadge": true}'
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={handleRunScenario} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Scenario...
              </>
            ) : (
              "Run Scenario"
            )}
          </Button>

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
                    {result.success ? "Scenario completed successfully" : "Scenario failed"}
                  </AlertDescription>
                </div>
              </Alert>

              {result.steps && result.steps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Execution Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-sm ${
                            step.status === "error" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {step.status === "error" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          <span className="font-mono">{step.step}</span>
                          {step.message && <span className="text-gray-600">- {step.message}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.txHashes && result.txHashes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transaction Hashes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {result.txHashes.map((txHash, idx) => (
                        <div key={idx} className="font-mono text-sm break-all">
                          {txHash}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.errors && result.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {result.errors.map((error, idx) => (
                        <div key={idx} className="text-sm text-red-600">{error}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
