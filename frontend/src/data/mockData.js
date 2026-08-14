// Mock data for MarketMind AI — aligned with UCI Online Retail Dataset
// Data model: Invoice, StockCode, Description, Quantity, InvoiceDate, Price, Customer ID, Country

// ===== Currency & Formatting Helpers =====
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '£0';
  const abs = Math.abs(value);
  if (abs >= 1000000) return `£${(value / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `£${(value / 1000).toFixed(1)}K`;
  return `£${value.toFixed(2)}`;
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('en-GB');
};

// ===== Overview Dashboard KPIs =====
export const overviewKPIs = {
  revenue: { value: 124500, change: 12.5, period: 'vs last month' },
  orders: { value: 1210, change: 8.3, period: 'vs last month' },
  customers: { value: 420, change: 15.2, period: 'vs last month' },
  returnRate: { value: 3.2, change: -0.8, period: 'vs last month', isNegativeGood: true },
};

// ===== Revenue Trend (Monthly, 12 months) =====
export const revenueTrendData = [
  { month: 'Jan', revenue: 68200, orders: 82 },
  { month: 'Feb', revenue: 72100, orders: 88 },
  { month: 'Mar', revenue: 81500, orders: 97 },
  { month: 'Apr', revenue: 76400, orders: 91 },
  { month: 'May', revenue: 88900, orders: 105 },
  { month: 'Jun', revenue: 92300, orders: 112 },
  { month: 'Jul', revenue: 97800, orders: 118 },
  { month: 'Aug', revenue: 95400, orders: 114 },
  { month: 'Sep', revenue: 103200, orders: 126 },
  { month: 'Oct', revenue: 112500, orders: 135 },
  { month: 'Nov', revenue: 136800, orders: 168 },
  { month: 'Dec', revenue: 124500, orders: 155 },
];

// ===== Active Alerts =====
export const activeAlerts = [
  { id: 1, type: 'zero_price', severity: 'critical', message: '2 invoices contain items with £0.00 price', reference: 'Invoice 536414, 536472', timestamp: '2 hours ago' },
  { id: 2, type: 'high_return', severity: 'warning', message: 'StockCode 85123A has 15% return rate (avg: 3%)', reference: 'WHITE HANGING HEART T-LIGHT HOLDER', timestamp: '5 hours ago' },
  { id: 3, type: 'high_return', severity: 'warning', message: 'StockCode 71053 has 8% return rate', reference: 'WHITE METAL LANTERN', timestamp: '1 day ago' },
  { id: 4, type: 'churn_risk', severity: 'high', message: '8 premium customers show declining purchase frequency', reference: 'Segment: Champions → At-Risk', timestamp: '1 day ago' },
  { id: 5, type: 'large_order', severity: 'info', message: 'Unusually large order: 2,000 units of PAPER CRAFT LITTLE BIRDIE', reference: 'Invoice 541431', timestamp: '2 days ago' },
  { id: 6, type: 'anomaly', severity: 'warning', message: 'Revenue spike detected: 340% above daily average', reference: 'Nov 14, 2011', timestamp: '3 days ago' },
];

// ===== Sales by Country =====
export const salesByCountryData = [
  { country: 'United Kingdom', revenue: 108420, orders: 1042, percentage: 87.1 },
  { country: 'Germany', revenue: 4280, orders: 42, percentage: 3.4 },
  { country: 'France', revenue: 3890, orders: 38, percentage: 3.1 },
  { country: 'EIRE', revenue: 2640, orders: 28, percentage: 2.1 },
  { country: 'Spain', revenue: 1520, orders: 18, percentage: 1.2 },
  { country: 'Netherlands', revenue: 1380, orders: 15, percentage: 1.1 },
  { country: 'Belgium', revenue: 980, orders: 11, percentage: 0.8 },
  { country: 'Others', revenue: 1390, orders: 16, percentage: 1.1 },
];

// ===== Top Products (by revenue) =====
export const topProducts = [
  { stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', unitsSold: 2028, revenue: 5171.40, avgPrice: 2.55 },
  { stockCode: '22423', description: 'REGENCY CAKESTAND 3 TIER', unitsSold: 1724, revenue: 18964.00, avgPrice: 11.00 },
  { stockCode: '47566', description: 'PARTY BUNTING', unitsSold: 1532, revenue: 6128.00, avgPrice: 4.00 },
  { stockCode: '84879', description: 'ASSORTED COLOUR BIRD ORNAMENT', unitsSold: 1418, revenue: 2396.42, avgPrice: 1.69 },
  { stockCode: '20725', description: 'LUNCH BAG RED RETROSPOT', unitsSold: 1380, revenue: 5382.00, avgPrice: 3.90 },
];

// ===== Recent Invoices =====
export const recentInvoices = [
  { invoiceNo: '536365', date: '2011-12-01 08:26', customerId: 17850, items: 7, total: 139.12, country: 'United Kingdom', isReturn: false },
  { invoiceNo: '536366', date: '2011-12-01 08:28', customerId: 17850, items: 2, total: 22.20, country: 'United Kingdom', isReturn: false },
  { invoiceNo: '536367', date: '2011-12-01 08:34', customerId: 13047, items: 12, total: 278.73, country: 'United Kingdom', isReturn: false },
  { invoiceNo: '536368', date: '2011-12-01 09:01', customerId: 13047, items: 4, total: 70.05, country: 'United Kingdom', isReturn: false },
  { invoiceNo: 'C536379', date: '2011-12-01 09:45', customerId: 14527, items: 1, total: -19.50, country: 'United Kingdom', isReturn: true },
  { invoiceNo: '536384', date: '2011-12-01 10:03', customerId: 15311, items: 16, total: 342.60, country: 'Germany', isReturn: false },
  { invoiceNo: '536386', date: '2011-12-01 10:18', customerId: 16029, items: 8, total: 168.90, country: 'France', isReturn: false },
  { invoiceNo: '536389', date: '2011-12-01 10:30', customerId: 12583, items: 24, total: 487.32, country: 'United Kingdom', isReturn: false },
  { invoiceNo: '536391', date: '2011-12-01 10:48', customerId: 17548, items: 5, total: 89.75, country: 'EIRE', isReturn: false },
  { invoiceNo: 'C536392', date: '2011-12-01 11:00', customerId: 13748, items: 3, total: -45.60, country: 'United Kingdom', isReturn: true },
];

// ===== Sales Dashboard Data =====
export const salesKPIs = {
  totalRevenue: { value: 124500, change: 12.5 },
  avgOrderValue: { value: 102.89, change: 5.2 },
  growthRate: { value: 12.5, change: 3.1 },
  itemsPerOrder: { value: 14.2, change: -1.3 },
};

export const dailySalesTrend = [
  { day: 'Mon', actual: 4200, forecast: null },
  { day: 'Tue', actual: 3800, forecast: null },
  { day: 'Wed', actual: 5100, forecast: null },
  { day: 'Thu', actual: 4700, forecast: null },
  { day: 'Fri', actual: 5600, forecast: null },
  { day: 'Sat', actual: 6200, forecast: null },
  { day: 'Sun', actual: 3900, forecast: null },
  { day: 'Mon+', actual: null, forecast: 4500 },
  { day: 'Tue+', actual: null, forecast: 4100 },
  { day: 'Wed+', actual: null, forecast: 5300 },
];

export const salesByHourData = [
  { hour: '6am', orders: 5 }, { hour: '7am', orders: 12 }, { hour: '8am', orders: 28 },
  { hour: '9am', orders: 45 }, { hour: '10am', orders: 68 }, { hour: '11am', orders: 72 },
  { hour: '12pm', orders: 85 }, { hour: '1pm', orders: 78 }, { hour: '2pm', orders: 65 },
  { hour: '3pm', orders: 58 }, { hour: '4pm', orders: 42 }, { hour: '5pm', orders: 35 },
  { hour: '6pm', orders: 48 }, { hour: '7pm', orders: 52 }, { hour: '8pm', orders: 38 },
  { hour: '9pm', orders: 22 },
];

export const revenueByCountryData = [
  { country: 'UK', revenue: 108420, prevRevenue: 95200 },
  { country: 'Germany', revenue: 4280, prevRevenue: 3800 },
  { country: 'France', revenue: 3890, prevRevenue: 4100 },
  { country: 'EIRE', revenue: 2640, prevRevenue: 2200 },
  { country: 'Spain', revenue: 1520, prevRevenue: 1100 },
  { country: 'Netherlands', revenue: 1380, prevRevenue: 1500 },
];

// All invoices for paginated table
export const allInvoices = [
  { invoiceNo: '536365', date: '2011-12-01 08:26', customerId: 17850, items: 7, total: 139.12, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: '536366', date: '2011-12-01 08:28', customerId: 17850, items: 2, total: 22.20, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: '536367', date: '2011-12-01 08:34', customerId: 13047, items: 12, total: 278.73, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: '536368', date: '2011-12-01 09:01', customerId: 13047, items: 4, total: 70.05, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: 'C536379', date: '2011-12-01 09:45', customerId: 14527, items: 1, total: -19.50, country: 'United Kingdom', isReturn: true, status: 'returned' },
  { invoiceNo: '536384', date: '2011-12-01 10:03', customerId: 15311, items: 16, total: 342.60, country: 'Germany', isReturn: false, status: 'completed' },
  { invoiceNo: '536386', date: '2011-12-01 10:18', customerId: 16029, items: 8, total: 168.90, country: 'France', isReturn: false, status: 'completed' },
  { invoiceNo: '536389', date: '2011-12-01 10:30', customerId: 12583, items: 24, total: 487.32, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: '536391', date: '2011-12-01 10:48', customerId: 17548, items: 5, total: 89.75, country: 'EIRE', isReturn: false, status: 'completed' },
  { invoiceNo: 'C536392', date: '2011-12-01 11:00', customerId: 13748, items: 3, total: -45.60, country: 'United Kingdom', isReturn: true, status: 'returned' },
  { invoiceNo: '536395', date: '2011-12-01 11:22', customerId: 14688, items: 6, total: 124.50, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: '536396', date: '2011-12-01 11:35', customerId: 17809, items: 18, total: 398.70, country: 'United Kingdom', isReturn: false, status: 'completed' },
  { invoiceNo: '536398', date: '2011-12-01 11:48', customerId: 15764, items: 3, total: 52.35, country: 'Spain', isReturn: false, status: 'completed' },
  { invoiceNo: '536400', date: '2011-12-01 12:05', customerId: 16227, items: 9, total: 215.10, country: 'Netherlands', isReturn: false, status: 'completed' },
  { invoiceNo: '536402', date: '2011-12-01 12:20', customerId: 14298, items: 11, total: 312.45, country: 'United Kingdom', isReturn: false, status: 'completed' },
];

// ===== Products (Inventory) Dashboard Data =====
export const productsKPIs = {
  totalProducts: { value: 3800 },
  unitsSold: { value: 84200, change: 6.4 },
  returnRate: { value: 3.2, change: -0.5 },
  avgPrice: { value: 2.80, change: 1.2 },
};

export const returnAlerts = [
  { stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', returnRate: 15.0, avgReturnRate: 3.0, severity: 'critical', unitsSold: 2028, unitsReturned: 304 },
  { stockCode: '71053', description: 'WHITE METAL LANTERN', returnRate: 8.0, avgReturnRate: 3.0, severity: 'warning', unitsSold: 856, unitsReturned: 68 },
  { stockCode: '84406B', description: 'CREAM CUPID HEARTS COAT HANGER', returnRate: 6.5, avgReturnRate: 3.0, severity: 'warning', unitsSold: 1120, unitsReturned: 73 },
];

export const topSellingProducts = [
  { stockCode: '22423', description: 'REGENCY CAKESTAND 3 TIER', unitsSold: 1724, revenue: 18964.00 },
  { stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', unitsSold: 2028, revenue: 5171.40 },
  { stockCode: '47566', description: 'PARTY BUNTING', unitsSold: 1532, revenue: 6128.00 },
  { stockCode: '20725', description: 'LUNCH BAG RED RETROSPOT', unitsSold: 1380, revenue: 5382.00 },
  { stockCode: '84879', description: 'ASSORTED COLOUR BIRD ORNAMENT', unitsSold: 1418, revenue: 2396.42 },
];

export const highestReturnProducts = [
  { stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', unitsReturned: 304, returnRate: 15.0 },
  { stockCode: '71053', description: 'WHITE METAL LANTERN', unitsReturned: 68, returnRate: 8.0 },
  { stockCode: '84406B', description: 'CREAM CUPID HEARTS COAT HANGER', unitsReturned: 73, returnRate: 6.5 },
  { stockCode: '22633', description: 'HAND WARMER UNION JACK', unitsReturned: 45, returnRate: 5.8 },
  { stockCode: '22086', description: 'PAPER CHAIN KIT 50S CHRISTMAS', unitsReturned: 38, returnRate: 5.2 },
];

export const allProducts = [
  { stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', category: 'Home Décor', unitsSold: 2028, unitsReturned: 304, avgPrice: 2.55, revenue: 5171.40 },
  { stockCode: '71053', description: 'WHITE METAL LANTERN', category: 'Home Décor', unitsSold: 856, unitsReturned: 68, avgPrice: 3.39, revenue: 2901.84 },
  { stockCode: '84406B', description: 'CREAM CUPID HEARTS COAT HANGER', category: 'Home Décor', unitsSold: 1120, unitsReturned: 73, avgPrice: 2.75, revenue: 3080.00 },
  { stockCode: '22423', description: 'REGENCY CAKESTAND 3 TIER', category: 'Kitchenware', unitsSold: 1724, unitsReturned: 18, avgPrice: 11.00, revenue: 18964.00 },
  { stockCode: '47566', description: 'PARTY BUNTING', category: 'Party Supplies', unitsSold: 1532, unitsReturned: 22, avgPrice: 4.00, revenue: 6128.00 },
  { stockCode: '84879', description: 'ASSORTED COLOUR BIRD ORNAMENT', category: 'Home Décor', unitsSold: 1418, unitsReturned: 15, avgPrice: 1.69, revenue: 2396.42 },
  { stockCode: '22633', description: 'HAND WARMER UNION JACK', category: 'Gifts', unitsSold: 780, unitsReturned: 45, avgPrice: 1.85, revenue: 1443.00 },
  { stockCode: '20725', description: 'LUNCH BAG RED RETROSPOT', category: 'Bags', unitsSold: 1380, unitsReturned: 28, avgPrice: 3.90, revenue: 5382.00 },
  { stockCode: '22086', description: 'PAPER CHAIN KIT 50S CHRISTMAS', category: 'Stationery', unitsSold: 735, unitsReturned: 38, avgPrice: 2.95, revenue: 2168.25 },
  { stockCode: '21212', description: 'PACK OF 72 RETROSPOT CAKE CASES', category: 'Kitchenware', unitsSold: 1645, unitsReturned: 12, avgPrice: 0.85, revenue: 1398.25 },
  { stockCode: '22469', description: 'HEART OF WICKER SMALL', category: 'Home Décor', unitsSold: 420, unitsReturned: 8, avgPrice: 1.65, revenue: 693.00 },
  { stockCode: '21977', description: 'PACK OF 60 PINK PAISLEY CAKE CASES', category: 'Kitchenware', unitsSold: 910, unitsReturned: 5, avgPrice: 0.85, revenue: 773.50 },
];

// ===== Customers Dashboard Data =====
export const customerKPIs = {
  knownCustomers: { value: 4372, change: 8.5 },
  premiumCustomers: { value: 420, change: 12.0 },
  atRiskCustomers: { value: 350, change: 5.2, isNegativeGood: true },
  avgLTV: { value: 1869, change: 9.8 },
};

// RFM Segments
export const customerSegments = [
  { name: 'Champions', count: 420, percentage: 9.6, color: '#6366f1', description: 'High R, F, M scores – best customers' },
  { name: 'Loyal Customers', count: 680, percentage: 15.6, color: '#10b981', description: 'High frequency and monetary value' },
  { name: 'Potential Loyalists', count: 520, percentage: 11.9, color: '#0ea5e9', description: 'Recent buyers with growing frequency' },
  { name: 'New Customers', count: 390, percentage: 8.9, color: '#f59e0b', description: 'Recent first-time buyers' },
  { name: 'At Risk', count: 350, percentage: 8.0, color: '#f43f5e', description: 'Previously active, declining engagement' },
  { name: 'Need Attention', count: 580, percentage: 13.3, color: '#8b5cf6', description: 'Above average R/F/M, starting to slip' },
  { name: 'About to Sleep', count: 440, percentage: 10.1, color: '#ec4899', description: 'Below average recency and frequency' },
  { name: 'Hibernating', count: 620, percentage: 14.2, color: '#94a3b8', description: 'Low activity across all RFM dimensions' },
  { name: 'Lost', count: 372, percentage: 8.5, color: '#64748b', description: 'Longest inactive, lowest scores' },
];

// RFM Scatter Plot Data (for bubble chart)
export const rfmScatterData = [
  { customerId: 17850, recency: 1, frequency: 45, monetary: 4287, segment: 'Champions', x: 95, y: 92 },
  { customerId: 13047, recency: 3, frequency: 38, monetary: 3650, segment: 'Champions', x: 88, y: 85 },
  { customerId: 14527, recency: 8, frequency: 32, monetary: 2980, segment: 'Loyal Customers', x: 78, y: 75 },
  { customerId: 15311, recency: 12, frequency: 28, monetary: 2450, segment: 'Loyal Customers', x: 70, y: 68 },
  { customerId: 16029, recency: 5, frequency: 12, monetary: 1800, segment: 'Potential Loyalists', x: 85, y: 45 },
  { customerId: 12583, recency: 2, frequency: 8, monetary: 950, segment: 'New Customers', x: 92, y: 30 },
  { customerId: 17548, recency: 45, frequency: 22, monetary: 3100, segment: 'At Risk', x: 25, y: 62 },
  { customerId: 13748, recency: 60, frequency: 18, monetary: 2650, segment: 'At Risk', x: 15, y: 55 },
  { customerId: 14688, recency: 30, frequency: 15, monetary: 1250, segment: 'Need Attention', x: 40, y: 42 },
  { customerId: 17809, recency: 90, frequency: 8, monetary: 800, segment: 'Hibernating', x: 8, y: 25 },
  { customerId: 15764, recency: 120, frequency: 5, monetary: 420, segment: 'Lost', x: 3, y: 15 },
  { customerId: 16227, recency: 15, frequency: 20, monetary: 1920, segment: 'Potential Loyalists', x: 65, y: 58 },
  { customerId: 14298, recency: 7, frequency: 35, monetary: 3200, segment: 'Champions', x: 82, y: 80 },
  { customerId: 18102, recency: 50, frequency: 10, monetary: 1100, segment: 'About to Sleep', x: 22, y: 35 },
  { customerId: 12431, recency: 75, frequency: 6, monetary: 580, segment: 'Hibernating', x: 12, y: 20 },
];

export const customerTable = [
  { customerId: 17850, segment: 'Champions', orders: 45, ltv: 4287, lastActive: '2011-12-01', country: 'United Kingdom', rfmScore: '5-5-5' },
  { customerId: 13047, segment: 'Champions', orders: 38, ltv: 3650, lastActive: '2011-12-01', country: 'United Kingdom', rfmScore: '5-5-4' },
  { customerId: 14298, segment: 'Champions', orders: 35, ltv: 3200, lastActive: '2011-11-28', country: 'United Kingdom', rfmScore: '5-4-4' },
  { customerId: 14527, segment: 'Loyal Customers', orders: 32, ltv: 2980, lastActive: '2011-11-25', country: 'United Kingdom', rfmScore: '4-4-4' },
  { customerId: 15311, segment: 'Loyal Customers', orders: 28, ltv: 2450, lastActive: '2011-11-20', country: 'Germany', rfmScore: '4-4-3' },
  { customerId: 16227, segment: 'Potential Loyalists', orders: 20, ltv: 1920, lastActive: '2011-11-18', country: 'Netherlands', rfmScore: '4-3-3' },
  { customerId: 16029, segment: 'Potential Loyalists', orders: 12, ltv: 1800, lastActive: '2011-11-28', country: 'France', rfmScore: '5-2-3' },
  { customerId: 12583, segment: 'New Customers', orders: 8, ltv: 950, lastActive: '2011-12-01', country: 'United Kingdom', rfmScore: '5-1-2' },
  { customerId: 17548, segment: 'At Risk', orders: 22, ltv: 3100, lastActive: '2011-10-18', country: 'EIRE', rfmScore: '2-3-4' },
  { customerId: 13748, segment: 'At Risk', orders: 18, ltv: 2650, lastActive: '2011-10-03', country: 'United Kingdom', rfmScore: '1-3-3' },
  { customerId: 14688, segment: 'Need Attention', orders: 15, ltv: 1250, lastActive: '2011-11-02', country: 'United Kingdom', rfmScore: '3-2-2' },
  { customerId: 18102, segment: 'About to Sleep', orders: 10, ltv: 1100, lastActive: '2011-10-12', country: 'Spain', rfmScore: '2-2-2' },
  { customerId: 17809, segment: 'Hibernating', orders: 8, ltv: 800, lastActive: '2011-09-03', country: 'United Kingdom', rfmScore: '1-1-1' },
  { customerId: 12431, segment: 'Lost', orders: 6, ltv: 580, lastActive: '2011-08-20', country: 'Belgium', rfmScore: '1-1-1' },
  { customerId: 15764, segment: 'Lost', orders: 5, ltv: 420, lastActive: '2011-08-05', country: 'Spain', rfmScore: '1-1-1' },
];

// ===== AI Insights Dashboard Data =====

// Forecast Chart Data
export const forecastChartData = [
  { month: 'Jan', actual: 68200 },
  { month: 'Feb', actual: 72100 },
  { month: 'Mar', actual: 81500 },
  { month: 'Apr', actual: 76400 },
  { month: 'May', actual: 88900 },
  { month: 'Jun', actual: 92300 },
  { month: 'Jul', actual: 97800 },
  { month: 'Aug', actual: 95400 },
  { month: 'Sep', actual: 103200 },
  { month: 'Oct', actual: 112500 },
  { month: 'Nov', actual: 136800 },
  { month: 'Dec', actual: 124500 },
  { month: 'Jan+', actual: null, forecast: 118000, lower: 108000, upper: 128000 },
  { month: 'Feb+', actual: null, forecast: 125000, lower: 113000, upper: 137000 },
  { month: 'Mar+', actual: null, forecast: 138000, lower: 124000, upper: 152000 },
];

// Model Comparison
export const modelComparison = [
  { model: 'Prophet', mae: 4250, rmse: 5800, r2: 0.87, status: 'Selected' },
  { model: 'XGBoost', mae: 4800, rmse: 6200, r2: 0.84, status: 'Available' },
  { model: 'Random Forest', mae: 5100, rmse: 6900, r2: 0.81, status: 'Available' },
];

// Churn Risk Panel
export const churnRiskData = [
  { customerId: 17548, segment: 'At Risk', churnProb: 0.82, ltv: 3100, lastActive: '2011-10-18', country: 'EIRE', riskLevel: 'High', action: 'Immediate Retention' },
  { customerId: 13748, segment: 'At Risk', churnProb: 0.78, ltv: 2650, lastActive: '2011-10-03', country: 'United Kingdom', riskLevel: 'High', action: 'Immediate Retention' },
  { customerId: 18102, segment: 'About to Sleep', churnProb: 0.65, ltv: 1100, lastActive: '2011-10-12', country: 'Spain', riskLevel: 'Medium', action: 'Engagement Campaign' },
  { customerId: 14688, segment: 'Need Attention', churnProb: 0.52, ltv: 1250, lastActive: '2011-11-02', country: 'United Kingdom', riskLevel: 'Medium', action: 'Engagement Campaign' },
  { customerId: 17809, segment: 'Hibernating', churnProb: 0.91, ltv: 800, lastActive: '2011-09-03', country: 'United Kingdom', riskLevel: 'High', action: 'Win-Back Offer' },
  { customerId: 12431, segment: 'Lost', churnProb: 0.95, ltv: 580, lastActive: '2011-08-20', country: 'Belgium', riskLevel: 'High', action: 'Win-Back Offer' },
  { customerId: 15764, segment: 'Lost', churnProb: 0.93, ltv: 420, lastActive: '2011-08-05', country: 'Spain', riskLevel: 'High', action: 'Win-Back Offer' },
  { customerId: 16227, segment: 'Potential Loyalists', churnProb: 0.28, ltv: 1920, lastActive: '2011-11-18', country: 'Netherlands', riskLevel: 'Low', action: 'Monitoring' },
];

// Product Recommendations
export const productRecommendations = [
  { customerId: 17850, customerSegment: 'Champions', recommendations: [
    { stockCode: '22423', description: 'REGENCY CAKESTAND 3 TIER', confidence: 0.92, type: 'Cross-sell' },
    { stockCode: '47566', description: 'PARTY BUNTING', confidence: 0.87, type: 'Frequently Bought Together' },
    { stockCode: '20725', description: 'LUNCH BAG RED RETROSPOT', confidence: 0.81, type: 'Similar Customers' },
  ]},
  { customerId: 13047, customerSegment: 'Champions', recommendations: [
    { stockCode: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER', confidence: 0.89, type: 'Cross-sell' },
    { stockCode: '22469', description: 'HEART OF WICKER SMALL', confidence: 0.84, type: 'Upsell' },
    { stockCode: '21212', description: 'PACK OF 72 RETROSPOT CAKE CASES', confidence: 0.76, type: 'Frequently Bought Together' },
  ]},
  { customerId: 14527, customerSegment: 'Loyal Customers', recommendations: [
    { stockCode: '84879', description: 'ASSORTED COLOUR BIRD ORNAMENT', confidence: 0.85, type: 'Similar Customers' },
    { stockCode: '22633', description: 'HAND WARMER UNION JACK', confidence: 0.79, type: 'Cross-sell' },
  ]},
];

// Anomaly Alerts for AI tab
export const anomalyAlerts = [
  { id: 1, type: 'PRICE_ZERO', referenceType: 'INVOICE', referenceId: '536414', description: 'Invoice contains items priced at £0.00', severity: 9.2, isResolved: false, detectedAt: '2011-12-01' },
  { id: 2, type: 'HIGH_RETURN', referenceType: 'PRODUCT', referenceId: '85123A', description: 'WHITE HANGING HEART T-LIGHT HOLDER: 15% return rate (5x above average)', severity: 7.8, isResolved: false, detectedAt: '2011-11-28' },
  { id: 3, type: 'LARGE_ORDER', referenceType: 'INVOICE', referenceId: '541431', description: 'Unusually large order: 2,000 units of single product', severity: 6.5, isResolved: true, detectedAt: '2011-11-25' },
  { id: 4, type: 'REVENUE_SPIKE', referenceType: 'DATE', referenceId: '2011-11-14', description: 'Daily revenue 340% above 30-day moving average', severity: 5.8, isResolved: true, detectedAt: '2011-11-14' },
  { id: 5, type: 'HIGH_RETURN', referenceType: 'PRODUCT', referenceId: '71053', description: 'WHITE METAL LANTERN: 8% return rate (2.7x above average)', severity: 5.2, isResolved: false, detectedAt: '2011-11-20' },
  { id: 6, type: 'NEGATIVE_PRICE', referenceType: 'INVOICE', referenceId: '536472', description: 'Invoice contains items with negative unit price (possible adjustment)', severity: 8.5, isResolved: false, detectedAt: '2011-12-01' },
];

// ===== Reports Page Data =====
export const reportCategories = [
  { id: 'sales', name: 'Sales Report', description: 'Revenue analysis, order trends, country breakdown, and top products', icon: '📊' },
  { id: 'inventory', name: 'Product Report', description: 'Product performance, return rates, stock movement analysis', icon: '📦' },
  { id: 'customer', name: 'Customer Report', description: 'RFM segmentation, customer lifetime value, geographic distribution', icon: '👥' },
  { id: 'forecast', name: 'Forecast Report', description: 'Revenue predictions, demand forecasts, model accuracy metrics', icon: '🔮' },
  { id: 'anomaly', name: 'Anomaly Report', description: 'Detected anomalies, suspicious transactions, outlier analysis', icon: '🚨' },
  { id: 'performance', name: 'Performance Report', description: 'Business KPIs, targets vs actuals, growth metrics', icon: '🎯' },
];

export const recentReports = [
  { id: 1, name: 'Monthly Sales Summary - December 2011', type: 'Sales Report', generatedAt: '2011-12-01 09:30', format: 'PDF', size: '2.4 MB' },
  { id: 2, name: 'Product Return Analysis Q4 2011', type: 'Product Report', generatedAt: '2011-11-28 14:15', format: 'CSV', size: '856 KB' },
  { id: 3, name: 'Customer Segmentation Report', type: 'Customer Report', generatedAt: '2011-11-25 11:00', format: 'PDF', size: '3.1 MB' },
  { id: 4, name: 'Revenue Forecast - January 2012', type: 'Forecast Report', generatedAt: '2011-11-22 16:45', format: 'PDF', size: '1.8 MB' },
  { id: 5, name: 'Anomaly Detection Log - November 2011', type: 'Anomaly Report', generatedAt: '2011-11-20 10:00', format: 'CSV', size: '420 KB' },
];

// Revenue by category for reports chart
export const revenueByCategoryMonthly = [
  { month: 'Jul', HomeDécor: 28200, Kitchenware: 18500, PartySupplies: 12800, Bags: 9200, Stationery: 6400, Gifts: 8100, Other: 14600 },
  { month: 'Aug', HomeDécor: 26800, Kitchenware: 17200, PartySupplies: 11500, Bags: 8800, Stationery: 6100, Gifts: 7900, Other: 17100 },
  { month: 'Sep', HomeDécor: 31500, Kitchenware: 20100, PartySupplies: 14200, Bags: 10500, Stationery: 7200, Gifts: 9100, Other: 10600 },
  { month: 'Oct', HomeDécor: 34200, Kitchenware: 22800, PartySupplies: 16500, Bags: 11200, Stationery: 7800, Gifts: 9800, Other: 10200 },
  { month: 'Nov', HomeDécor: 42500, Kitchenware: 28900, PartySupplies: 22100, Bags: 14500, Stationery: 9200, Gifts: 11800, Other: 7800 },
  { month: 'Dec', HomeDécor: 38100, Kitchenware: 25200, PartySupplies: 18800, Bags: 12800, Stationery: 8400, Gifts: 10200, Other: 11000 },
];
