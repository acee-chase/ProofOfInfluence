import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type ScenarioKey = "immortality-playable-agent" | "immortality-demo-seed";

interface ScenarioStep {
  name: string;
  status: "success" | "failed";
  output?: any;
  error?: { code: string; message: string; data?: any };
}

interface ScenarioResult {
  success: boolean;
  runId?: string;
  result?: any;
  steps?: ScenarioStep[];
  error?: { code: string; message: string; data?: any };
}

export default function TestScenariosPage() {
  const [location, setLocation] = useLocation();
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>("immortality-playable-agent");
  const [demoUserId, setDemoUserId] = useState("");
  const [params, setParams] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  // Initialize demoUserId from URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlDemoUserId = urlParams.get("demoUserId");
    
    if (urlDemoUserId) {
      localStorage.setItem("demoUserId", urlDemoUserId);
      setDemoUserId(urlDemoUserId);
      // Clean URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("demoUserId");
      setLocation(newUrl.pathname + newUrl.search, { replace: true });
    } else {
      const stored = localStorage.getItem("demoUserId");
      if (stored) {
        setDemoUserId(stored);
      }
    }
  }, [location, setLocation]);

  // Update localStorage when demoUserId changes
  useEffect(() => {
    if (demoUserId) {
      localStorage.setItem("demoUserId", demoUserId);
    } else {
      localStorage.removeItem("demoUserId");
    }
  }, [demoUserId]);

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

      // Get demoUserId from localStorage (SSoT)
      const currentDemoUserId = localStorage.getItem("demoUserId") || demoUserId || `demo-${Date.now()}`;

      const response = await fetch("/api/test-scenarios/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-user-id": currentDemoUserId,
        },
        body: JSON.stringify({
          scenarioKey,
          params: parsedParams,
        }),
      });

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        const preview = text.substring(0, 500);
        throw new Error(`Non-JSON response received. Preview: ${preview}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: {
          code: "REQUEST_FAILED",
          message: error.message || "Failed to run scenario",
        },
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
            <Label htmlFor="demoUserId">Demo User ID</Label>
            <Input
              id="demoUserId"
              value={demoUserId}
              onChange={(e) => setDemoUserId(e.target.value)}
              placeholder="demo-001 (stored in localStorage)"
            />
            <p className="text-xs text-gray-500">
              Stored in localStorage. Use URL: /app/test-scenarios?demoUserId=xxx to initialize.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="params">Params (JSON, Optional)</Label>
            <Textarea
              id="params"
              value={params}
              onChange={(e) => setParams(e.target.value)}
              placeholder='{"chain": "base-sepolia", "memorySeed": ["I am immortal."], "chat": {"messages": [{"role": "user", "content": "你是谁？"}]}, "mint": {"method": "mintSelf", "priceEth": "0"}}'
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
                          className={`flex items-start gap-2 text-sm ${
                            step.status === "failed" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {step.status === "failed" ? (
                            <XCircle className="h-4 w-4 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className="font-mono font-semibold">{step.name}</span>
                            {step.output && (
                              <div className="text-xs text-gray-600 mt-1">
                                {JSON.stringify(step.output, null, 2)}
                              </div>
                            )}
                            {step.error && (
                              <div className="text-xs text-red-600 mt-1">
                                <div className="font-semibold">Error: {step.error.code}</div>
                                <div>{step.error.message}</div>
                                {step.error.data && (
                                  <pre className="mt-1 bg-red-50 p-2 rounded text-xs">
                                    {JSON.stringify(step.error.data, null, 2)}
                                  </pre>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.error && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="font-semibold">{result.error.code}</div>
                      <div className="text-gray-600">{result.error.message}</div>
                      {result.error.data && (
                        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
                          {JSON.stringify(result.error.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.runId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Run ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm break-all">{result.runId}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        window.open(`/api/test-runs/${result.runId}`, "_blank");
                      }}
                    >
                      View Full Run Details
                    </Button>
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
