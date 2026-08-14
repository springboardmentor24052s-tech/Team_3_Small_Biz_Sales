import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Search, Download, Filter, DollarSign, TrendingUp,
  ShoppingCart, Package, Eye, FileDown,
} from 'lucide-react';
import {
  salesKPIs, dailySalesTrend, revenueByCountryData, salesByHourData,
  allInvoices, formatCurrency, formatNumber,
} from '../../data/mockData';
import './Sales.css';

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = allInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inv.customerId).includes(searchTerm);
    const matchesCountry = countryFilter === 'all' || inv.country === countryFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesCountry && matchesStatus;
  });

  const countries = [...new Set(allInvoices.map(i => i.country))];

  return (
    <div className="page-content animate-in">
      {/* Sales KPIs */}
      <div className="sales-kpi-row" id="sales-kpi-section">
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Total Revenue</span>
            <span className="sales-kpi-value">{formatCurrency(salesKPIs.totalRevenue.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Avg Order Value</span>
            <span className="sales-kpi-value">{formatCurrency(salesKPIs.avgOrderValue.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--info-50)', color: 'var(--info-500)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Growth Rate</span>
            <span className="sales-kpi-value" style={{ color: 'var(--accent-600)' }}>+{salesKPIs.growthRate.value}%</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
            <Package size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Items / Order</span>
            <span className="sales-kpi-value">{salesKPIs.itemsPerOrder.value}</span>
          </div>
        </div>
      </div>

      {/* Daily Sales Trend with Forecast */}
      <div className="card sales-chart-card" id="sales-trend-chart">
        <div className="card-header">
          <h3>Daily Sales Trend (with Forecast)</h3>
        </div>
        <div className="card-body">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `£${(v / 1000).toFixed(1)}K`} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }} formatter={(v) => v ? formatCurrency(v) : 'N/A'} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5} fill="url(#actualSalesGrad)" name="Actual" dot={{ r: 3, fill: '#6366f1' }} connectNulls={false} />
                <Area type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="8 4" fill="url(#forecastSalesGrad)" name="Forecast" dot={{ r: 3, fill: '#f59e0b' }} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue by Country + Sales by Hour */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Revenue by Country</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCountryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }} formatter={(v) => formatCurrency(v)} labelStyle={{ color: '#94a3b8' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#6366f1" name="Current" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="prevRevenue" fill="#c7d2fe" name="Previous" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Sales by Hour of Day</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByHourData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} interval={1} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }} labelStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="orders" fill="url(#hourBarGrad)" name="Orders" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* All Invoices Table */}
      <div className="card" id="invoices-section">
        <div className="card-header">
          <h3>All Invoices</h3>
        </div>
        <div className="card-body">
          <div className="toolbar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search invoice or customer ID..."
                className="form-input"
                style={{ paddingLeft: '40px', width: '280px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="sales-search"
              />
            </div>
            <select className="form-select" style={{ width: '160px' }} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} id="country-filter">
              <option value="all">All Countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width: '140px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="status-filter">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="returned">Returned</option>
            </select>
            <div className="toolbar-right">
              <button className="btn btn-secondary btn-sm" id="export-csv-btn"><FileDown size={16} /> CSV</button>
              <button className="btn btn-secondary btn-sm" id="export-pdf-btn"><Download size={16} /> PDF</button>
            </div>
          </div>

          <table className="data-table" id="all-invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Country</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.invoiceNo} className={inv.isReturn ? 'row-return' : ''}>
                  <td><span className={`invoice-id ${inv.isReturn ? 'return' : ''}`}>{inv.invoiceNo}</span></td>
                  <td>{inv.date}</td>
                  <td style={{ fontWeight: 500 }}>{inv.customerId}</td>
                  <td>{inv.items}</td>
                  <td style={{ fontWeight: 600, color: inv.isReturn ? 'var(--danger-600)' : 'inherit' }}>{formatCurrency(inv.total)}</td>
                  <td><span className="badge neutral">{inv.country}</span></td>
                  <td>
                    <span className={`badge ${inv.isReturn ? 'danger' : 'success'}`}>
                      {inv.isReturn ? 'Returned' : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
