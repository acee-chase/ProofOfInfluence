import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowDownUp, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "./ui/alert";

interface UniswapSwapCardProps {
  walletAddress: string | null;
}

export default function UniswapSwapCard({ walletAddress }: UniswapSwapCardProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [fromToken, setFromToken] = useState<"ETH" | "USDC">("ETH");
  const [toToken, setToToken] = useState<"ETH" | "USDC">("USDC");
  const [estimatedGas, setEstimatedGas] = useState<string>("");
  const { toast } = useToast();

  // 模拟获取报价 - Base 链 Uniswap V2
  const getQuote = async (amount: string) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setToAmount("");
      return;
    }
    
    try {
      // TODO: 集成真实的 Uniswap V2 SDK for Base chain
      // Base 链 ETH/USDC 交易对
      const mockRate = fromToken === "ETH" ? 2500 : 1 / 2500;
      const result = (parseFloat(amount) * mockRate).toFixed(6);
      setToAmount(result);
      setEstimatedGas("~$0.50"); // Base 链 Gas 费较低
    } catch (error) {
      console.error("Failed to get quote:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getQuote(fromAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken]);

  const handleSwap = async () => {
    if (!walletAddress) {
      toast({
        title: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "请输入有效金额",
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // TODO: 集成 Uniswap V2 SDK 执行真实交易
      // Base 链 ETH/USDC 交易对
      // 1. 准备交易参数（Uniswap V2 Router）
      // 2. 请求用户签名
      // 3. 发送交易到 Base 链
      // 4. 等待确认
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "交易提交成功",
        description: "请在 MetaMask 中确认交易（Base 网络）",
      });
      
    } catch (error: any) {
      toast({
        title: "交易失败",
        description: error.message || "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount("");
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">兑换</h2>
      
      {!walletAddress && (
        <Alert className="mb-4 bg-slate-900/50 border-slate-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            请先连接钱包以开始交易
          </AlertDescription>
        </Alert>
      )}

      {/* From Token */}
      <div className="space-y-2 mb-2">
        <div className="flex justify-between text-sm">
          <label className="text-slate-400">卖出</label>
          {walletAddress && (
            <span className="text-slate-500">余额: 0.0 {fromToken}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white text-lg h-14 flex-1"
            disabled={!walletAddress}
          />
          <Button 
            variant="outline" 
            className="min-w-[100px] h-14 text-lg border-slate-700"
            disabled
          >
            {fromToken}
          </Button>
        </div>
      </div>

      {/* Switch Button */}
      <div className="flex justify-center my-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={switchTokens}
          className="rounded-full h-10 w-10 hover:bg-slate-700"
          disabled={!walletAddress}
        >
          <ArrowDownUp className="w-5 h-5" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-2 mb-6">
        <label className="text-sm text-slate-400">买入</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="bg-slate-900 border-slate-700 text-white text-lg h-14 flex-1"
          />
          <Button 
            variant="outline" 
            className="min-w-[100px] h-14 text-lg border-slate-700"
            disabled
          >
            {toToken}
          </Button>
        </div>
      </div>

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={isSwapping || !walletAddress || !fromAmount}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isSwapping ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            交易中...
          </>
        ) : walletAddress ? (
          "兑换"
        ) : (
          "连接钱包以交易"
        )}
      </Button>

      {/* Transaction Info */}
      {fromAmount && toAmount && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>汇率</span>
            <span className="text-white">
              1 {fromToken} ≈ {fromToken === "ETH" ? "2,500" : "0.0004"} {toToken}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>预估 Gas</span>
            <span className="text-white">{estimatedGas}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>滑点容差</span>
            <span className="text-white">0.5%</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>协议</span>
            <span className="text-white flex items-center gap-1">
              Uniswap V2
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>网络</span>
            <span className="text-white">Base</span>
          </div>
        </div>
      )}
    </Card>
  );
}

