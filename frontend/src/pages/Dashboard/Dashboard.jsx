import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, RotateCcw, AlertTriangle, AlertCircle, Info, Zap,
  ExternalLink,
} from 'lucide-react';
import {
  overviewKPIs, revenueTrendData, activeAlerts,
  salesByCountryData, topProducts, recentInvoices,
  formatCurrency, formatNumber,
} from '../../data/mockData';
import './Dashboard.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-value" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'orders' ? entry.value : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const alertIcon = (type) => {
  switch (type) {
    case 'zero_price': return <AlertCircle size={16} />;
    case 'high_return': return <RotateCcw size={16} />;
    case 'churn_risk': return <Users size={16} />;
    case 'large_order': return <Info size={16} />;
    case 'anomaly': return <Zap size={16} />;
    default: return <AlertTriangle size={16} />;
  }
};

const alertSeverityClass = (severity) => {
  switch (severity) {
    case 'critical': return 'danger';
    case 'high': return 'danger';
    case 'warning': return 'warning';
    case 'info': return 'info';
    default: return 'neutral';
  }
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('monthly');

  const kpiCards = [
    { key: 'revenue', label: 'Revenue', value: formatCurrency(overviewKPIs.revenue.value), change: overviewKPIs.revenue.change, period: overviewKPIs.revenue.period, icon: DollarSign },
    { key: 'orders', label: 'Orders', value: formatNumber(overviewKPIs.orders.value), change: overviewKPIs.orders.change, period: overviewKPIs.orders.period, icon: ShoppingCart },
    { key: 'customers', label: 'Customers', value: formatNumber(overviewKPIs.customers.value), change: overviewKPIs.customers.change, period: overviewKPIs.customers.period, icon: Users },
    { key: 'returns', label: 'Return Rate', value: `${overviewKPIs.returnRate.value}%`, change: overviewKPIs.returnRate.change, period: overviewKPIs.returnRate.period, icon: RotateCcw, isNegativeGood: true },
  ];

  return (
    <div className="page-content animate-in">
      {/* KPI Cards */}
      <div className="kpi-grid" id="kpi-section">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.isNegativeGood ? kpi.change < 0 : kpi.change > 0;
          return (
            <div key={kpi.key} className={`kpi-card ${kpi.key === 'revenue' ? 'sales' : kpi.key === 'orders' ? 'profit' : kpi.key === 'customers' ? 'inventory' : 'lowstock'}`} id={`kpi-${kpi.key}`}>
              <div className="kpi-top">
                <span className="kpi-label">{kpi.label}</span>
                <div className="kpi-icon">
                  <Icon size={20} />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div>
                <span className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
                <span className="kpi-period">{kpi.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend + Active Alerts */}
      <div className="charts-grid" id="charts-section">
        {/* Revenue Trend Line Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Revenue Trend</h3>
            <div className="chart-tabs">
              {['weekly', 'monthly', 'yearly'].map((range) => (
                <button
                  key={range}
                  className={`chart-tab ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" name="Revenue" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Alerts Feed */}
        <div className="card">
          <div className="card-header">
            <h3>Active Alerts</h3>
            <span className="badge danger">{activeAlerts.filter(a => !a.isResolved).length} Active</span>
          </div>
          <div className="card-body alert-feed" id="alert-feed">
            {activeAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <div className={`alert-icon-wrap ${alertSeverityClass(alert.severity)}`}>
                  {alertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time">{alert.timestamp}</span>
                </div>
                <button className="action-btn" title="View Details"><ExternalLink size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales by Country + Top Products */}
      <div className="bottom-grid" id="bottom-section">
        {/* Sales by Country */}
        <div className="card">
          <div className="card-header">
            <h3>Sales by Country</h3>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCountryData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="country" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={95} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="card">
          <div className="card-header">
            <h3>Top 5 Products</h3>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="stockCode" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={70} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : formatNumber(value), name === 'revenue' ? 'Revenue' : 'Units Sold']}
                    labelFormatter={(label) => {
                      const p = topProducts.find(p => p.stockCode === label);
                      return p ? p.description : label;
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} barSize={18} name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="card" style={{ marginTop: '20px' }} id="recent-invoices">
        <div className="card-header">
          <h3>Recent Invoices</h3>
          <button className="btn btn-ghost btn-sm">View All</button>
        </div>
        <div className="card-body">
          <table className="data-table" id="invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.invoiceNo} className={inv.isReturn ? 'row-return' : ''}>
                  <td>
                    <span className={`invoice-id ${inv.isReturn ? 'return' : ''}`}>
                      {inv.invoiceNo}
                    </span>
                  </td>
                  <td>{inv.date}</td>
                  <td style={{ fontWeight: 500 }}>{inv.customerId}</td>
                  <td>{inv.items}</td>
                  <td style={{ fontWeight: 600, color: inv.isReturn ? 'var(--danger-600)' : 'var(--text-primary)' }}>
                    {formatCurrency(inv.total)}
                  </td>
                  <td><span className="badge neutral">{inv.country}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
