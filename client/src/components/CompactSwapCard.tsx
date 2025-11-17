import { useEffect, useMemo, useState } from "react";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { useAccount, useBalance, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { ArrowLeftRight, Info, Loader2 } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  BASESWAP_ROUTER_ADDRESS,
  ERC20_ABI,
  UNISWAP_V2_ROUTER_ABI,
  USDC_ADDRESS,
  USDC_DECIMALS,
  WETH_ADDRESS,
} from "@/lib/baseConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const SLIPPAGE_BPS = 100; // 1%

export default function CompactSwapCard() {
  const { toast } = useToast();
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: base.id });
  const { writeContractAsync } = useWriteContract();

  const [fromToken, setFromToken] = useState<"ETH" | "USDC">("ETH");
  const toToken = fromToken === "ETH" ? "USDC" : "ETH";
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const isCorrectNetwork = chain?.id === base.id;

  const {
    data: ethBalance,
    refetch: refetchEthBalance,
  } = useBalance({
    address,
    chainId: base.id,
  });

  const {
    data: usdcBalance,
    refetch: refetchUsdcBalance,
  } = useBalance({
    address,
    chainId: base.id,
    token: USDC_ADDRESS,
  });

  const amountInWei = useMemo(() => {
    if (!amountIn) return null;
    try {
      return parseUnits(amountIn, fromToken === "ETH" ? 18 : USDC_DECIMALS);
    } catch {
      return null;
    }
  }, [amountIn, fromToken]);

  const swapPath = useMemo(
    () =>
      fromToken === "ETH"
        ? [WETH_ADDRESS, USDC_ADDRESS] as const
        : [USDC_ADDRESS, WETH_ADDRESS] as const,
    [fromToken]
  );

  const {
    data: allowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address ?? ZERO_ADDRESS, BASESWAP_ROUTER_ADDRESS],
    query: {
      enabled: Boolean(address),
    },
  });

  const {
    data: quoteData,
    refetch: refetchQuote,
    isFetching: isFetchingQuote,
  } = useReadContract({
    address: BASESWAP_ROUTER_ADDRESS,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: "getAmountsOut",
    args: [amountInWei ?? 0n, swapPath],
    query: {
      enabled: false,
    },
  });

  const amountOutWei = quoteData?.[1];
  const amountOutMin = amountOutWei ? (amountOutWei * (10000n - BigInt(SLIPPAGE_BPS))) / 10000n : undefined;

  const needsApproval =
    fromToken === "USDC" && !!amountInWei && (!allowance || allowance < amountInWei);

  useEffect(() => {
    if (!amountInWei || amountInWei <= 0n) {
      setAmountOut("");
      setQuoteError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await refetchQuote();
        if (cancelled) return;
        const output = result.data?.[1];
        if (!output) {
          setAmountOut("");
          return;
        }
        const formatted = formatUnits(output, toToken === "ETH" ? 18 : USDC_DECIMALS);
        setAmountOut(formatDisplayAmount(formatted, toToken));
        setQuoteError(null);
      } catch (error: any) {
        if (!cancelled) {
          setQuoteError(error?.message || "无法获取价格");
          setAmountOut("");
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountInWei, toToken, refetchQuote]);

  useEffect(() => {
    if (fromToken === "USDC" && address) {
      refetchAllowance();
    }
  }, [fromToken, address, refetchAllowance]);

  const handleApprove = async () => {
    if (!address) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }

    setIsApproving(true);
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [BASESWAP_ROUTER_ADDRESS, maxUint256],
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      await refetchAllowance();
      toast({ title: "授权成功", description: "USDC 授权已完成" });
    } catch (error: any) {
      toast({
        title: "授权失败",
        description: error?.shortMessage || error?.message || "请重试",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!address || !amountInWei || !amountOutMin) return;

    if (!isCorrectNetwork) {
      open?.({ view: "Networks" });
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60);
    setIsSwapping(true);

    try {
      const functionName = fromToken === "ETH" ? "swapExactETHForTokens" : "swapExactTokensForETH";
      const args =
        fromToken === "ETH"
          ? [amountOutMin, swapPath, address, deadline]
          : [amountInWei, amountOutMin, swapPath, address, deadline];

      const txHash = await writeContractAsync({
        address: BASESWAP_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName,
        args,
        value: fromToken === "ETH" ? amountInWei : undefined,
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      await Promise.all([refetchEthBalance(), refetchUsdcBalance()]);
      setAmountIn("");
      setAmountOut("");
      toast({ title: "兑换成功", description: "交易已在链上确认" });
    } catch (error: any) {
      toast({
        title: "兑换失败",
        description: error?.shortMessage || error?.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const insufficientBalance = useMemo(() => {
    if (!amountInWei || amountInWei <= 0n) return false;
    const balance = fromToken === "ETH" ? ethBalance?.value : usdcBalance?.value;
    if (!balance) return false;
    return balance < amountInWei;
  }, [amountInWei, fromToken, ethBalance, usdcBalance]);

  const buttonLabel = (() => {
    if (!isConnected) return "Connect Wallet";
    if (!isCorrectNetwork) return "Switch to Base";
    if (!amountIn || !amountInWei) return "Enter an amount";
    if (insufficientBalance) return `Insufficient ${fromToken}`;
    if (needsApproval) return isApproving ? "Approving..." : "Approve USDC";
    if (isSwapping) return "Swapping...";
    if (!amountOutWei) return "Fetching price...";
    return "Swap";
  })();

  const actionDisabled = (() => {
    if (!isConnected) return false;
    if (!isCorrectNetwork) return false;
    if (!amountIn || !amountInWei) return true;
    if (insufficientBalance) return true;
    if (needsApproval) return isApproving;
    return isSwapping || !amountOutWei || isFetchingQuote;
  })();

  const handlePrimaryAction = () => {
    if (!isConnected) {
      open?.();
      return;
    }
    if (!isCorrectNetwork) {
      open?.({ view: "Networks" });
      return;
    }
    if (needsApproval) {
      handleApprove();
      return;
    }
    handleSwap();
  };

  const resetAmounts = () => {
    setAmountIn("");
    setAmountOut("");
    setQuoteError(null);
  };

  const setDirection = (direction: "ETH" | "USDC") => {
    if (direction === fromToken) return;
    setFromToken(direction);
    resetAmounts();
  };

  const handleSwitchDirection = () => {
    setFromToken((prev) => (prev === "ETH" ? "USDC" : "ETH"));
    resetAmounts();
  };

  const fromBalanceDisplay = fromToken === "ETH"
    ? formatBalanceDisplay(ethBalance?.formatted, 4)
    : formatBalanceDisplay(usdcBalance?.formatted, 2);
  const toBalanceDisplay = toToken === "ETH"
    ? formatBalanceDisplay(ethBalance?.formatted, 4)
    : formatBalanceDisplay(usdcBalance?.formatted, 2);

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-slate-900/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Base Mainnet</p>
          <h2 className="text-lg font-semibold text-white">ETH ⇄ USDC Swap</h2>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          onClick={handleSwitchDirection}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-left ${
              fromToken === "ETH"
                ? "border-blue-500/70 bg-blue-500/10 text-white"
                : "border-slate-700 bg-slate-800 text-slate-300"
            }`}
            onClick={() => setDirection("ETH")}
          >
            ETH → USDC
          </button>
          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-left ${
              fromToken === "USDC"
                ? "border-blue-500/70 bg-blue-500/10 text-white"
                : "border-slate-700 bg-slate-800 text-slate-300"
            }`}
            onClick={() => setDirection("USDC")}
          >
            USDC → ETH
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>From</span>
            <span>Balance: {fromBalanceDisplay}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(event) => setAmountIn(event.target.value)}
              className="flex-1 bg-transparent text-2xl font-semibold text-white focus-visible:ring-blue-500"
              min="0"
              step="any"
            />
            <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white">
              {fromToken}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-1 text-slate-500">
          <ArrowLeftRight className="h-4 w-4" />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>To (estimated)</span>
            <span>Balance: {toBalanceDisplay}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Input
              value={amountOut ? amountOut : "-"}
              readOnly
              className="flex-1 bg-transparent text-2xl font-semibold text-slate-200"
            />
            <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white">
              {toToken}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Slippage</span>
            <span>1%</span>
          </div>
          {fromToken === "USDC" && (
            <div className="flex items-center justify-between">
              <span>Allowance</span>
              <span>
                {allowance
                  ? `${formatDisplayAmount(formatUnits(allowance, USDC_DECIMALS), "USDC")} USDC`
                  : "-"}
              </span>
            </div>
          )}
          {quoteError && (
            <div className="flex items-center gap-1 text-amber-400">
              <Info className="h-3 w-3" />
              {quoteError}
            </div>
          )}
          {insufficientBalance && (
            <div className="flex items-center gap-1 text-red-400">
              <Info className="h-3 w-3" />
              余额不足
            </div>
          )}
        </div>
      </div>

      <Button
        className="mt-5 w-full bg-blue-600 text-white hover:bg-blue-500"
        onClick={handlePrimaryAction}
        disabled={actionDisabled}
      >
        {(isSwapping || isApproving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonLabel}
      </Button>
    </div>
  );
}

function formatDisplayAmount(value: string, token: "ETH" | "USDC") {
  const decimals = token === "ETH" ? 6 : 2;
  if (!value.includes(".")) return value;
  const [whole, fraction = ""] = value.split(".");
  const trimmedFraction = fraction.slice(0, decimals).replace(/0+$/, "");
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

function formatBalanceDisplay(value?: string, decimals: number = 4) {
  if (!value) return "-";
  const [whole, fraction = ""] = value.split(".");
  if (!fraction) return whole;
  const trimmed = fraction.slice(0, decimals).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}
