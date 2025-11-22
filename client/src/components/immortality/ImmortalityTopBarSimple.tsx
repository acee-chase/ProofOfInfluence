import React from "react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ThemedButton } from "@/components/themed";
import { Loader2, CreditCard } from "lucide-react";
import { ROUTES } from "@/routes";

interface ImmortalityTopBarSimpleProps {
  credits: number;
  isFetching?: boolean;
}

export function ImmortalityTopBarSimple({
  credits,
  isFetching = false,
}: ImmortalityTopBarSimpleProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-sm",
        theme === "cyberpunk"
          ? "border-cyan-500/20 bg-[#0a0a0f]/90"
          : "border-slate-200 bg-white/90",
      )}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Credits Balance */}
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70">
                Credits
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xl md:text-2xl font-bold">{credits.toLocaleString()}</p>
                {isFetching && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
              </div>
            </div>
          </div>

          {/* Right: Recharge Button */}
          <ThemedButton emphasis size="sm" asChild>
            <Link href={ROUTES.APP_RECHARGE}>
              <CreditCard className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Recharge Credits</span>
              <span className="sm:hidden">Recharge</span>
            </Link>
          </ThemedButton>
        </div>
      </div>
    </div>
  );
}
