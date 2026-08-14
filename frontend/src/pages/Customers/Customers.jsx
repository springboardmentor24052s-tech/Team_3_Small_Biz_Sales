import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis,
} from 'recharts';
import {
  Search, Download, Users, Award, AlertTriangle, DollarSign,
  TrendingUp, TrendingDown, Filter, Sparkles, ArrowRight,
} from 'lucide-react';
import {
  customerKPIs, customerSegments, rfmScatterData, customerTable,
  formatCurrency, formatNumber,
} from '../../data/mockData';
import './Customers.css';

const segmentColors = {
  'Champions': '#6366f1',
  'Loyal Customers': '#10b981',
  'Potential Loyalists': '#0ea5e9',
  'New Customers': '#f59e0b',
  'At Risk': '#f43f5e',
  'Need Attention': '#8b5cf6',
  'About to Sleep': '#ec4899',
  'Hibernating': '#94a3b8',
  'Lost': '#64748b',
};

const segmentBadgeClass = (segment) => {
  switch (segment) {
    case 'Champions': return 'primary';
    case 'Loyal Customers': return 'success';
    case 'Potential Loyalists': return 'info';
    case 'New Customers': return 'warning';
    case 'At Risk': case 'Lost': return 'danger';
    default: return 'neutral';
  }
};

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">Customer #{data.customerId}</p>
        <p className="tooltip-value" style={{ color: segmentColors[data.segment] }}>{data.segment}</p>
        <p className="tooltip-value" style={{ color: '#94a3b8' }}>Recency Score: {data.x}</p>
        <p className="tooltip-value" style={{ color: '#94a3b8' }}>Frequency Score: {data.y}</p>
        <p className="tooltip-value" style={{ color: '#10b981' }}>LTV: {formatCurrency(data.monetary)}</p>
      </div>
    );
  }
  return null;
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  const countries = [...new Set(customerTable.map(c => c.country))];

  const filtered = customerTable.filter((c) => {
    const matchesSearch = String(c.customerId).includes(searchTerm);
    const matchesSegment = segmentFilter === 'all' || c.segment === segmentFilter;
    const matchesCountry = countryFilter === 'all' || c.country === countryFilter;
    return matchesSearch && matchesSegment && matchesCountry;
  });

  return (
    <div className="page-content animate-in">
      {/* AI Segmentation Callout Banner */}
      <div className="ai-banner" style={{ marginBottom: '20px' }}>
        <div className="ai-banner-content">
          <div className="ai-banner-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px' }}>AI-Powered Customer Clustering (K-Means)</h2>
            <p>Explore unsupervised behavioral clustering, silhouette evaluation, and dynamic RFM segmentation.</p>
          </div>
        </div>
        <Link to="/segmentation" className="btn btn-primary" id="open-segmentation-studio-btn">
          <span>Open Segmentation Studio</span> <ArrowRight size={16} />
        </Link>
      </div>

      {/* Customer KPIs */}
      <div className="sales-kpi-row" id="customer-kpi-section">
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
            <Users size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Known Customers</span>
            <span className="sales-kpi-value">{formatNumber(customerKPIs.knownCustomers.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
            <Award size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Premium Customers</span>
            <span className="sales-kpi-value">{formatNumber(customerKPIs.premiumCustomers.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">At-Risk Customers</span>
            <span className="sales-kpi-value">{formatNumber(customerKPIs.atRiskCustomers.value)}</span>
          </div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span className="sales-kpi-label">Avg LTV</span>
            <span className="sales-kpi-value">{formatCurrency(customerKPIs.avgLTV.value)}</span>
          </div>
        </div>
      </div>

      {/* Segment Distribution + RFM Scatter */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        {/* Segment Distribution Donut */}
        <div className="card">
          <div className="card-header">
            <h3>Segment Distribution</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                    stroke="none"
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} customers (${customerSegments.find(s => s.name === name)?.percentage}%)`, name]}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: '12px', lineHeight: '20px' }}
                    formatter={(value) => <span style={{ color: '#475569', fontWeight: 450 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RFM Scatter/Bubble Chart */}
        <div className="card">
          <div className="card-header">
            <h3>RFM Analysis (Scatter Plot)</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="x" name="Recency Score" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Recency →', position: 'bottom', offset: -5, style: { fill: '#94a3b8', fontSize: 11 } }} />
                  <YAxis type="number" dataKey="y" name="Frequency Score" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Frequency →', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#94a3b8', fontSize: 11 } }} />
                  <ZAxis type="number" dataKey="monetary" range={[40, 400]} name="Monetary" />
                  <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  {Object.entries(segmentColors).map(([segment, color]) => {
                    const segData = rfmScatterData.filter(d => d.segment === segment);
                    if (segData.length === 0) return null;
                    return (
                      <Scatter key={segment} name={segment} data={segData} fill={color} opacity={0.8} />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="card" id="customer-table-section">
        <div className="card-header">
          <h3>Customer Directory</h3>
        </div>
        <div className="card-body">
          <div className="toolbar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search customer ID..."
                className="form-input"
                style={{ paddingLeft: '40px', width: '240px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="customer-search"
              />
            </div>
            <select className="form-select" style={{ width: '170px' }} value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} id="segment-filter">
              <option value="all">All Segments</option>
              {customerSegments.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            <select className="form-select" style={{ width: '160px' }} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} id="customer-country-filter">
              <option value="all">All Countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="toolbar-right">
              <button className="btn btn-secondary btn-sm" id="export-customers-btn"><Download size={16} /> Export</button>
            </div>
          </div>

          <table className="data-table" id="customer-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Segment</th>
                <th>RFM Score</th>
                <th>Orders</th>
                <th>LTV</th>
                <th>Last Active</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.customerId}>
                  <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>#{c.customerId}</td>
                  <td>
                    <span className={`badge ${segmentBadgeClass(c.segment)}`}>{c.segment}</span>
                  </td>
                  <td><code className="sku-code">{c.rfmScore}</code></td>
                  <td style={{ fontWeight: 600 }}>{c.orders}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.ltv)}</td>
                  <td>{c.lastActive}</td>
                  <td><span className="badge neutral">{c.country}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
