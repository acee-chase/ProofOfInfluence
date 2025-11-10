import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import WalletConnectButton from "@/components/WalletConnectButton";
import TradingChart from "@/components/TradingChart";
import UniswapSwapCard from "@/components/UniswapSwapCard";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TradingApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">AI 交易员</h1>
          </div>
          <div className="flex items-center gap-2">
            <WalletConnectButton standalone />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Trading Chart (占 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <TradingChart pair="ETH/USDC" network="Base" />
            
            {/* Market Info */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">市场信息 - Base 链</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">交易对</p>
                  <p className="text-white font-semibold mt-1">ETH/USDC</p>
                </div>
                <div>
                  <p className="text-slate-400">协议</p>
                  <p className="text-white font-semibold mt-1">Uniswap V2</p>
                </div>
                <div>
                  <p className="text-slate-400">网络</p>
                  <p className="text-blue-400 font-semibold mt-1">Base</p>
                </div>
                <div>
                  <p className="text-slate-400">费率</p>
                  <p className="text-white font-semibold mt-1">0.3%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Swap Interface (占 1/3) */}
          <div className="space-y-6">
            <UniswapSwapCard />
            
            {/* Quick Guide */}
            <Card className="p-4 bg-slate-800/30 border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-2">使用指南</h4>
              <ol className="text-xs text-slate-400 space-y-2">
                <li>1. 点击"连接钱包"按钮</li>
                <li>2. 选择您的钱包（MetaMask/Trust Wallet/扫码连接）</li>
                <li>3. 输入交易金额</li>
                <li>4. 点击"兑换"并确认交易</li>
              </ol>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  💡 移动端用户可以通过 WalletConnect 扫码连接钱包
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
