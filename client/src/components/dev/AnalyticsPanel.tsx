import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { BarChart3, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface AnalyticsPanelProps {
  poiDistribution?: ChartData[];
  contractActivity?: ChartData[];
  tvlTrend?: ChartData[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AnalyticsPanel({
  poiDistribution,
  contractActivity,
  tvlTrend,
  collapsed = true,
  onToggleCollapse,
}: AnalyticsPanelProps) {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse?.();
  };

  // Simple bar chart component (placeholder - can be replaced with Recharts later)
  const SimpleBarChart = ({ data, title }: { data: ChartData[]; title: string }) => {
    if (!data || data.length === 0) {
      return (
        <div className={cn(
          "h-32 rounded-lg flex items-center justify-center",
          theme === "cyberpunk"
            ? "bg-slate-900/60 border border-cyan-400/20"
            : "bg-slate-50 border border-slate-200"
        )}>
          <div className="text-center">
            <BarChart3 className={cn(
              "w-8 h-8 mx-auto mb-2 opacity-50",
              theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
            )} />
            <div className={cn(
              "text-xs opacity-70",
              theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
            )}>
              {title} - Data coming soon
            </div>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <div className="space-y-2">
        <div className={cn(
          "text-xs font-semibold",
          theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700"
        )}>
          {title}
        </div>
        <div className="space-y-1.5">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    "truncate",
                    theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600"
                  )}>
                    {item.name}
                  </span>
                  <span className={cn(
                    "font-mono font-semibold",
                    theme === "cyberpunk" ? "text-cyan-200" : "text-slate-900"
                  )}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className={cn(
                  "h-2 rounded-full overflow-hidden",
                  theme === "cyberpunk" ? "bg-slate-800" : "bg-slate-200"
                )}>
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      item.color || (theme === "cyberpunk" ? "bg-cyan-400" : "bg-blue-600")
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple line chart placeholder
  const SimpleLineChart = ({ data, title }: { data: ChartData[]; title: string }) => {
    if (!data || data.length === 0) {
      return (
        <div className={cn(
          "h-32 rounded-lg flex items-center justify-center",
          theme === "cyberpunk"
            ? "bg-slate-900/60 border border-cyan-400/20"
            : "bg-slate-50 border border-slate-200"
        )}>
          <div className="text-center">
            <TrendingUp className={cn(
              "w-8 h-8 mx-auto mb-2 opacity-50",
              theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
            )} />
            <div className={cn(
              "text-xs opacity-70",
              theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
            )}>
              {title} - Data coming soon
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className={cn(
          "text-xs font-semibold",
          theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700"
        )}>
          {title}
        </div>
        <div className={cn(
          "h-32 rounded-lg flex items-center justify-center border",
          theme === "cyberpunk"
            ? "bg-slate-900/60 border-cyan-400/20"
            : "bg-slate-50 border-slate-200"
        )}>
          <div className="text-center">
            <TrendingUp className={cn(
              "w-8 h-8 mx-auto mb-2 opacity-50",
              theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
            )} />
            <div className={cn(
              "text-xs opacity-70",
              theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
            )}>
              Line chart visualization coming soon
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ThemedCard className="overflow-hidden">
      {/* Header */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity",
          theme === "cyberpunk" && "hover:bg-cyan-400/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            theme === "cyberpunk"
              ? "bg-cyan-400/10 text-cyan-400"
              : "bg-blue-100 text-blue-600"
          )}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className={cn(
            "text-base font-semibold",
            theme === "cyberpunk" ? "font-orbitron text-cyan-200" : "font-poppins text-slate-900"
          )}>
            Analytics & Insights
          </h3>
        </div>
        <div className={cn(
          "transition-transform",
          isCollapsed && "rotate-180"
        )}>
          {theme === "cyberpunk" ? (
            <ChevronDown className="w-5 h-5 text-cyan-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600" />
          )}
        </div>
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="border-t p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* POI Distribution */}
            <div className={cn(
              "p-4 rounded-lg border",
              theme === "cyberpunk"
                ? "bg-slate-900/60 border-cyan-400/20"
                : "bg-slate-50 border-slate-200"
            )}>
              <SimpleBarChart
                data={poiDistribution || []}
                title="POI Distribution"
              />
            </div>

            {/* Contract Activity */}
            <div className={cn(
              "p-4 rounded-lg border",
              theme === "cyberpunk"
                ? "bg-slate-900/60 border-cyan-400/20"
                : "bg-slate-50 border-slate-200"
            )}>
              <SimpleBarChart
                data={contractActivity || []}
                title="Contract Activity (7d)"
              />
            </div>
          </div>

          {/* TVL Trend */}
          <div className={cn(
            "p-4 rounded-lg border",
            theme === "cyberpunk"
              ? "bg-slate-900/60 border-cyan-400/20"
              : "bg-slate-50 border-slate-200"
          )}>
            <SimpleLineChart
              data={tvlTrend || []}
              title="TVL Trend"
            />
          </div>

          <div className={cn(
            "text-xs text-center opacity-60 p-2 rounded",
            theme === "cyberpunk"
              ? "bg-cyan-400/5 text-cyan-300/70"
              : "bg-blue-50 text-slate-600"
          )}>
            💡 Advanced charts with Recharts coming in Phase 3
          </div>
        </div>
      )}
    </ThemedCard>
  );
}

