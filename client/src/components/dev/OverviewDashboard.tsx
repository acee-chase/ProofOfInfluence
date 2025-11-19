import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { StatsGrid, StatCard } from "./StatsGrid";
import { ContractHealthMonitor, ContractHealth } from "./ContractHealthMonitor";
import { Wallet, TrendingUp, CheckCircle2, Activity, Zap, Settings, BarChart3 } from "lucide-react";
import { ThemedButton } from "@/components/themed";

interface OverviewDashboardProps {
  stats: {
    totalPoiBalance?: string;
    contractTVL?: string;
    activeContracts?: string;
    transactions24h?: string;
  };
  contractHealth: ContractHealth[];
  onQuickAction?: (action: string) => void;
}

export function OverviewDashboard({
  stats,
  contractHealth,
  onQuickAction,
}: OverviewDashboardProps) {
  const { theme } = useTheme();

  const quickActions = [
    { id: "fund", icon: Zap, label: "Fund Contract", color: "cyan" },
    { id: "configure", icon: Settings, label: "Configure", color: "blue" },
    { id: "analytics", icon: BarChart3, label: "Analytics", color: "purple" },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Grid */}
      <StatsGrid>
        <StatCard
          title="Total POI Balance"
          value={stats.totalPoiBalance || "0 POI"}
          trend={stats.totalPoiBalance ? "+12.5%" : undefined}
          trendDirection="up"
          icon={Wallet}
        />
        <StatCard
          title="Contract TVL"
          value={stats.contractTVL || "$0"}
          trend={stats.contractTVL ? "+5.2%" : undefined}
          trendDirection="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Contracts"
          value={stats.activeContracts || "0/0"}
          status={
            contractHealth.filter((c) => c.status === "active").length === contractHealth.length
              ? "healthy"
              : contractHealth.some((c) => c.status === "error")
              ? "error"
              : "warning"
          }
          icon={CheckCircle2}
        />
        <StatCard
          title="24h Transactions"
          value={stats.transactions24h || "0"}
          trend={stats.transactions24h ? "+23%" : undefined}
          trendDirection="up"
          icon={Activity}
        />
      </StatsGrid>

      {/* Contract Health Monitor */}
      {contractHealth.length > 0 && (
        <ContractHealthMonitor contracts={contractHealth} />
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <ThemedButton
              key={action.id}
              onClick={() => onQuickAction?.(action.id)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </ThemedButton>
          );
        })}
      </div>
    </div>
  );
}

