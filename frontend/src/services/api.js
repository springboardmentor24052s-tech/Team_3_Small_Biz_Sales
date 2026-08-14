// API Client Service connecting Frontend React to FastAPI Backend

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function fetchAPI(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `API Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[MarketMind API] ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  // Sales
  getInvoices: (params = '') => fetchAPI(`/sales${params}`),
  getSalesSummary: () => fetchAPI('/sales/summary'),
  getRevenueTrends: () => fetchAPI('/sales/trends'),
  getSalesByCountry: () => fetchAPI('/sales/by-country'),
  getSalesByHour: () => fetchAPI('/sales/by-hour'),

  // Products
  getProducts: (params = '') => fetchAPI(`/products${params}`),
  getReturnAlerts: () => fetchAPI('/products/alerts'),

  // Customers
  getCustomers: (params = '') => fetchAPI(`/customers${params}`),
  getCustomerSegments: () => fetchAPI('/customers/segments'),
  getRFMScatter: () => fetchAPI('/customers/rfm-scatter'),

  // Customer Segmentation (K-Means & Unsupervised Learning)
  getSegmentationSummary: () => fetchAPI('/segmentation/summary'),
  getSegmentationClusters: () => fetchAPI('/segmentation/clusters'),
  getSegmentationCustomers: (params = '') => fetchAPI(`/segmentation/customers${params}`),
  getSegmentationMetrics: () => fetchAPI('/segmentation/metrics'),
  getSegmentationCustomerDetail: (customerId) => fetchAPI(`/segmentation/customers/${customerId}`),
  trainSegmentation: (minK = 2, maxK = 8) => fetchAPI(`/segmentation/train?min_k=${minK}&max_k=${maxK}`, { method: 'POST' }),
  predictSegmentation: (features) => fetchAPI('/segmentation/predict', { method: 'POST', body: JSON.stringify(features) }),

  // AI Insights
  getRevenueForecast: () => fetchAPI('/ai/forecast/revenue'),
  getChurnScores: () => fetchAPI('/ai/churn/scores'),
  getRecommendations: () => fetchAPI('/ai/recommendations'),
  getAnomalies: () => fetchAPI('/ai/anomalies'),
  retrainModels: () => fetchAPI('/ai/retrain', { method: 'POST' }),

  // Upload
  uploadSalesCSV: (formData) => fetch(`${API_BASE_URL}/upload/sales`, { method: 'POST', body: formData }),
};
