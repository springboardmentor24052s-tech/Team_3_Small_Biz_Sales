import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  TrendingDown, AlertTriangle, Shield, Users, Brain,
  Search, Filter, Download, CheckCircle, Loader2,
  Activity, Target, RefreshCw, ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import './ChurnPrediction.css';

// ── Animated SVG Ring ──────────────────────────────────────────
function RingGauge({ pct, color, label, count }) {
  const r = 30, circ = 2 * Math.PI * r;
  const filled = ((Math.min(pct, 100) / 100) * circ).toFixed(2);
  return (
    <div className="cp-ring">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--border-color)" strokeWidth="8" />
        <circle
          cx="38" cy="38" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="38" y="42" textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>
          {pct}%
        </text>
      </svg>
      <div className="cp-ring-info">
        <span className="cp-ring-count">{count.toLocaleString()}</span>
        <span className="cp-ring-label">{label}</span>
      </div>
    </div>
  );
}

// ── Probability Bar ────────────────────────────────────────────
function ProbBar({ pct, level }) {
  const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const c = colors[level] || '#6366f1';
  return (
    <div className="cp-prob-wrap">
      <div className="cp-prob-track">
        <div className="cp-prob-fill" style={{ width: `${Math.min(pct, 100)}%`, background: c }} />
      </div>
      <span className="cp-prob-val" style={{ color: c }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function ChurnPrediction() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [customers, setCustomers] = useState([]);

  // table controls
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [segFilter, setSegFilter] = useState('All');
  const [sortKey, setSortKey] = useState('churnProb');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  // fetch
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getChurnPredictions();
      if (res?.customers?.length > 0) {
        setCustomers(res.customers);
        setSummary(res.summary);
        setModelMetrics(res.model_metrics);
      }
    } catch (e) {
      console.warn('Churn fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // sort
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  // filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers
      .filter(c => {
        const matchQ = !q || c.name?.toLowerCase().includes(q) || c.customerId?.toLowerCase().includes(q) || c.country?.toLowerCase().includes(q);
        const matchR = riskFilter === 'All' || c.riskLevel === riskFilter;
        const matchS = segFilter === 'All' || c.segment === segFilter;
        return matchQ && matchR && matchS;
      })
      .sort((a, b) => {
        let av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'string') av = av.toLowerCase(), bv = bv?.toLowerCase() ?? '';
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
  }, [customers, search, riskFilter, segFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const donutData = summary ? [
    { name: 'High Risk',   value: summary.high_risk_count,   color: '#ef4444' },
    { name: 'Medium Risk', value: summary.medium_risk_count, color: '#f59e0b' },
    { name: 'Low Risk',    value: summary.low_risk_count,    color: '#10b981' },
  ] : [];

  const handleExport = () => {
    const rows = [
      ['Customer ID', 'Name', 'Segment', 'Country', 'Churn %', 'Risk Level',
       'Recency (d)', 'Orders', 'Revenue ($)', 'RFM Score', 'Last Active'],
      ...filtered.map(c => [
        c.customerId, c.name, c.segment, c.country,
        c.churnProb, c.riskLevel, c.recencyDays, c.frequency,
        c.monetary, c.rfmScore, c.lastActive
      ])
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'churn_risk_report.csv'; a.click();
  };

  const SortIcon = ({ k }) => (
    <ChevronDown
      size={13}
      style={{
        marginLeft: 4,
        opacity: sortKey === k ? 1 : 0.3,
        transform: sortKey === k && sortDir === 'asc' ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );

  // ── LOADING ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-content animate-in">
        <div className="cp-loading-screen">
          <div className="cp-loading-icon"><Brain size={40} /></div>
          <h2>Training Churn Models</h2>
          <p>XGBoost &amp; Random Forest are engineering RFM features for <strong>793 customers</strong> from <code>data.csv</code>…</p>
          <div className="cp-loading-bar"><div className="cp-loading-fill" /></div>
          <span>This usually takes 10–15 seconds</span>
        </div>
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="page-content animate-in">

      {/* ── Page Header ── */}
      <div className="cp-page-header">
        <div>
          <h1 className="cp-page-title">
            <TrendingDown size={24} />
            Churn Prediction
          </h1>
          <p className="cp-page-sub">
            XGBoost &amp; Random Forest classifiers trained on RFM features from <code>data.csv</code>
          </p>
        </div>
        <div className="cp-page-actions">
          <button className="btn btn-secondary" onClick={fetchData} id="cp-refresh-btn">
            <RefreshCw size={15} /> Retrain
          </button>
          <button className="btn btn-primary" onClick={handleExport} id="cp-export-btn">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="cp-kpi-row">
        <div className="cp-kpi-card high">
          <div className="cp-kpi-icon"><TrendingDown size={22} /></div>
          <div className="cp-kpi-body">
            <span className="cp-kpi-num">{summary?.high_risk_count ?? 0}</span>
            <span className="cp-kpi-lbl">High Risk</span>
            <span className="cp-kpi-sub">{summary?.high_risk_pct ?? 0}% of customers</span>
          </div>
        </div>
        <div className="cp-kpi-card medium">
          <div className="cp-kpi-icon"><AlertTriangle size={22} /></div>
          <div className="cp-kpi-body">
            <span className="cp-kpi-num">{summary?.medium_risk_count ?? 0}</span>
            <span className="cp-kpi-lbl">Medium Risk</span>
            <span className="cp-kpi-sub">{summary?.medium_risk_pct ?? 0}% of customers</span>
          </div>
        </div>
        <div className="cp-kpi-card low">
          <div className="cp-kpi-icon"><Shield size={22} /></div>
          <div className="cp-kpi-body">
            <span className="cp-kpi-num">{summary?.low_risk_count ?? 0}</span>
            <span className="cp-kpi-lbl">Low Risk</span>
            <span className="cp-kpi-sub">{summary?.low_risk_pct ?? 0}% of customers</span>
          </div>
        </div>
        <div className="cp-kpi-card neutral">
          <div className="cp-kpi-icon"><Users size={22} /></div>
          <div className="cp-kpi-body">
            <span className="cp-kpi-num">{summary?.total_customers ?? 0}</span>
            <span className="cp-kpi-lbl">Total Scored</span>
            <span className="cp-kpi-sub">from data.csv</span>
          </div>
        </div>
        <div className="cp-kpi-card churn">
          <div className="cp-kpi-icon"><Activity size={22} /></div>
          <div className="cp-kpi-body">
            <span className="cp-kpi-num">{summary?.overall_churn_rate_pct ?? 0}%</span>
            <span className="cp-kpi-lbl">Churn Rate</span>
            <span className="cp-kpi-sub">overall base rate</span>
          </div>
        </div>
      </div>

      {/* ── Two-panel row ── */}
      <div className="cp-panel-row">

        {/* Left: Donut + Rings */}
        <div className="card cp-donut-panel">
          <div className="card-header">
            <h3>Risk Distribution</h3>
            <span className="badge danger"><Activity size={12} /> {summary?.overall_churn_rate_pct}% Rate</span>
          </div>
          <div className="card-body cp-donut-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData} cx="50%" cy="50%"
                  innerRadius={58} outerRadius={88}
                  paddingAngle={3} dataKey="value"
                >
                  {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  formatter={(val, name) => [`${val} customers`, name]}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={val => <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="cp-rings-row">
              <RingGauge pct={summary?.high_risk_pct   ?? 0} color="#ef4444" label="High"   count={summary?.high_risk_count   ?? 0} />
              <RingGauge pct={summary?.medium_risk_pct ?? 0} color="#f59e0b" label="Medium" count={summary?.medium_risk_count ?? 0} />
              <RingGauge pct={summary?.low_risk_pct    ?? 0} color="#10b981" label="Low"    count={summary?.low_risk_count    ?? 0} />
            </div>
          </div>
        </div>

        {/* Right: Classifier metrics */}
        <div className="card cp-metrics-panel">
          <div className="card-header">
            <h3>Classifier Performance</h3>
            <span className="badge success"><Target size={12} /> {summary?.selected_model} Selected</span>
          </div>
          <div className="card-body">
            {modelMetrics && Object.entries(modelMetrics)
              .filter(([k]) => k !== 'selected_model')
              .map(([key, m]) => {
                const isActive = summary?.selected_model?.toLowerCase().includes(key === 'xgboost' ? 'xg' : 'forest');
                return (
                  <div key={key} className={`cp-classifier ${isActive ? 'active' : ''}`}>
                    <div className="cp-classifier-title">
                      {isActive && <CheckCircle size={14} color="#10b981" />}
                      <span>{key === 'xgboost' ? 'XGBoost' : 'Random Forest'}</span>
                      {isActive && <span className="badge success" style={{ fontSize: '0.65rem', padding: '1px 7px' }}>Active</span>}
                    </div>
                    <div className="cp-metric-row">
                      <span className="cp-metric-key">F1 Score</span>
                      <div className="cp-metric-bar-track">
                        <div className="cp-metric-bar-fill" style={{ width: `${m.f1 * 100}%`, background: '#6366f1' }} />
                      </div>
                      <span className="cp-metric-val">{(m.f1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="cp-metric-row">
                      <span className="cp-metric-key">ROC-AUC</span>
                      <div className="cp-metric-bar-track">
                        <div className="cp-metric-bar-fill" style={{ width: `${m.roc_auc * 100}%`, background: '#10b981' }} />
                      </div>
                      <span className="cp-metric-val">{(m.roc_auc * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })
            }

            <div className="cp-features">
              <p className="cp-features-title">RFM Features Used in Training</p>
              <div className="cp-features-grid">
                {['Recency Days', 'Frequency', 'Monetary', 'Avg Order Value',
                  'Purchase Span', 'Order Cadence', 'R-Score', 'F-Score', 'M-Score', 'RFM Composite']
                  .map(f => <span key={f} className="cp-feature-tag">{f}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Customer Table ── */}
      <div className="card cp-table-card">
        <div className="card-header">
          <div className="cp-table-title">
            <h3>Customer Churn Scores</h3>
            <span className="cp-count-badge">{filtered.length} customers</span>
          </div>
        </div>

        {/* Filters */}
        <div className="cp-filters">
          <div className="cp-search-wrap">
            <Search size={14} />
            <input
              id="cp-search"
              type="text"
              placeholder="Search by name, ID or country…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="cp-search-input"
            />
          </div>
          <div className="cp-filter-selects">
            <Filter size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <select
              id="cp-risk-filter"
              className="cp-select"
              value={riskFilter}
              onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
            >
              <option value="All">All Risks</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              id="cp-seg-filter"
              className="cp-select"
              value={segFilter}
              onChange={e => { setSegFilter(e.target.value); setPage(1); }}
            >
              <option value="All">All Segments</option>
              <option value="Consumer">Consumer</option>
              <option value="Corporate">Corporate</option>
              <option value="Home Office">Home Office</option>
            </select>
          </div>
        </div>

        <div className="cp-table-wrap">
          <table className="data-table cp-table" id="churn-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Customer <SortIcon k="name" />
                </th>
                <th>Segment</th>
                <th onClick={() => toggleSort('churnProb')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Churn % <SortIcon k="churnProb" />
                </th>
                <th>Risk</th>
                <th onClick={() => toggleSort('recencyDays')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Recency <SortIcon k="recencyDays" />
                </th>
                <th onClick={() => toggleSort('frequency')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Orders <SortIcon k="frequency" />
                </th>
                <th onClick={() => toggleSort('monetary')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Revenue <SortIcon k="monetary" />
                </th>
                <th onClick={() => toggleSort('rfmScore')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  RFM <SortIcon k="rfmScore" />
                </th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.customerId} className={`cp-row risk-${c.riskLevel?.toLowerCase()}`}>
                  {/* Customer */}
                  <td>
                    <div className="cp-cust-cell">
                      <div className="cp-avatar" data-risk={c.riskLevel?.toLowerCase()}>
                        {c.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <span className="cp-cust-name">{c.name || c.customerId}</span>
                        <span className="cp-cust-id">{c.customerId} · {c.country}</span>
                      </div>
                    </div>
                  </td>
                  {/* Segment */}
                  <td><span className="badge neutral">{c.segment}</span></td>
                  {/* Churn Prob */}
                  <td><ProbBar pct={c.churnProb} level={c.riskLevel} /></td>
                  {/* Risk */}
                  <td>
                    <span className={`badge ${c.riskLevel === 'High' ? 'danger' : c.riskLevel === 'Medium' ? 'warning' : 'success'}`}>
                      {c.riskLevel}
                    </span>
                  </td>
                  {/* Recency */}
                  <td>
                    <span className={`cp-recency ${c.recencyDays > 150 ? 'danger' : c.recencyDays > 90 ? 'warning' : 'ok'}`}>
                      {c.recencyDays}d
                    </span>
                  </td>
                  {/* Orders */}
                  <td><span style={{ fontWeight: 600 }}>{c.frequency}</span></td>
                  {/* Revenue */}
                  <td><span style={{ fontWeight: 600 }}>${c.monetary?.toLocaleString()}</span></td>
                  {/* RFM */}
                  <td>
                    <div className="cp-rfm-cell">
                      <div className="cp-rfm-dots">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`cp-rfm-dot ${i < Math.round(Math.min(c.rfmScore, 15) / 3) ? 'on' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="cp-rfm-val">{c.rfmScore}</span>
                    </div>
                  </td>
                  {/* Last Active */}
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {c.lastActive}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No customers match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="cp-pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >← Prev</button>
            <div className="cp-page-pills">
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    className={`cp-page-pill ${page === pg ? 'active' : ''}`}
                    onClick={() => setPage(pg)}
                  >{pg}</button>
                );
              })}
              {totalPages > 7 && <span className="cp-page-ellipsis">…{totalPages}</span>}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >Next →</button>
          </div>
        )}
        <div className="cp-footer-info">
          Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} customers
          {filtered.length !== customers.length && ` (filtered from ${customers.length})`}
        </div>
      </div>
    </div>
  );
}
