import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Search, Download, Package, TrendingUp, RotateCcw, DollarSign,
  AlertTriangle, ArrowUpRight, Eye,
} from 'lucide-react';
import {
  productsKPIs, returnAlerts, topSellingProducts, highestReturnProducts,
  allProducts, formatCurrency, formatNumber,
} from '../../data/mockData';
import './Inventory.css';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('unitsSold');

  const categories = [...new Set(allProducts.map(p => p.category))];

  const filtered = allProducts
    .filter((p) => {
      const matchesSearch =
        p.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="page-content animate-in">
      {/* Product KPIs */}
      <div className="sales-kpi-row" id="product-kpi-section">
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
            <Package size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Total Products</span>
            <span className="sales-kpi-value">{formatNumber(productsKPIs.totalProducts.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Units Sold</span>
            <span className="sales-kpi-value">{formatNumber(productsKPIs.unitsSold.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
            <RotateCcw size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Return Rate</span>
            <span className="sales-kpi-value">{productsKPIs.returnRate.value}%</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Avg Price</span>
            <span className="sales-kpi-value">£{productsKPIs.avgPrice.value.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Return Alerts */}
      <div className="card" style={{ marginBottom: '24px' }} id="return-alerts">
        <div className="card-header">
          <h3>🚨 Return Alerts — High Return Rate Products</h3>
          <span className="badge danger">{returnAlerts.length} Flagged</span>
        </div>
        <div className="card-body">
          <div className="return-alerts-list">
            {returnAlerts.map((alert) => (
              <div key={alert.stockCode} className={`return-alert-item ${alert.severity}`}>
                <div className="return-alert-indicator">
                  {alert.severity === 'critical' ? '🔴' : '⚠️'}
                </div>
                <div className="return-alert-content">
                  <div className="return-alert-header">
                    <span className="return-alert-code">{alert.stockCode}</span>
                    <span className="return-alert-name">{alert.description}</span>
                  </div>
                  <div className="return-alert-stats">
                    <span className="return-rate-value">{alert.returnRate}% return rate</span>
                    <span className="return-rate-avg">(Avg: {alert.avgReturnRate}%)</span>
                    <span className="return-units">{alert.unitsReturned} / {alert.unitsSold} units</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm"><ArrowUpRight size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling + Highest Returns Charts */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Top Selling Items</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="stockCode" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} width={65} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    formatter={(v) => formatNumber(v)}
                    labelFormatter={(label) => {
                      const p = topSellingProducts.find(p => p.stockCode === label);
                      return p ? p.description : label;
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="unitsSold" fill="#6366f1" name="Units Sold" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Highest Return Products</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={highestReturnProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="stockCode" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} width={65} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    formatter={(v) => `${v}%`}
                    labelFormatter={(label) => {
                      const p = highestReturnProducts.find(p => p.stockCode === label);
                      return p ? p.description : label;
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="returnRate" fill="#f43f5e" name="Return Rate" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Full Product List */}
      <div className="card" id="product-list-section">
        <div className="card-header">
          <h3>Full Product List</h3>
        </div>
        <div className="card-body">
          <div className="toolbar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search stock code or description..."
                className="form-input"
                style={{ paddingLeft: '40px', width: '300px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="product-search"
              />
            </div>
            <select className="form-select" style={{ width: '160px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} id="category-filter">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width: '140px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="sort-filter">
              <option value="unitsSold">Sort: Units Sold</option>
              <option value="revenue">Sort: Revenue</option>
              <option value="unitsReturned">Sort: Returns</option>
              <option value="avgPrice">Sort: Price</option>
            </select>
            <div className="toolbar-right">
              <button className="btn btn-secondary btn-sm" id="export-products-btn"><Download size={16} /> Export</button>
            </div>
          </div>

          <table className="data-table" id="product-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Returned</th>
                <th>Return Rate</th>
                <th>Avg Price</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const returnRate = p.unitsSold > 0 ? ((p.unitsReturned / p.unitsSold) * 100).toFixed(1) : '0.0';
                const isHighReturn = parseFloat(returnRate) > 5;
                return (
                  <tr key={p.stockCode}>
                    <td><code className="sku-code">{p.stockCode}</code></td>
                    <td style={{ fontWeight: 500, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                    <td><span className="badge neutral">{p.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatNumber(p.unitsSold)}</td>
                    <td>{formatNumber(p.unitsReturned)}</td>
                    <td>
                      <span className={`badge ${isHighReturn ? 'danger' : 'success'}`}>
                        {isHighReturn && <AlertTriangle size={11} />}
                        {returnRate}%
                      </span>
                    </td>
                    <td>£{p.avgPrice.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
