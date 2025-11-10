/**
 * Admin Access Control Hook
 * Checks if current user has admin role for Reserve Pool access
 * 
 * In development mode (DEV_MODE_ADMIN=true), all users automatically get admin access
 * This is controlled server-side for security
 */

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAdminAccess() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Check if user has admin role (enforced by backend)
  // In dev mode with DEV_MODE_ADMIN=true, backend automatically assigns admin role
  const isAdmin = user?.role === 'admin';
  
  return {
    isAdmin,
    canAccessReservePool: isAdmin,
  };
}

