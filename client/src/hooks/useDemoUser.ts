import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { isDevEnvironment } from "@/lib/env";
import { useAuth } from "./useAuth";

export interface DemoUser {
  walletId: string;
  address: string;
  label: string;
  createdAt: string;
  userId: string | null;
  email: string | null;
  username: string | null;
}

/**
 * Hook to manage demo user selection for Immortality page
 * Only available in dev/staging environments
 */
export function useDemoUser() {
  const [selectedDemoUserId, setSelectedDemoUserId] = useState<string | null>(null);
  const isDev = isDevEnvironment();

  const { isAuthenticated } = useAuth();

  // Fetch demo users list
  const { data: demoUsers = [], isLoading } = useQuery<DemoUser[]>({
    queryKey: ["/api/test/demo-users"],
    queryFn: getQueryFn<DemoUser[]>({ on401: "returnNull" }),
    enabled: isDev && isAuthenticated,
    retry: false,
  });

  // Get selected demo user
  const selectedDemoUser = selectedDemoUserId
    ? demoUsers.find((u) => u.walletId === selectedDemoUserId || u.userId === selectedDemoUserId)
    : null;

  // Clear selection when switching back to real user
  const clearDemoUser = () => {
    setSelectedDemoUserId(null);
    // Clear from localStorage
    localStorage.removeItem("demo_user_id");
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (isDev) {
      const saved = localStorage.getItem("demo_user_id");
      if (saved && demoUsers.some((u) => u.walletId === saved || u.userId === saved)) {
        setSelectedDemoUserId(saved);
      }
    }
  }, [isDev, demoUsers]);

  // Save to localStorage when selection changes
  useEffect(() => {
    if (selectedDemoUserId) {
      localStorage.setItem("demo_user_id", selectedDemoUserId);
    } else {
      localStorage.removeItem("demo_user_id");
    }
  }, [selectedDemoUserId]);

  return {
    isDev,
    demoUsers,
    isLoading,
    selectedDemoUser,
    selectedDemoUserId,
    setSelectedDemoUserId,
    clearDemoUser,
    isUsingDemoUser: !!selectedDemoUser,
  };
}

