/**
 * Real Market API Implementation
 * Connected with Codex backend
 */

import type { MarketApiInterface } from './types';

export const realMarketApi: MarketApiInterface = {
  async createOrder(data) {
    const res = await fetch('/api/market/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // Include cookies for authentication
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to create order' }));
      throw new Error(error.message || 'Failed to create order');
    }
    
    return res.json();
  },

  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const res = await fetch(`/api/market/orders?${params}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch orders' }));
      throw new Error(error.message || 'Failed to fetch orders');
    }
    
    return res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`/api/market/orders/${id}`, {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch order' }));
      throw new Error(error.message || 'Failed to fetch order');
    }
    
    return res.json();
  },

  async updateOrder(id, data) {
    const res = await fetch(`/api/market/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to update order' }));
      throw new Error(error.message || 'Failed to update order');
    }
    
    return res.json();
  },

  async cancelOrder(id) {
    const res = await fetch(`/api/market/orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to cancel order' }));
      throw new Error(error.message || 'Failed to cancel order');
    }
    
    return res.json();
  },

  async getOrderbook(pair) {
    const res = await fetch(`/api/market/orderbook?pair=${pair}`);
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch orderbook' }));
      throw new Error(error.message || 'Failed to fetch orderbook');
    }
    
    return res.json();
  },

  async getTrades(pair, limit = 50) {
    const res = await fetch(`/api/market/trades?pair=${pair}&limit=${limit}`);
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch trades' }));
      throw new Error(error.message || 'Failed to fetch trades');
    }
    
    return res.json();
  },

  async getStats(pair) {
    const res = await fetch(`/api/market/stats?pair=${pair}`);
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to fetch stats' }));
      throw new Error(error.message || 'Failed to fetch stats');
    }
    
    return res.json();
  },
};

