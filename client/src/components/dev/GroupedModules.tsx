import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { Coins, Gift, Badge, Users, ChevronDown, ChevronRight } from "lucide-react";

export interface ContractGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  contracts: Array<{
    id: string;
    name: string;
    component: React.ReactNode;
  }>;
  defaultExpanded?: boolean;
}

interface GroupedModulesProps {
  groups: ContractGroup[];
  defaultExpanded?: boolean;
}

export function GroupedModules({
  groups,
  defaultExpanded = false,
}: GroupedModulesProps) {
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.filter((g) => g.defaultExpanded).map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        const Icon = group.icon;

        return (
          <ThemedCard key={group.id} className="overflow-hidden" data-group={group.id}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 md:p-4 hover:opacity-80 transition-opacity",
                theme === "cyberpunk" && "hover:bg-cyan-400/5"
              )}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className={cn(
                  "p-1.5 md:p-2 rounded-lg flex-shrink-0",
                  theme === "cyberpunk"
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "bg-blue-100 text-blue-600"
                )}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className={cn(
                    "text-sm md:text-base font-semibold truncate",
                    theme === "cyberpunk" ? "font-orbitron text-cyan-200" : "font-poppins text-slate-900"
                  )}>
                    {group.title}
                  </h3>
                  <div className={cn(
                    "text-xs opacity-70",
                    theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
                  )}>
                    {group.contracts.length} contract{group.contracts.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className={cn(
                "transition-transform",
                isExpanded && "rotate-90"
              )}>
                {theme === "cyberpunk" ? (
                  <ChevronRight className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </button>

            {/* Group Content */}
            {isExpanded && (
              <div className="border-t p-3 md:p-4 space-y-3 md:space-y-4">
                {group.contracts.map((contract) => (
                  <div key={contract.id}>
                    {contract.component}
                  </div>
                ))}
              </div>
            )}
          </ThemedCard>
        );
      })}
    </div>
  );
}

