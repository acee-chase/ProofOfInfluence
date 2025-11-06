import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function POITokenPrice() {
  // Mock data for now - TODO: Replace with actual API call
  const [priceData, setPriceData] = useState<PriceData>({
    price: 0.052,
    change24h: 8.5,
    volume24h: 1250000,
    marketCap: 5200000,
  });

  // Simulate real-time price updates (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData((prev) => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 0.001,
        change24h: prev.change24h + (Math.random() - 0.5) * 0.5,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = priceData.change24h >= 0;

  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <DollarSign className="w-4 h-4" />
            <span>$POI 价格</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {formatPrice(priceData.price)}
            </span>
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{isPositive ? "+" : ""}{priceData.change24h.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">24小时变化</p>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Activity className="w-4 h-4" />
            <span>24小时交易量</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatVolume(priceData.volume24h)}
          </div>
          <p className="text-xs text-slate-500">活跃交易</p>
        </div>

        {/* Market Cap */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <DollarSign className="w-4 h-4" />
            <span>市值</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatVolume(priceData.marketCap)}
          </div>
          <p className="text-xs text-slate-500">总市值</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          $POI 是 ACEE Ventures 的流量价值载体，实时价格数据更新中
        </p>
      </div>
    </Card>
  );
}

