// @ts-nocheck
/**
 * Merchant Mock API
 * Simulates backend Merchant API with realistic data
 */

import type {
  MerchantApiInterface,
  Product,
  CreateProductRequest,
  MerchantOrder,
  TaxReport,
  GenerateTaxReportRequest,
  MerchantAnalytics,
} from '../api/types';

// Mock products storage
let mockProducts: Product[] = [
  {
    id: '1',
    merchantId: 'merchant-001',
    title: 'Premium Influence Package',
    sku: 'INF-001',
    description: '包含完整的影响力营销工具包',
    price: 299.99,
    currency: 'USDC',
    status: 'ACTIVE',
    media: ['https://via.placeholder.com/400'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    merchantId: 'merchant-001',
    title: 'Basic Marketing Tools',
    sku: 'MKT-002',
    description: '基础营销工具套装',
    price: 99.99,
    currency: 'USDC',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock orders storage
let mockOrders: MerchantOrder[] = [
  {
    id: '1',
    productId: '1',
    merchantId: 'merchant-001',
    buyerId: 'buyer-001',
    amount: 299.99,
    fee: 8.99,
    status: 'COMPLETED',
    txRef: '0x1234...5678',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    productId: '2',
    merchantId: 'merchant-001',
    buyerId: 'buyer-002',
    amount: 99.99,
    fee: 2.99,
    status: 'PAID',
    txRef: '0x8765...4321',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    productId: '1',
    merchantId: 'merchant-001',
    buyerId: 'buyer-003',
    amount: 299.99,
    fee: 8.99,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock tax reports storage
let mockTaxReports: TaxReport[] = [
  {
    id: '1',
    merchantId: 'merchant-001',
    periodStart: '2024-01-01',
    periodEnd: '2024-03-31',
    grossSales: 5432.50,
    platformFees: 163.00,
    netAmount: 5269.50,
    taxableAmount: 5269.50,
    fileUrl: '/reports/tax-q1-2024.pdf',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
export const mockMerchantApi: MerchantApiInterface = {
  async getProducts(): Promise<Product[]> {
    await delay(300);
    return [...mockProducts];
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    await delay(400);

    const newProduct: Product = {
      id: `${Date.now()}`,
      merchantId: 'merchant-001',
      title: data.title,
      sku: data.sku,
      description: data.description,
      price: data.price,
      currency: data.currency || 'USDC',
      status: 'ACTIVE',
      media: data.media,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts = [newProduct, ...mockProducts];
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    await delay(300);

    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update product
    if (data.title) product.title = data.title;
    if (data.sku) product.sku = data.sku;
    if (data.description !== undefined) product.description = data.description;
    if (data.price) product.price = data.price;
    if (data.currency) product.currency = data.currency;
    if (data.media) product.media = data.media;
    product.updatedAt = new Date().toISOString();

    return product;
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    await delay(300);

    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }

    mockProducts.splice(index, 1);
    return { success: true };
  },

  async getOrders(): Promise<MerchantOrder[]> {
    await delay(300);
    return [...mockOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getOrderById(id: string): Promise<MerchantOrder> {
    await delay(200);

    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  },

  async updateOrderStatus(id: string, status: MerchantOrder['status']): Promise<MerchantOrder> {
    await delay(300);

    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return order;
  },

  async getTaxReports(): Promise<TaxReport[]> {
    await delay(300);
    return [...mockTaxReports].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async generateTaxReport(data: GenerateTaxReportRequest): Promise<TaxReport> {
    await delay(500);

    // Calculate from orders
    const ordersInPeriod = mockOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const startDate = new Date(data.periodStart);
      const endDate = new Date(data.periodEnd);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const grossSales = ordersInPeriod.reduce((sum, o) => sum + o.amount, 0);
    const platformFees = ordersInPeriod.reduce((sum, o) => sum + o.fee, 0);
    const netAmount = grossSales - platformFees;

    const newReport: TaxReport = {
      id: `${Date.now()}`,
      merchantId: 'merchant-001',
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      grossSales,
      platformFees,
      netAmount,
      taxableAmount: netAmount,
      fileUrl: `/reports/tax-${Date.now()}.pdf`,
      createdAt: new Date().toISOString(),
    };

    mockTaxReports = [newReport, ...mockTaxReports];
    return newReport;
  },

  async downloadTaxReport(id: string): Promise<Blob> {
    await delay(500);

    const report = mockTaxReports.find(r => r.id === id);
    if (!report) {
      throw new Error('Tax report not found');
    }

    // Create a mock PDF blob
    const content = `Tax Report
Period: ${report.periodStart} to ${report.periodEnd}
Gross Sales: $${report.grossSales}
Platform Fees: $${report.platformFees}
Net Amount: $${report.netAmount}
`;

    return new Blob([content], { type: 'application/pdf' });
  },

  async getAnalytics(): Promise<MerchantAnalytics> {
    await delay(300);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weekOrders = mockOrders.filter(o => new Date(o.createdAt) >= weekAgo);
    const monthOrders = mockOrders.filter(o => new Date(o.createdAt) >= monthAgo);

    const weekSales = weekOrders.reduce((sum, o) => sum + o.amount, 0);
    const weekFees = weekOrders.reduce((sum, o) => sum + o.fee, 0);

    const monthSales = monthOrders.reduce((sum, o) => sum + o.amount, 0);
    const monthFees = monthOrders.reduce((sum, o) => sum + o.fee, 0);

    return {
      thisWeek: {
        sales: weekSales.toFixed(2),
        orders: weekOrders.length,
        fees: weekFees.toFixed(2),
      },
      thisMonth: {
        sales: monthSales.toFixed(2),
        orders: monthOrders.length,
        fees: monthFees.toFixed(2),
      },
    };
  },
};

