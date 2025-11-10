/**
 * Merchant Access Control Hook
 * Checks if current user has merchant role and provides merchantId
 * 
 * In development mode (DEV_MODE_ADMIN=true), all users with admin role get merchant access
 * This is controlled server-side for security
 */

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useMerchantAccess() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Check if user has merchant or admin role (enforced by backend)
  // In dev mode with DEV_MODE_ADMIN=true, backend automatically assigns admin role
  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'merchant' || user?.role === 'admin';
  
  // Use userId as merchantId by default (per Codex backend design)
  const merchantId = user?.id;

  return {
    isMerchant,
    isAdmin,
    merchantId,
    canAccessMerchant: isMerchant,
  };
}

