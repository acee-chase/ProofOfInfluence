import { useState, useMemo } from "react";
import { parseUnits, formatUnits } from "viem";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useAccount } from "wagmi";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatPoi, formatUsdc, useTgeActions, useTgeSaleState } from "@/hooks/useTgeSale";

const USDC_DECIMALS = 6;
const PRECISION_FACTOR = 10n ** 12n; // Align with contract conversion for POI

const formatBigint = (value: bigint, decimals: number, fractionDigits = 2) =>
  Number(formatUnits(value, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export function TGESaleCard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const [usdcInput, setUsdcInput] = useState("");
  const { sale, usdcBalance, allowance, isLoading, refetchAll, isSaleConfigured } = useTgeSaleState();
  const { approveUsdc, purchase, isApproving, isPurchasing } = useTgeActions({
    onSettled: refetchAll,
  });

  const parsedAmount = useMemo(() => {
    if (!usdcInput) return null;
    try {
      return parseUnits(usdcInput, USDC_DECIMALS);
    } catch {
      return null;
    }
  }, [usdcInput]);

  const estimatedPoi = useMemo(() => {
    if (!parsedAmount || !sale.pricePerToken || sale.pricePerToken === 0n) {
      return null;
    }
    return (parsedAmount * PRECISION_FACTOR) / sale.pricePerToken;
  }, [parsedAmount, sale.pricePerToken]);

  const needsApproval = useMemo(() => {
    if (!parsedAmount || parsedAmount === 0n) return true;
    return allowance < parsedAmount;
  }, [allowance, parsedAmount]);

  const remainingDisplay = sale.remainingTokens ? formatPoi(sale.remainingTokens) : "--";
  const minDisplay = sale.minContribution ? formatUsdc(sale.minContribution) : "--";
  const maxDisplay = sale.maxContribution ? formatUsdc(sale.maxContribution) : "--";
  const totalRaisedDisplay = sale.totalRaised ? formatUsdc(sale.totalRaised) : "--";
  const userContributionDisplay = sale.userContribution ? formatUsdc(sale.userContribution) : "--";

  const errors: string[] = [];
  if (!isSaleConfigured) {
    errors.push("TGE 合约地址未配置，请检查环境变量。");
  }
  if (parsedAmount && sale.minContribution && parsedAmount < sale.minContribution) {
    errors.push(`最低认购金额为 ${minDisplay} USDC。`);
  }
  if (parsedAmount && sale.maxContribution && sale.maxContribution > 0n && parsedAmount > sale.maxContribution) {
    errors.push(`最高单笔认购金额为 ${maxDisplay} USDC。`);
  }
  if (parsedAmount && parsedAmount > usdcBalance) {
    errors.push("USDC 余额不足。");
  }
  if (estimatedPoi && sale.remainingTokens && estimatedPoi > sale.remainingTokens) {
    errors.push("超过当前层级剩余额度。");
  }

  const handleApprove = async () => {
    if (!parsedAmount) return;
    try {
      await approveUsdc(parsedAmount);
      toast({
        title: "授权成功",
        description: "USDC 授权完成，可以进行购买。",
      });
    } catch (error: any) {
      toast({
        title: "授权失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async () => {
    if (!parsedAmount) return;
    try {
      await purchase(parsedAmount);
      toast({
        title: "购买成功",
        description: "交易已确认，余额已更新。",
      });
      setUsdcInput("");
    } catch (error: any) {
      toast({
        title: "购买失败",
        description: error?.message ?? "请重试。",
        variant: "destructive",
      });
    }
  };

  const disableApprove = !parsedAmount || parsedAmount === 0n || !isSaleConfigured || !isConnected || errors.length > 0;
  const disablePurchase =
    !parsedAmount || !estimatedPoi || needsApproval || !isConnected || errors.length > 0 || !isSaleConfigured;

  return (
    <ThemedCard className="p-6 space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-70">POI Public Sale</p>
          <h2 className={cn("text-xl font-bold", theme === "cyberpunk" ? "font-orbitron" : "font-poppins")}>
            TGE Purchase
          </h2>
        </div>
        <ShieldCheck className="w-6 h-6 opacity-70" />
      </header>

      {!isSaleConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>尚未配置 TGESale 合约地址，无法发起购买。</AlertDescription>
        </Alert>
      )}

      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>请先连接钱包以开始购买。</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs opacity-70 mb-1">当前层级</p>
          <div className="text-2xl font-semibold">
            {sale.currentTier !== null ? `Tier ${sale.currentTier + 1n}` : "--"}
          </div>
        </div>
        <div>
          <p className="text-xs opacity-70 mb-1">价格 / POI</p>
          <div className="text-2xl font-semibold">
            {sale.pricePerToken ? `${formatUnits(sale.pricePerToken, USDC_DECIMALS)} USDC` : "--"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <p className="opacity-70 text-xs">剩余额度 (POI)</p>
          <p className="font-semibold">{remainingDisplay}</p>
        </div>
        <div>
          <p className="opacity-70 text-xs">最小 / 最大 (USDC)</p>
          <p className="font-semibold">
            {minDisplay} / {maxDisplay === "--" ? "∞" : maxDisplay}
          </p>
        </div>
        <div>
          <p className="opacity-70 text-xs">您已认购 (USDC)</p>
          <p className="font-semibold">{userContributionDisplay}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs opacity-70">
          <span>USDC 余额</span>
          <button
            type="button"
            onClick={() => setUsdcInput(formatUnits(usdcBalance, USDC_DECIMALS))}
            className="text-primary"
            disabled={!isConnected}
          >
            {formatBigint(usdcBalance, USDC_DECIMALS, 6)}
          </button>
        </div>
        <ThemedInput
          type="number"
          step="0.000001"
          min="0"
          value={usdcInput}
          onChange={(e) => setUsdcInput(e.target.value)}
          placeholder="输入 USDC 数量"
          disabled={!isConnected || isLoading}
        />
        <div className="text-xs opacity-70">
          预计可获得：{" "}
          <span className="font-semibold">
            {estimatedPoi ? `${formatUnits(estimatedPoi, 18)} POI` : "--"}
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <ThemedButton
          onClick={handleApprove}
          disabled={disableApprove || isApproving || !needsApproval}
          variant="outline"
        >
          {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Step 1 · 授权 USDC
        </ThemedButton>
        <ThemedButton
          emphasis
          onClick={handlePurchase}
          disabled={disablePurchase || isPurchasing}
        >
          {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Step 2 · 购买 POI
        </ThemedButton>
      </div>

      <p className="text-xs opacity-60">
        交易需要 Base 网络的 gas 费。购买完成后请在钱包中查看 POI 余额。
      </p>
    </ThemedCard>
  );
}

export default TGESaleCard;

