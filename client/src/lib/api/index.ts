/**
 * API Entry Point
 * Switches between mock and real API based on environment variables
 * Supports per-module control for gradual backend integration
 */

import { realMarketApi } from './market';
import { realReserveApi } from './reserve';
import { realMerchantApi } from './merchant';

import { mockMarketApi } from '../mocks/marketMock';
import { mockReserveApi } from '../mocks/reserveMock';
import { mockMerchantApi } from '../mocks/merchantMock';

import type { MarketApiInterface, ReserveApiInterface, MerchantApiInterface } from './types';

// Per-module environment control
// Allows using real API for Market while keeping Reserve/Merchant in mock mode
const USE_MOCK_MARKET = import.meta.env.VITE_USE_MOCK_MARKET !== 'false';
const USE_MOCK_RESERVE = import.meta.env.VITE_USE_MOCK_RESERVE !== 'false';
const USE_MOCK_MERCHANT = import.meta.env.VITE_USE_MOCK_MERCHANT !== 'false';

// Legacy global control (backward compatible)
const USE_MOCK_GLOBAL = import.meta.env.VITE_USE_MOCK_API;
if (USE_MOCK_GLOBAL !== undefined) {
  console.warn('[API] VITE_USE_MOCK_API is deprecated. Use VITE_USE_MOCK_MARKET, VITE_USE_MOCK_RESERVE, VITE_USE_MOCK_MERCHANT instead');
}

console.log(`[API] Market: ${USE_MOCK_MARKET ? 'MOCK' : 'REAL'}`);
console.log(`[API] Reserve Pool: ${USE_MOCK_RESERVE ? 'MOCK' : 'REAL'}`);
console.log(`[API] Merchant: ${USE_MOCK_MERCHANT ? 'MOCK' : 'REAL'}`);

// Export APIs with environment-based switching
export const marketApi: MarketApiInterface = USE_MOCK_MARKET ? mockMarketApi : realMarketApi;
export const reserveApi: ReserveApiInterface = USE_MOCK_RESERVE ? mockReserveApi : realReserveApi;
export const merchantApi: MerchantApiInterface = USE_MOCK_MERCHANT ? mockMerchantApi : realMerchantApi;

// Re-export types for convenience
export * from './types';

