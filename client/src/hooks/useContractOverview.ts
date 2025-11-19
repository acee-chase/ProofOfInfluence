import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { BASE_CHAIN_ID, POI_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/baseConfig";
import { CONTRACTS_CONFIG } from "@/config/contractsPlaygroundConfig";
import type { ContractHealth } from "@/components/dev/ContractHealthMonitor";

const POI_DECIMALS = 18;

export function useContractOverview() {
  const { address } = useAccount();

  // Read user's POI balance
  const { data: poiBalance } = useReadContract({
    address: POI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalPoiBalance =
      poiBalance && typeof poiBalance === "bigint"
        ? `${formatUnits(poiBalance, POI_DECIMALS)} POI`
        : "0 POI";

    return {
      totalPoiBalance,
      contractTVL: "$0", // TODO: Calculate from contract balances
      activeContracts: `${Object.keys(CONTRACTS_CONFIG).length}/${Object.keys(CONTRACTS_CONFIG).length}`,
      transactions24h: "0", // TODO: Fetch from subgraph or indexer
    };
  }, [poiBalance]);

  // Check contract health
  const contractHealth = useMemo((): ContractHealth[] => {
    return Object.entries(CONTRACTS_CONFIG).map(([key, config]) => {
      const isConfigured = config.address && config.address !== "0x0000000000000000000000000000000000000000";
      
      return {
        name: config.name,
        address: config.address,
        status: isConfigured ? "active" : "inactive",
        message: isConfigured ? undefined : "Not configured",
      };
    });
  }, []);

  return {
    stats,
    contractHealth,
  };
}

