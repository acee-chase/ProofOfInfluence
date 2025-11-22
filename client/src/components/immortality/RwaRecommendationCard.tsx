import { ThemedButton } from "../themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import type { RwaItem } from "../../../../shared/types/rwa";
import { useI18n } from "@/i18n";
import { useLocation } from "wouter";

interface RwaRecommendationCardProps {
  item: RwaItem;
  onPreview?: (item: RwaItem) => void;
  onBuy?: (itemId: string) => void;
}

export function RwaRecommendationCard({ item, onPreview, onBuy }: RwaRecommendationCardProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [, setLocation] = useLocation();

  const handlePreview = () => {
    if (onPreview) {
      onPreview(item);
    } else {
      // Default: Navigate to detail page
      setLocation(`/app/rwa-market/${item.id}`);
    }
  };

  const handleBuy = () => {
    if (onBuy) {
      onBuy(item.id);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        theme === "cyberpunk"
          ? "border-cyan-400/30 bg-cyan-400/5 hover:border-cyan-400/50"
          : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4
              className={cn(
                "font-semibold text-sm mb-1",
                theme === "cyberpunk" ? "text-cyan-300" : "text-slate-900"
              )}
            >
              {item.name}
            </h4>
            <p
              className={cn(
                "text-xs opacity-70",
                theme === "cyberpunk" ? "text-cyan-200" : "text-slate-600"
              )}
            >
              {item.shortDescription}
            </p>
          </div>
          {item.highlightTag && (
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                theme === "cyberpunk"
                  ? "bg-cyan-400/20 text-cyan-300"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              {item.highlightTag}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className={cn("opacity-60", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-600")}>
              {t('rwa.item.field.type')}
            </div>
            <div className={cn("font-medium", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-900")}>
              {item.type}
            </div>
          </div>
          <div>
            <div className={cn("opacity-60", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-600")}>
              {t('rwa.item.field.status')}
            </div>
            <div className={cn("font-medium", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-900")}>
              {t(`rwa.item.status.${item.status.toLowerCase()}`)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <ThemedButton
            size="sm"
            variant="outline"
            onClick={handlePreview}
            className="flex-1 text-xs"
          >
            {t('market.ticker.cta')}
          </ThemedButton>
          <ThemedButton
            size="sm"
            emphasis
            onClick={handleBuy}
            className="flex-1 text-xs"
          >
            {t('immortality.rwa.quick_buy_prompt', { name: '' }).replace('Register your interest in ', '')}
          </ThemedButton>
        </div>
      </div>
    </div>
  );
}
