import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";

export type ContractStatus = "active" | "warning" | "error" | "loading" | "inactive";

interface ContractHealth {
  name: string;
  address: string;
  status: ContractStatus;
  message?: string;
}

interface ContractHealthMonitorProps {
  contracts: ContractHealth[];
  title?: string;
}

export function ContractHealthMonitor({
  contracts,
  title = "Contract Health Monitor",
}: ContractHealthMonitorProps) {
  const { theme } = useTheme();

  const statusConfig = {
    active: {
      icon: CheckCircle2,
      color: theme === "cyberpunk" ? "text-green-400" : "text-green-600",
      bg: theme === "cyberpunk" ? "bg-green-400/10 border-green-400/30" : "bg-green-50 border-green-200",
      label: "Active",
    },
    warning: {
      icon: AlertCircle,
      color: theme === "cyberpunk" ? "text-yellow-400" : "text-yellow-600",
      bg: theme === "cyberpunk" ? "bg-yellow-400/10 border-yellow-400/30" : "bg-yellow-50 border-yellow-200",
      label: "Warning",
    },
    error: {
      icon: XCircle,
      color: theme === "cyberpunk" ? "text-red-400" : "text-red-600",
      bg: theme === "cyberpunk" ? "bg-red-400/10 border-red-400/30" : "bg-red-50 border-red-200",
      label: "Error",
    },
    loading: {
      icon: Loader2,
      color: theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600",
      bg: theme === "cyberpunk" ? "bg-cyan-400/10 border-cyan-400/30" : "bg-blue-50 border-blue-200",
      label: "Loading",
    },
    inactive: {
      icon: XCircle,
      color: theme === "cyberpunk" ? "text-slate-400" : "text-slate-500",
      bg: theme === "cyberpunk" ? "bg-slate-800/50 border-slate-700/30" : "bg-slate-50 border-slate-200",
      label: "Inactive",
    },
  };

  const healthyCount = contracts.filter((c) => c.status === "active").length;
  const totalCount = contracts.length;

  return (
    <ThemedCard className="p-3 md:p-4">
      <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
        <h3 className={cn(
          "text-sm font-semibold",
          theme === "cyberpunk" ? "font-orbitron text-cyan-200" : "font-poppins text-slate-900"
        )}>
          {title}
        </h3>
        <div className={cn(
          "text-xs px-2 py-1 rounded-full",
          healthyCount === totalCount
            ? theme === "cyberpunk"
              ? "bg-green-400/20 text-green-400"
              : "bg-green-100 text-green-700"
            : theme === "cyberpunk"
            ? "bg-yellow-400/20 text-yellow-400"
            : "bg-yellow-100 text-yellow-700"
        )}>
          {healthyCount}/{totalCount} Healthy
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {contracts.map((contract) => {
          const config = statusConfig[contract.status];
          const Icon = config.icon;

          return (
            <div
              key={contract.address}
              className={cn(
                "p-2 rounded border text-xs",
                config.bg
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon
                  className={cn(
                    "w-3.5 h-3.5",
                    config.color,
                    contract.status === "loading" && "animate-spin"
                  )}
                />
                <span className={cn(
                  "font-semibold truncate",
                  theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700"
                )}>
                  {contract.name}
                </span>
              </div>
              {contract.message && (
                <div className={cn(
                  "text-xs opacity-70 truncate",
                  theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
                )}>
                  {contract.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ThemedCard>
  );
}

