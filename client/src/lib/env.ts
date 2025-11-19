/**
 * Check if we're in a development environment
 */
export function isDevEnvironment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === "development";
}
