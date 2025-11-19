import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  status?: "healthy" | "warning" | "error";
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  status,
  subtitle,
}: StatCardProps) {
  const { theme } = useTheme();

  const trendColors = {
    up: theme === "cyberpunk" ? "text-green-400" : "text-green-600",
    down: theme === "cyberpunk" ? "text-red-400" : "text-red-600",
    neutral: theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600",
  };

  const statusColors = {
    healthy: theme === "cyberpunk" ? "bg-green-400/20 border-green-400/30" : "bg-green-50 border-green-200",
    warning: theme === "cyberpunk" ? "bg-yellow-400/20 border-yellow-400/30" : "bg-yellow-50 border-yellow-200",
    error: theme === "cyberpunk" ? "bg-red-400/20 border-red-400/30" : "bg-red-50 border-red-200",
  };

  return (
    <ThemedCard
      className={cn(
        "p-3 md:p-4 relative overflow-hidden",
        status && statusColors[status]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-xs opacity-70 mb-1",
            theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
          )}>
            {title}
          </div>
          <div className={cn(
            "text-xl md:text-2xl font-bold mb-1 break-words",
            theme === "cyberpunk" ? "font-orbitron text-cyan-200" : "font-poppins text-slate-900"
          )}>
            {value}
          </div>
          {subtitle && (
            <div className={cn(
              "text-xs opacity-60",
              theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
            )}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div className={cn(
              "text-xs font-semibold mt-1",
              trendColors[trendDirection]
            )}>
              {trend}
            </div>
          )}
        </div>
        <div className={cn(
          "flex-shrink-0 p-2 rounded-lg",
          theme === "cyberpunk"
            ? "bg-cyan-400/10 text-cyan-400"
            : "bg-blue-100 text-blue-600"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </ThemedCard>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {children}
    </div>
  );
}

