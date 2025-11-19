import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

const DEMO_USER_STORAGE_KEY = "demoUserId";

export function useDemoUser() {
  const [location, setLocation] = useLocation();
  const [selectedDemoUserId, setSelectedDemoUserIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(DEMO_USER_STORAGE_KEY);
    }
    return null;
  });

  // Listen to URL query parameter
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const demoUserIdFromUrl = urlParams.get("demoUserId");

    if (demoUserIdFromUrl) {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, demoUserIdFromUrl);
      setSelectedDemoUserIdState(demoUserIdFromUrl);
    }
  }, [location]);

  const setDemoUserId = useCallback((userId: string | null) => {
    if (typeof window !== "undefined") {
      if (userId) {
        localStorage.setItem(DEMO_USER_STORAGE_KEY, userId);
      } else {
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }
    }
    setSelectedDemoUserIdState(userId);
  }, []);

  const clearDemoUser = useCallback(() => {
    setDemoUserId(null);
  }, [setDemoUserId]);

  const isUsingDemoUser = selectedDemoUserId !== null;

  return {
    selectedDemoUserId,
    setDemoUserId,
    clearDemoUser,
    isUsingDemoUser,
  };
}
