import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Get demo user ID from localStorage (if available)
 */
function getDemoUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("demoUserId");
}

/**
 * Add demoUserId to URL or headers
 */
function addDemoUserIdToRequest(url: string, headers: HeadersInit = {}): { url: string; headers: HeadersInit } {
  const demoUserId = getDemoUserId();
  if (!demoUserId) {
    return { url, headers };
  }

  // Add as query parameter
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set("demoUserId", demoUserId);
    url = urlObj.pathname + urlObj.search;
  } catch (e) {
    // If URL parsing fails, append as query param manually
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}demoUserId=${encodeURIComponent(demoUserId)}`;
  }
  
  // Also add as header
  const headersObj = new Headers(headers);
  headersObj.set("x-demo-user-id", demoUserId);

  return { url, headers: headersObj };
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const { url: finalUrl, headers: finalHeaders } = addDemoUserIdToRequest(url, data ? { "Content-Type": "application/json" } : {});
  
  const res = await fetch(finalUrl, {
    method,
    headers: finalHeaders,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const { url: finalUrl, headers: finalHeaders } = addDemoUserIdToRequest(url);
    
    const res = await fetch(finalUrl, {
      credentials: "include",
      headers: finalHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
