import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Brain, Zap, Shield, AlertTriangle, RefreshCw,
  CheckCircle, XCircle, Loader2, Search, TrendingDown,
  Users, Activity, Target, Filter, Download
} from 'lucide-react';
import {
  forecastChartData as fallbackChartData,
  modelComparison as fallbackModelMetrics,
  churnRiskData as fallbackChurnData,
  productRecommendations as fallbackRecommendations,
  anomalyAlerts as fallbackAnomalies,
  formatCurrency
} from '../../data/mockData';
import { api } from '../../services/api';
import './AIInsights.css';

// ───────────────────────────────────────────────────────────────
// Mini Ring Component (donut-style KPI)
// ───────────────────────────────────────────────────────────────
function RingKPI({ pct, color, label, count }) {
  const r = 28, circ = 2 * Math.PI * r;
  const filled = ((pct / 100) * circ).toFixed(2);
  return (
    <div className="ring-kpi">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border-color)" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
          {pct}%
        </text>
      </svg>
      <div className="ring-kpi-label">
        <span className="ring-kpi-count">{count}</span>
        <span className="ring-kpi-text">{label}</span>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Probability Bar
// ───────────────────────────────────────────────────────────────
function ProbBar({ pct, level }) {
  const colorMap = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const color = colorMap[level] || '#6366f1';
  return (
    <div className="prob-bar-wrap">
      <div className="prob-bar-track">
        <div
          className="prob-bar-fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
      <span className="prob-bar-val" style={{ color }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────
export default function AIInsights() {
  const [activeTab, setActiveTab] = useState('forecasts');
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState('');

  // Forecast states
  const [forecastData, setForecastData] = useState(fallbackChartData);
  const [modelMetrics, setModelMetrics] = useState(fallbackModelMetrics);

  // Churn states (ML engine)
  const [churnSummary, setChurnSummary] = useState(null);
  const [churnModelMetrics, setChurnModelMetrics] = useState(null);
  const [churnCustomers, setChurnCustomers] = useState([]);
  const [churnLoading, setChurnLoading] = useState(false);
  const [churnFallback, setChurnFallback] = useState(fallbackChurnData);

  // Churn table controls
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [churnPage, setChurnPage] = useState(1);
  const CHURN_PAGE_SIZE = 15;

  // Other AI states
  const [recommendations, setRecommendations] = useState(fallbackRecommendations);
  const [anomalies, setAnomalies] = useState(fallbackAnomalies);

  // ── Load forecast + anomalies + recommendations on mount ──
  useEffect(() => {
    async function loadAIData() {
      setLoading(true);
      try {
        const forecastRes = await api.getRevenueForecast();
        if (forecastRes?.forecasts?.length > 0) {
          const historicalList = forecastRes.historical?.length > 0
            ? forecastRes.historical
            : fallbackChartData.filter(d => d.actual !== null);
          setForecastData([
            ...historicalList,
            ...forecastRes.forecasts.map(f => ({
              month: f.month, actual: null,
              forecast: f.forecast, lower: f.lower, upper: f.upper
            }))
          ]);
          if (forecastRes.model_metrics) setModelMetrics(forecastRes.model_metrics);
        }
        const recRes = await api.getRecommendations();
        if (recRes?.length > 0) setRecommendations(recRes);

        const anomalyRes = await api.getAnomalies();
        if (anomalyRes?.length > 0) setAnomalies(anomalyRes);
      } catch (err) {
        console.log('Using fallback AI metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAIData();
  }, []);

  // ── Load churn ML predictions when tab is first opened ──
  useEffect(() => {
    if (activeTab !== 'churn') return;
    if (churnCustomers.length > 0) return; // already loaded
    async function loadChurn() {
      setChurnLoading(true);
      try {
        const res = await api.getChurnPredictions();
        if (res?.customers?.length > 0) {
          setChurnCustomers(res.customers);
          setChurnSummary(res.summary);
          setChurnModelMetrics(res.model_metrics);
        } else {
          // fallback to legacy endpoint
          const legacyRes = await api.getChurnScores();
          if (legacyRes?.length > 0) setChurnFallback(legacyRes);
        }
      } catch {
        const legacyRes = await api.getChurnScores().catch(() => null);
        if (legacyRes?.length > 0) setChurnFallback(legacyRes);
      } finally {
        setChurnLoading(false);
      }
    }
    loadChurn();
  }, [activeTab]);

  // ── Filtered + paginated churn customers ──
  const filteredChurn = useMemo(() => {
    const source = churnCustomers.length > 0 ? churnCustomers : [];
    return source.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q
        || c.customerId?.toLowerCase().includes(q)
        || c.name?.toLowerCase().includes(q)
        || c.segment?.toLowerCase().includes(q);
      const matchRisk = riskFilter === 'All' || c.riskLevel === riskFilter;
      const matchSeg = segmentFilter === 'All' || c.segment === segmentFilter;
      return matchQ && matchRisk && matchSeg;
    });
  }, [churnCustomers, searchQuery, riskFilter, segmentFilter]);

  const churnPageCount = Math.ceil(filteredChurn.length / CHURN_PAGE_SIZE);
  const pagedChurn = filteredChurn.slice(
    (churnPage - 1) * CHURN_PAGE_SIZE,
    churnPage * CHURN_PAGE_SIZE
  );

  // Donut data for churn breakdown
  const donutData = churnSummary
    ? [
        { name: 'High Risk', value: churnSummary.high_risk_count, color: '#ef4444' },
        { name: 'Medium Risk', value: churnSummary.medium_risk_count, color: '#f59e0b' },
        { name: 'Low Risk', value: churnSummary.low_risk_count, color: '#10b981' },
      ]
    : [];

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg('');
    try {
      const res = await api.retrainModels();
      if (res?.message) {
        setRetrainMsg('Models successfully retrained on latest transaction data!');
        const forecastRes = await api.getRevenueForecast();
        if (forecastRes?.forecasts) {
          const historicalList = forecastRes.historical?.length > 0
            ? forecastRes.historical
            : fallbackChartData.filter(d => d.actual !== null);
          setForecastData([
            ...historicalList,
            ...forecastRes.forecasts.map(f => ({
              month: f.month, actual: null,
              forecast: f.forecast, lower: f.lower, upper: f.upper
            }))
          ]);
          if (forecastRes.model_metrics) setModelMetrics(forecastRes.model_metrics);
        }
        // Reset churn so it reloads
        setChurnCustomers([]);
        setChurnSummary(null);
      }
    } catch {
      setRetrainMsg('Retraining request processed.');
    } finally {
      setRetraining(false);
      setTimeout(() => setRetrainMsg(''), 4000);
    }
  };

  const riskBadgeClass = (level) => {
    switch (level) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'neutral';
    }
  };

  const anomalySeverityClass = (score) => {
    if (score >= 8) return 'danger';
    if (score >= 5) return 'warning';
    return 'info';
  };

  // CSV export
  const handleExportChurn = () => {
    const rows = [
      ['Customer ID', 'Name', 'Segment', 'Country', 'Churn %', 'Risk Level',
       'Recency (days)', 'Frequency', 'Monetary ($)', 'RFM Score', 'Last Active'],
      ...filteredChurn.map(c => [
        c.customerId, c.name, c.segment, c.country,
        c.churnProb, c.riskLevel, c.recencyDays, c.frequency,
        c.monetary, c.rfmScore, c.lastActive
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'churn_risk_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ───────── RENDER ─────────
  return (
    <div className="page-content animate-in">
      {/* AI Banner */}
      <div className="ai-banner" id="ai-banner">
        <div className="ai-banner-content">
          <div className="ai-banner-icon"><Brain size={28} /></div>
          <div>
            <h2>AI-Powered Business Intelligence</h2>
            <p>XGBoost · Random Forest · Prophet — analysing <code>data.csv</code> for revenue forecasting &amp; churn prediction.</p>
            {retrainMsg && (
              <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>
                ✓ {retrainMsg}
              </p>
            )}
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleRetrain}
          disabled={retraining}
          id="refresh-insights-btn"
        >
          {retraining ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {retraining ? 'Retraining...' : 'Retrain Models'}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" id="ai-tabs">
        {['forecasts', 'churn', 'recommendations', 'anomalies'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setChurnPage(1); }}
          >
            {tab === 'forecasts' && 'Forecast Charts'}
            {tab === 'churn' && 'Churn Risk Panel'}
            {tab === 'recommendations' && 'Recommendations'}
            {tab === 'anomalies' && 'Anomaly Alerts'}
          </button>
        ))}
      </div>

      {/* ═══════════ FORECAST TAB ═══════════ */}
      {activeTab === 'forecasts' && (
        <div className="ai-tab-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3>Revenue Forecast (Actual vs Predicted)</h3>
              <span className="badge primary"><Brain size={12} /> XGBoost + Prophet Ensemble</span>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '340px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualForecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastLineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }} formatter={(v) => v ? formatCurrency(v) : 'N/A'} labelStyle={{ color: '#94a3b8' }} />
                    <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2.5} fill="url(#actualForecastGrad)" name="Actual" dot={{ r: 3, fill: '#6366f1' }} connectNulls={false} />
                    <Area type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="8 4" fill="url(#forecastLineGrad)" name="Forecast" dot={{ r: 3, fill: '#f59e0b' }} connectNulls={false} />
                    <Area type="monotone" dataKey="upper" stroke="transparent" fill="rgba(245,158,11,0.08)" name="Upper Bound" connectNulls={false} />
                    <Area type="monotone" dataKey="lower" stroke="transparent" fill="rgba(245,158,11,0.08)" name="Lower Bound" connectNulls={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Model Performance Comparison</h3>
              {loading && <span className="badge neutral"><Loader2 size={12} className="animate-spin" /> Evaluating...</span>}
            </div>
            <div className="card-body">
              <table className="data-table" id="model-comparison-table">
                <thead>
                  <tr>
                    <th>Model</th><th>MAE</th><th>RMSE</th><th>R² Score</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modelMetrics.map((m) => (
                    <tr key={m.model}>
                      <td style={{ fontWeight: 600 }}>{m.model}</td>
                      <td>{formatCurrency(m.mae)}</td>
                      <td>{formatCurrency(m.rmse)}</td>
                      <td>
                        <div className="r2-cell">
                          <div className="progress-bar" style={{ height: '5px', width: '80px' }}>
                            <div className={`progress-fill ${m.r2 >= 0.85 ? 'accent' : m.r2 >= 0.8 ? 'warning' : 'danger'}`} style={{ width: `${Math.max(0, m.r2 * 100)}%` }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.r2.toFixed(2)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'Selected' ? 'success' : 'neutral'}`}>
                          {m.status === 'Selected' && <CheckCircle size={12} />}{m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ CHURN RISK PANEL ═══════════ */}
      {activeTab === 'churn' && (
        <div className="ai-tab-content">

          {/* Loading state */}
          {churnLoading && (
            <div className="churn-loading-state">
              <div className="churn-loading-spinner"><Loader2 size={32} className="animate-spin" /></div>
              <p>Training XGBoost &amp; Random Forest classifiers on <code>data.csv</code>…</p>
              <span>Engineering RFM features for 793 customers</span>
            </div>
          )}

          {!churnLoading && churnSummary && (
            <>
              {/* ── KPI Row ── */}
              <div className="churn-kpi-row">
                <div className="churn-kpi-card">
                  <div className="churn-kpi-icon high"><TrendingDown size={20} /></div>
                  <div className="churn-kpi-body">
                    <span className="churn-kpi-val">{churnSummary.high_risk_count}</span>
                    <span className="churn-kpi-label">High Risk Customers</span>
                    <span className="churn-kpi-sub">{churnSummary.high_risk_pct}% of total</span>
                  </div>
                </div>
                <div className="churn-kpi-card">
                  <div className="churn-kpi-icon medium"><AlertTriangle size={20} /></div>
                  <div className="churn-kpi-body">
                    <span className="churn-kpi-val">{churnSummary.medium_risk_count}</span>
                    <span className="churn-kpi-label">Medium Risk Customers</span>
                    <span className="churn-kpi-sub">{churnSummary.medium_risk_pct}% of total</span>
                  </div>
                </div>
                <div className="churn-kpi-card">
                  <div className="churn-kpi-icon low"><Shield size={20} /></div>
                  <div className="churn-kpi-body">
                    <span className="churn-kpi-val">{churnSummary.low_risk_count}</span>
                    <span className="churn-kpi-label">Low Risk Customers</span>
                    <span className="churn-kpi-sub">{churnSummary.low_risk_pct}% of total</span>
                  </div>
                </div>
                <div className="churn-kpi-card">
                  <div className="churn-kpi-icon neutral"><Users size={20} /></div>
                  <div className="churn-kpi-body">
                    <span className="churn-kpi-val">{churnSummary.total_customers}</span>
                    <span className="churn-kpi-label">Total Customers Scored</span>
                    <span className="churn-kpi-sub">from data.csv</span>
                  </div>
                </div>
              </div>

              {/* ── Insight Cards Row ── */}
              <div className="churn-insight-row">
                {/* Donut Chart */}
                <div className="card churn-donut-card">
                  <div className="card-header">
                    <h3>Risk Distribution</h3>
                    <span className="badge danger"><Activity size={12} /> {churnSummary.overall_churn_rate_pct}% Churn Rate</span>
                  </div>
                  <div className="card-body churn-donut-body">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                          formatter={(val, name) => [`${val} customers`, name]}
                        />
                        <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-rings-row">
                      <RingKPI pct={churnSummary.high_risk_pct} color="#ef4444" label="High" count={churnSummary.high_risk_count} />
                      <RingKPI pct={churnSummary.medium_risk_pct} color="#f59e0b" label="Medium" count={churnSummary.medium_risk_count} />
                      <RingKPI pct={churnSummary.low_risk_pct} color="#10b981" label="Low" count={churnSummary.low_risk_count} />
                    </div>
                  </div>
                </div>

                {/* Model Metrics */}
                <div className="card churn-metrics-card">
                  <div className="card-header">
                    <h3>Classifier Performance</h3>
                    <span className="badge success"><Target size={12} /> {churnSummary.selected_model} Selected</span>
                  </div>
                  <div className="card-body">
                    <div className="classifier-metrics">
                      {churnModelMetrics && Object.entries(churnModelMetrics)
                        .filter(([k]) => k !== 'selected_model')
                        .map(([modelKey, m]) => {
                          const isSelected = churnSummary.selected_model?.toLowerCase().includes(
                            modelKey === 'xgboost' ? 'xg' : 'forest'
                          );
                          return (
                            <div key={modelKey} className={`classifier-row ${isSelected ? 'selected' : ''}`}>
                              <div className="classifier-name">
                                {isSelected && <CheckCircle size={13} color="#10b981" />}
                                <span>{modelKey === 'xgboost' ? 'XGBoost' : 'Random Forest'}</span>
                                {isSelected && <span className="badge success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Active</span>}
                              </div>
                              <div className="classifier-scores">
                                <div className="metric-pill">
                                  <span className="metric-pill-label">F1</span>
                                  <div className="prob-bar-track" style={{ width: '80px' }}>
                                    <div className="prob-bar-fill" style={{ width: `${m.f1 * 100}%`, background: '#6366f1' }} />
                                  </div>
                                  <span className="metric-pill-val">{(m.f1 * 100).toFixed(1)}%</span>
                                </div>
                                <div className="metric-pill">
                                  <span className="metric-pill-label">AUC</span>
                                  <div className="prob-bar-track" style={{ width: '80px' }}>
                                    <div className="prob-bar-fill" style={{ width: `${m.roc_auc * 100}%`, background: '#10b981' }} />
                                  </div>
                                  <span className="metric-pill-val">{(m.roc_auc * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="churn-feature-list">
                      <p className="feature-list-title">RFM Features Used</p>
                      {['Recency Days', 'Purchase Frequency', 'Monetary Value', 'Avg Order Value', 'Purchase Span', 'Order Cadence', 'R-Score', 'F-Score', 'M-Score', 'RFM Composite'].map(f => (
                        <span key={f} className="feature-tag">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Customer Table ── */}
              <div className="card churn-table-card">
                <div className="card-header">
                  <h3>Customer Churn Scores <span className="churn-count-badge">{filteredChurn.length}</span></h3>
                  <div className="churn-table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={handleExportChurn} id="churn-export-btn">
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {/* Filters */}
                  <div className="churn-filters" id="churn-filters">
                    <div className="search-input-wrap">
                      <Search size={14} />
                      <input
                        type="text"
                        placeholder="Search customer, name, segment…"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setChurnPage(1); }}
                        className="churn-search-input"
                        id="churn-search"
                      />
                    </div>
                    <div className="churn-filter-group">
                      <Filter size={14} />
                      <select
                        value={riskFilter}
                        onChange={e => { setRiskFilter(e.target.value); setChurnPage(1); }}
                        className="churn-filter-select"
                        id="churn-risk-filter"
                      >
                        <option value="All">All Risks</option>
                        <option value="High">High Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="Low">Low Risk</option>
                      </select>
                      <select
                        value={segmentFilter}
                        onChange={e => { setSegmentFilter(e.target.value); setChurnPage(1); }}
                        className="churn-filter-select"
                        id="churn-segment-filter"
                      >
                        <option value="All">All Segments</option>
                        <option value="Consumer">Consumer</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Home Office">Home Office</option>
                      </select>
                    </div>
                  </div>

                  <div className="table-scroll-wrap">
                    <table className="data-table churn-detail-table" id="churn-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Segment</th>
                          <th>Churn Probability</th>
                          <th>Risk</th>
                          <th>Recency</th>
                          <th>Orders</th>
                          <th>Revenue</th>
                          <th>RFM Score</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedChurn.map((c) => (
                          <tr key={c.customerId} className={`churn-row risk-${c.riskLevel?.toLowerCase()}`}>
                            <td>
                              <div className="churn-customer-cell">
                                <div className="churn-avatar" data-risk={c.riskLevel?.toLowerCase()}>
                                  {c.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <span className="churn-name">{c.name || c.customerId}</span>
                                  <span className="churn-id-sub">{c.customerId}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className="badge neutral">{c.segment}</span></td>
                            <td><ProbBar pct={c.churnProb} level={c.riskLevel} /></td>
                            <td><span className={`badge ${riskBadgeClass(c.riskLevel)}`}>{c.riskLevel}</span></td>
                            <td>
                              <span className={`recency-pill ${c.recencyDays > 150 ? 'danger' : c.recencyDays > 90 ? 'warning' : 'ok'}`}>
                                {c.recencyDays}d
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{c.frequency}</td>
                            <td style={{ fontWeight: 600 }}>${c.monetary?.toLocaleString()}</td>
                            <td>
                              <div className="rfm-score-cell">
                                <div className="rfm-dots">
                                  {[...Array(Math.round(Math.min(c.rfmScore, 15) / 3))].map((_, i) => (
                                    <span key={i} className="rfm-dot filled" />
                                  ))}
                                  {[...Array(5 - Math.round(Math.min(c.rfmScore, 15) / 3))].map((_, i) => (
                                    <span key={i} className="rfm-dot" />
                                  ))}
                                </div>
                                <span className="rfm-val">{c.rfmScore}</span>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.lastActive}</td>
                          </tr>
                        ))}
                        {pagedChurn.length === 0 && (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                              No customers match the current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {churnPageCount > 1 && (
                    <div className="churn-pagination">
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={churnPage === 1}
                        onClick={() => setChurnPage(p => p - 1)}
                      >← Prev</button>
                      <span className="page-info">Page {churnPage} of {churnPageCount} · {filteredChurn.length} customers</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={churnPage === churnPageCount}
                        onClick={() => setChurnPage(p => p + 1)}
                      >Next →</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Fallback: show legacy churn data if ML batch failed */}
          {!churnLoading && !churnSummary && (
            <>
              <div className="churn-summary-row">
                <div className="churn-summary-card high">
                  <Zap size={20} />
                  <div>
                    <span className="churn-count">{churnFallback.filter(c => c.riskLevel === 'High').length}</span>
                    <span className="churn-label">High Risk</span>
                  </div>
                </div>
                <div className="churn-summary-card medium">
                  <AlertTriangle size={20} />
                  <div>
                    <span className="churn-count">{churnFallback.filter(c => c.riskLevel === 'Medium').length}</span>
                    <span className="churn-label">Medium Risk</span>
                  </div>
                </div>
                <div className="churn-summary-card low">
                  <Shield size={20} />
                  <div>
                    <span className="churn-count">{churnFallback.filter(c => c.riskLevel === 'Low').length}</span>
                    <span className="churn-label">Low Risk</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3>Churn Risk Scores</h3>
                  <span className="badge neutral">Heuristic Model (Backend offline)</span>
                </div>
                <div className="card-body">
                  <table className="data-table" id="churn-table">
                    <thead>
                      <tr>
                        <th>Customer ID</th><th>Segment</th><th>Churn Probability</th>
                        <th>LTV</th><th>Last Active</th><th>Risk Level</th><th>Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {churnFallback.map((c) => (
                        <tr key={c.customerId}>
                          <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>#{c.customerId}</td>
                          <td><span className="badge neutral">{c.segment}</span></td>
                          <td>
                            <div className="r2-cell">
                              <div className="progress-bar" style={{ height: '6px', width: '70px' }}>
                                <div className={`progress-fill ${c.churnProb >= 0.7 ? 'danger' : c.churnProb >= 0.4 ? 'warning' : 'accent'}`} style={{ width: `${c.churnProb * 100}%` }} />
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{(c.churnProb * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(c.ltv)}</td>
                          <td>{c.lastActive}</td>
                          <td><span className={`badge ${riskBadgeClass(c.riskLevel)}`}>{c.riskLevel}</span></td>
                          <td style={{ fontSize: '0.82rem' }}>{c.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ RECOMMENDATIONS TAB ═══════════ */}
      {activeTab === 'recommendations' && (
        <div className="ai-tab-content">
          <div className="recommendations-grid" id="recommendations-grid">
            {recommendations.map((rec) => (
              <div key={rec.customerId} className="recommendation-card">
                <div className="rec-header">
                  <div className="rec-customer">
                    <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '0.8rem' }}>
                      #{String(rec.customerId).slice(-2)}
                    </div>
                    <div>
                      <span className="rec-customer-id">Customer #{rec.customerId}</span>
                      <span className="rec-customer-segment">{rec.customerSegment}</span>
                    </div>
                  </div>
                </div>
                <div className="rec-items">
                  {rec.recommendations.map((item, idx) => (
                    <div key={idx} className="rec-item">
                      <div className="rec-item-info">
                        <code className="sku-code" style={{ fontSize: '0.75rem' }}>{item.stockCode}</code>
                        <span className="rec-item-name">{item.description}</span>
                      </div>
                      <div className="rec-item-meta">
                        <span className={`badge ${item.type === 'Cross-sell' ? 'primary' : item.type === 'Upsell' ? 'success' : 'info'}`} style={{ fontSize: '0.68rem' }}>
                          {item.type}
                        </span>
                        <span className="rec-confidence">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ ANOMALIES TAB ═══════════ */}
      {activeTab === 'anomalies' && (
        <div className="ai-tab-content">
          <div className="card">
            <div className="card-header">
              <h3>Detected Anomalies</h3>
              <span className="badge warning"><AlertTriangle size={12} /> Isolation Forest + Z-Score</span>
            </div>
            <div className="card-body">
              <table className="data-table" id="anomaly-table">
                <thead>
                  <tr>
                    <th>Type</th><th>Reference</th><th>Description</th>
                    <th>Severity</th><th>Detected</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((a) => (
                    <tr key={a.id}>
                      <td><span className={`badge ${anomalySeverityClass(a.severity)}`}>{a.type.replace(/_/g, ' ')}</span></td>
                      <td>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{a.referenceType}</span>
                          <br />
                          <code className="sku-code">{a.referenceId}</code>
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{a.description}</td>
                      <td>
                        <div className="severity-cell">
                          <div className="progress-bar" style={{ height: '5px', width: '60px' }}>
                            <div className={`progress-fill ${a.severity >= 8 ? 'danger' : a.severity >= 5 ? 'warning' : 'primary'}`} style={{ width: `${a.severity * 10}%` }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{a.severity.toFixed(1)}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{a.detectedAt}</td>
                      <td>
                        <span className={`badge ${a.isResolved ? 'success' : 'danger'}`}>
                          {a.isResolved ? <><CheckCircle size={12} /> Resolved</> : <><XCircle size={12} /> Active</>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
