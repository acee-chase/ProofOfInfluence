/**
 * Environment detection utilities
 * 用于检测当前运行环境（dev/staging/production）
 */

/**
 * 检查是否为开发/测试环境
 * 通过检查 VITE_ENV 或 NODE_ENV 来判断
 */
export function isDevEnvironment(): boolean {
  // 检查 VITE_ENV
  const viteEnv = import.meta.env.VITE_ENV;
  if (viteEnv === "development" || viteEnv === "dev" || viteEnv === "staging") {
    return true;
  }

  // 检查 NODE_ENV（开发模式）
  const nodeEnv = import.meta.env.MODE;
  if (nodeEnv === "development") {
    return true;
  }

  // 检查 localhost（本地开发）
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.includes("localhost")) {
      return true;
    }
  }

  // 默认在生产环境返回 false
  return false;
}

/**
 * 检查是否为生产环境
 */
export function isProductionEnvironment(): boolean {
  return !isDevEnvironment();
}

