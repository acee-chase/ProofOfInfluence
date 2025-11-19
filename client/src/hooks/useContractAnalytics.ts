import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { BASE_CHAIN_ID, POI_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/baseConfig";
import { CONTRACTS_CONFIG } from "@/config/contractsPlaygroundConfig";

const POI_DECIMALS = 18;

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export function useContractAnalytics() {
  // Read POI token total supply
  const { data: totalSupply } = useReadContract({
    address: POI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "totalSupply",
    query: { enabled: !!POI_TOKEN_ADDRESS },
  });

  // Calculate POI distribution (placeholder - would need more contract reads for real data)
  const poiDistribution: ChartData[] = useMemo(() => {
    if (!totalSupply || typeof totalSupply !== "bigint") {
      return [
        { name: "TGE Sale", value: 0, color: "#06b6d4" },
        { name: "Staking Rewards", value: 0, color: "#8b5cf6" },
        { name: "Vesting Vault", value: 0, color: "#ec4899" },
        { name: "Circulating", value: 0, color: "#10b981" },
      ];
    }

    const total = Number(formatUnits(totalSupply, POI_DECIMALS));
    
    // Placeholder distribution (would need actual contract balances)
    return [
      { name: "TGE Sale", value: total * 0.3, color: "#06b6d4" },
      { name: "Staking Rewards", value: total * 0.2, color: "#8b5cf6" },
      { name: "Vesting Vault", value: total * 0.2, color: "#ec4899" },
      { name: "Circulating", value: total * 0.3, color: "#10b981" },
    ];
  }, [totalSupply]);

  // Contract activity (placeholder - would need transaction history)
  const contractActivity: ChartData[] = useMemo(() => {
    return Object.entries(CONTRACTS_CONFIG).map(([key, config]) => ({
      name: config.name,
      value: Math.floor(Math.random() * 1000), // Placeholder
      color: key === "tgeSale" ? "#06b6d4" : key === "stakingRewards" ? "#8b5cf6" : "#ec4899",
    }));
  }, []);

  // TVL trend (placeholder - would need historical data)
  const tvlTrend: ChartData[] = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => ({
      name: day,
      value: 1000000 + Math.floor(Math.random() * 500000), // Placeholder
    }));
  }, []);

  return {
    poiDistribution,
    contractActivity,
    tvlTrend,
  };
}

