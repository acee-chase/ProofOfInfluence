import { useAccount, useBalance, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { useCallback, useMemo, useState } from "react";
import { formatUnits } from "viem";
import {
  BASE_CHAIN_ID,
  ERC20_ABI,
  TGESALE_ABI,
  TGESALE_ADDRESS,
  USDC_ADDRESS,
} from "@/lib/baseConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC_UNIT = 6;
const POI_UNIT = 18;

export interface TgeSaleInfo {
  currentTier: bigint | null;
  pricePerToken: bigint | null;
  remainingTokens: bigint | null;
  minContribution: bigint | null;
  maxContribution: bigint | null;
  totalRaised: bigint | null;
  userContribution: bigint | null;
}

export interface UseTgeSaleState {
  sale: TgeSaleInfo;
  usdcBalance: bigint;
  allowance: bigint;
  isLoading: boolean;
  refetchAll: () => Promise<void>;
  isSaleConfigured: boolean;
}

export interface UseTgeActionsResult {
  approveUsdc: (amount: bigint) => Promise<`0x${string}`>;
  purchase: (amount: bigint) => Promise<`0x${string}`>;
  isApproving: boolean;
  isPurchasing: boolean;
}

const isValidAddress = (value: string | undefined): value is `0x${string}` =>
  Boolean(value && value.startsWith("0x") && value.length === 42);

export function useTgeSaleState(): UseTgeSaleState {
  const { address } = useAccount();
  const saleAddress = isValidAddress(TGESALE_ADDRESS) ? TGESALE_ADDRESS : ZERO_ADDRESS;
  const usdcAddress = isValidAddress(USDC_ADDRESS) ? USDC_ADDRESS : ZERO_ADDRESS;
  const enabled = saleAddress !== ZERO_ADDRESS;
  const hasWallet = Boolean(address);

  const {
    data: usdcBalanceData,
    refetch: refetchUsdcBalance,
    isFetching: isFetchingUsdcBalance,
  } = useBalance({
    address,
    token: usdcAddress,
    chainId: BASE_CHAIN_ID,
    query: { enabled: enabled && hasWallet && usdcAddress !== ZERO_ADDRESS },
  });

  const {
    data: allowanceData,
    refetch: refetchAllowance,
    isFetching: isFetchingAllowance,
  } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [hasWallet ? (address as `0x${string}`) : ZERO_ADDRESS, saleAddress],
    query: { enabled: enabled && hasWallet && usdcAddress !== ZERO_ADDRESS },
  });

  const {
    data: currentTierData,
    refetch: refetchCurrentTier,
    isFetching: isFetchingTierIndex,
  } = useReadContract({
    address: saleAddress,
    abi: TGESALE_ABI,
    functionName: "currentTier",
    query: { enabled },
  });

  const currentTier = currentTierData ?? null;

  const {
    data: tierData,
    refetch: refetchTierData,
    isFetching: isFetchingTier,
  } = useReadContract({
    address: saleAddress,
    abi: TGESALE_ABI,
    functionName: "tiers",
    args: [currentTier ?? 0n],
    query: { enabled: enabled && currentTier !== null },
  });

  const {
    data: minContribution,
    refetch: refetchMinContribution,
    isFetching: isFetchingMin,
  } = useReadContract({
    address: saleAddress,
    abi: TGESALE_ABI,
    functionName: "minContribution",
    query: { enabled },
  });

  const {
    data: maxContribution,
    refetch: refetchMaxContribution,
    isFetching: isFetchingMax,
  } = useReadContract({
    address: saleAddress,
    abi: TGESALE_ABI,
    functionName: "maxContribution",
    query: { enabled },
  });

  const {
    data: totalRaised,
    refetch: refetchTotalRaised,
    isFetching: isFetchingTotalRaised,
  } = useReadContract({
    address: saleAddress,
    abi: TGESALE_ABI,
    functionName: "totalRaised",
    query: { enabled },
  });

  const {
    data: userContribution,
    refetch: refetchUserContribution,
    isFetching: isFetchingUserContribution,
  } = useReadContract({
    address: saleAddress,
    abi: TGESALE_ABI,
    functionName: "contributedUSDC",
    args: [hasWallet ? (address as `0x${string}`) : ZERO_ADDRESS],
    query: { enabled: enabled && hasWallet },
  });

  const sale: TgeSaleInfo = useMemo(() => {
    const pricePerToken = tierData?.[0] ?? null;
    const remainingTokens = tierData?.[1] ?? null;

    return {
      currentTier,
      pricePerToken,
      remainingTokens,
      minContribution: minContribution ?? null,
      maxContribution: maxContribution ?? null,
      totalRaised: totalRaised ?? null,
      userContribution: userContribution ?? null,
    };
  }, [currentTier, tierData, minContribution, maxContribution, totalRaised, userContribution]);

  const usdcBalance = usdcBalanceData?.value ?? 0n;
  const allowance = allowanceData ?? 0n;
  const isLoading =
    !enabled ||
    isFetchingUsdcBalance ||
    isFetchingAllowance ||
    isFetchingTierIndex ||
    isFetchingTier ||
    isFetchingMin ||
    isFetchingMax ||
    isFetchingTotalRaised ||
    isFetchingUserContribution;

  const refetchAll = useCallback(async () => {
    const tasks: Array<Promise<unknown>> = [];
    tasks.push(refetchUsdcBalance());
    tasks.push(refetchAllowance());
    tasks.push(refetchCurrentTier());
    tasks.push(refetchTierData());
    tasks.push(refetchMinContribution());
    tasks.push(refetchMaxContribution());
    tasks.push(refetchTotalRaised());
    tasks.push(refetchUserContribution());
    await Promise.allSettled(tasks);
  }, [
    refetchAllowance,
    refetchCurrentTier,
    refetchMaxContribution,
    refetchMinContribution,
    refetchTierData,
    refetchTotalRaised,
    refetchUsdcBalance,
    refetchUserContribution,
  ]);

  return {
    sale,
    usdcBalance,
    allowance,
    isLoading,
    refetchAll,
    isSaleConfigured: enabled && saleAddress !== ZERO_ADDRESS,
  };
}

export function useTgeActions(options?: { onSettled?: () => Promise<void> | void }): UseTgeActionsResult {
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const onSettled = options?.onSettled;
  const saleAddress = isValidAddress(TGESALE_ADDRESS) ? TGESALE_ADDRESS : ZERO_ADDRESS;
  const usdcAddress = isValidAddress(USDC_ADDRESS) ? USDC_ADDRESS : ZERO_ADDRESS;

  const [isApproving, setIsApproving] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const waitReceipt = useCallback(
    async (hash: `0x${string}`) => {
      if (!publicClient) {
        return hash;
      }
      await publicClient.waitForTransactionReceipt({ hash });
      if (onSettled) {
        await onSettled();
      }
      return hash;
    },
    [publicClient, onSettled],
  );

  const approveUsdc = useCallback(
    async (amount: bigint) => {
      if (usdcAddress === ZERO_ADDRESS || saleAddress === ZERO_ADDRESS) {
        throw new Error("Contracts not configured");
      }
      setIsApproving(true);
      try {
        const hash = await writeContractAsync({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [saleAddress, amount],
        });
        return await waitReceipt(hash);
      } finally {
        setIsApproving(false);
      }
    },
    [saleAddress, usdcAddress, waitReceipt, writeContractAsync],
  );

  const purchase = useCallback(
    async (amount: bigint) => {
      if (saleAddress === ZERO_ADDRESS) {
        throw new Error("TGESale contract not configured");
      }
      setIsPurchasing(true);
      try {
        const hash = await writeContractAsync({
          address: saleAddress,
          abi: TGESALE_ABI,
          functionName: "purchase",
          args: [amount, []],
        });
        return await waitReceipt(hash);
      } finally {
        setIsPurchasing(false);
      }
    },
    [saleAddress, waitReceipt, writeContractAsync],
  );

  return {
    approveUsdc,
    purchase,
    isApproving,
    isPurchasing,
  };
}

export const formatUsdc = (value: bigint | null) => {
  if (value === null) return "--";
  return Number(formatUnits(value, USDC_UNIT)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatPoi = (value: bigint | null) => {
  if (value === null) return "--";
  return Number(formatUnits(value, POI_UNIT)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

