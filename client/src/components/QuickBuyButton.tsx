import { useState } from "react";
import { Button } from "./ui/button";
import { Coins, ChevronDown, ChevronUp } from "lucide-react";

interface QuickBuyButtonProps {
  className?: string;
}

export default function QuickBuyButton({ className = "" }: QuickBuyButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const presetAmounts = [
    { value: 10, label: "$10" },
    { value: 50, label: "$50" },
    { value: 100, label: "$100" },
  ];

  const handleQuickBuy = (amount: number) => {
    // 跳转到 Market 页面，并通过 URL 参数传递金额
    window.location.href = `/app/market?buy=${amount}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 主按钮 */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
      >
        <Coins className="mr-2 h-5 w-5" />
        购买 $POI 代币
        {isExpanded ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )}
      </Button>

      {/* 展开的快捷金额 */}
      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs text-slate-400 text-center">选择金额快速购买</p>
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset.value}
                onClick={() => handleQuickBuy(preset.value)}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 py-5"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => window.location.href = '/app/market'}
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-200 text-sm"
          >
            自定义金额 →
          </Button>
        </div>
      )}

      {/* 底部提示 */}
      {!isExpanded && (
        <p className="text-xs text-slate-400 text-center">
          即时兑换 · 安全快捷 · Uniswap V2
        </p>
      )}
    </div>
  );
}

