import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export type UserRole = "guest" | "web3_connected" | "kyc_verified";

export interface AccessControl {
  role: UserRole;
  isGuest: boolean;
  isWeb3Connected: boolean;
  isKYCVerified: boolean;
  canAccessDashboard: boolean;
  canAccessBasicFeatures: boolean;
  canAccessAdvancedFeatures: boolean;
  canWithdraw: boolean;
  canTrade: boolean;
  canStake: boolean;
}

/**
 * Hook to determine user access level and permissions
 * Based on the access control matrix from the requirements:
 * - Guest: Can view public content only
 * - Web3 Connected: Can use basic features (trading, staking)
 * - KYC Verified: Can use all features (including withdrawal)
 */
export function useAccessControl(): AccessControl {
  const { isAuthenticated } = useAuth();

  // Fetch user data to check KYC status
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // In development mode with DEV_MODE_ADMIN=true, backend grants admin role
  // which gives full access to all features for testing
  const isAdmin = user?.role === 'admin';

  // Determine user role
  let role: UserRole = "guest";
  if (isAuthenticated) {
    // Check if user has completed KYC (assuming a kycVerified field exists)
    // You may need to adjust this based on your actual schema
    if ((user as any)?.kycVerified || isAdmin) {
      role = "kyc_verified";
    } else {
      role = "web3_connected";
    }
  }

  // Derive permissions from role
  const isGuest = role === "guest";
  const isWeb3Connected = role === "web3_connected" || role === "kyc_verified";
  const isKYCVerified = role === "kyc_verified" || isAdmin; // Admins bypass KYC requirement

  return {
    role,
    isGuest,
    isWeb3Connected,
    isKYCVerified,
    
    // Dashboard access requires at least wallet connection (or admin)
    canAccessDashboard: isWeb3Connected || isAdmin,
    
    // Basic features available to Web3 connected users (or admin)
    canAccessBasicFeatures: isWeb3Connected || isAdmin,
    
    // Advanced features require KYC (or admin)
    canAccessAdvancedFeatures: isKYCVerified || isAdmin,
    
    // Withdrawal requires KYC compliance (or admin)
    canWithdraw: isKYCVerified || isAdmin,
    
    // Trading available to Web3 connected users (or admin)
    canTrade: isWeb3Connected || isAdmin,
    
    // Staking available to Web3 connected users (or admin)
    canStake: isWeb3Connected || isAdmin,
  };
}
