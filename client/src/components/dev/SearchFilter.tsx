import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedInput } from "@/components/themed";
import { Search, X, Filter } from "lucide-react";
import { ThemedButton } from "@/components/themed";

export type ContractStatusFilter = "all" | "active" | "warning" | "error" | "inactive";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: ContractStatusFilter;
  onStatusFilterChange?: (status: ContractStatusFilter) => void;
  placeholder?: string;
  showStatusFilter?: boolean;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  placeholder = "Search contracts by name or address...",
  showStatusFilter = true,
}: SearchFilterProps) {
  const { theme } = useTheme();

  const statusOptions: { value: ContractStatusFilter; label: string; color: string }[] = [
    { value: "all", label: "All", color: "slate" },
    { value: "active", label: "Active", color: "green" },
    { value: "warning", label: "Warning", color: "yellow" },
    { value: "error", label: "Error", color: "red" },
    { value: "inactive", label: "Inactive", color: "slate" },
  ];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
            theme === "cyberpunk" ? "text-cyan-400" : "text-slate-400"
          )}
        />
        <ThemedInput
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "pl-10 pr-10",
            theme === "cyberpunk" && "bg-slate-900/60 border-cyan-400/30"
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity",
              theme === "cyberpunk" ? "text-cyan-400 hover:bg-cyan-400/10" : "text-slate-400 hover:bg-slate-100"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      {showStatusFilter && onStatusFilterChange && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "flex items-center gap-1.5 text-xs flex-shrink-0",
            theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600"
          )}>
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold hidden sm:inline">Filter:</span>
          </div>
          <div className="flex gap-1.5 flex-wrap flex-1">
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <ThemedButton
                  key={option.value}
                  onClick={() => onStatusFilterChange(option.value)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs",
                    isActive && theme === "cyberpunk" && `bg-${option.color}-400/20 border-${option.color}-400/30 text-${option.color}-400`
                  )}
                >
                  {option.label}
                </ThemedButton>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Count */}
      {searchQuery && (
        <div className={cn(
          "text-xs opacity-70",
          theme === "cyberpunk" ? "text-cyan-300/70" : "text-slate-600"
        )}>
          Searching for: <span className="font-mono font-semibold">{searchQuery}</span>
        </div>
      )}
    </div>
  );
}

