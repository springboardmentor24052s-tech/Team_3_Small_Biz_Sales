import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Brain, TrendingUp, TrendingDown, Zap, Target, Shield, AlertTriangle,
  Users, Package, RefreshCw, ArrowUpRight, CheckCircle, XCircle,
} from 'lucide-react';
import {
  forecastChartData, modelComparison, churnRiskData, productRecommendations,
  anomalyAlerts, formatCurrency, formatNumber,
} from '../../data/mockData';
import './AIInsights.css';

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState('forecasts');

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

  return (
    <div className="page-content animate-in">
      {/* AI Banner */}
      <div className="ai-banner" id="ai-banner">
        <div className="ai-banner-content">
          <div className="ai-banner-icon">
            <Brain size={28} />
          </div>
          <div>
            <h2>AI-Powered Business Intelligence</h2>
            <p>Prophet, XGBoost, Random Forest, K-Means clustering, Isolation Forest — analyzing your sales data for actionable insights.</p>
          </div>
        </div>
        <button className="btn btn-secondary" id="refresh-insights-btn">
          <RefreshCw size={16} /> Retrain Models
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" id="ai-tabs">
        <button className={`tab ${activeTab === 'forecasts' ? 'active' : ''}`} onClick={() => setActiveTab('forecasts')}>
          Forecast Charts
        </button>
        <button className={`tab ${activeTab === 'churn' ? 'active' : ''}`} onClick={() => setActiveTab('churn')}>
          Churn Risk Panel
        </button>
        <button className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
          Recommendations
        </button>
        <button className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`} onClick={() => setActiveTab('anomalies')}>
          Anomaly Alerts
        </button>
      </div>

      {/* Forecast Tab */}
      {activeTab === 'forecasts' && (
        <div className="ai-tab-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3>Revenue Forecast (Actual vs Predicted)</h3>
              <span className="badge primary"><Brain size={12} /> Prophet Model</span>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '340px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
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

          {/* Model Comparison */}
          <div className="card">
            <div className="card-header">
              <h3>Model Performance Comparison</h3>
            </div>
            <div className="card-body">
              <table className="data-table" id="model-comparison-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>MAE</th>
                    <th>RMSE</th>
                    <th>R² Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparison.map((m) => (
                    <tr key={m.model}>
                      <td style={{ fontWeight: 600 }}>{m.model}</td>
                      <td>{formatCurrency(m.mae)}</td>
                      <td>{formatCurrency(m.rmse)}</td>
                      <td>
                        <div className="r2-cell">
                          <div className="progress-bar" style={{ height: '5px', width: '80px' }}>
                            <div className={`progress-fill ${m.r2 >= 0.85 ? 'accent' : m.r2 >= 0.8 ? 'warning' : 'danger'}`} style={{ width: `${m.r2 * 100}%` }}></div>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.r2.toFixed(2)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'Selected' ? 'success' : 'neutral'}`}>
                          {m.status === 'Selected' && <CheckCircle size={12} />}
                          {m.status}
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

      {/* Churn Risk Tab */}
      {activeTab === 'churn' && (
        <div className="ai-tab-content">
          <div className="churn-summary-row">
            <div className="churn-summary-card high">
              <Zap size={20} />
              <div>
                <span className="churn-count">{churnRiskData.filter(c => c.riskLevel === 'High').length}</span>
                <span className="churn-label">High Risk</span>
              </div>
            </div>
            <div className="churn-summary-card medium">
              <AlertTriangle size={20} />
              <div>
                <span className="churn-count">{churnRiskData.filter(c => c.riskLevel === 'Medium').length}</span>
                <span className="churn-label">Medium Risk</span>
              </div>
            </div>
            <div className="churn-summary-card low">
              <Shield size={20} />
              <div>
                <span className="churn-count">{churnRiskData.filter(c => c.riskLevel === 'Low').length}</span>
                <span className="churn-label">Low Risk</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Churn Risk Scores</h3>
              <span className="badge danger"><Zap size={12} /> ML Classification</span>
            </div>
            <div className="card-body">
              <table className="data-table" id="churn-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Segment</th>
                    <th>Churn Probability</th>
                    <th>LTV</th>
                    <th>Last Active</th>
                    <th>Risk Level</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {churnRiskData.map((c) => (
                    <tr key={c.customerId}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>#{c.customerId}</td>
                      <td><span className="badge neutral">{c.segment}</span></td>
                      <td>
                        <div className="r2-cell">
                          <div className="progress-bar" style={{ height: '6px', width: '70px' }}>
                            <div className={`progress-fill ${c.churnProb >= 0.7 ? 'danger' : c.churnProb >= 0.4 ? 'warning' : 'accent'}`} style={{ width: `${c.churnProb * 100}%` }}></div>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{(c.churnProb * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(c.ltv)}</td>
                      <td>{c.lastActive}</td>
                      <td><span className={`badge ${riskBadgeClass(c.riskLevel)}`}>{c.riskLevel}</span></td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>{c.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="ai-tab-content">
          <div className="recommendations-grid" id="recommendations-grid">
            {productRecommendations.map((rec) => (
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

      {/* Anomaly Alerts Tab */}
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
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Detected</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalyAlerts.map((a) => (
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
                            <div className={`progress-fill ${a.severity >= 8 ? 'danger' : a.severity >= 5 ? 'warning' : 'primary'}`} style={{ width: `${a.severity * 10}%` }}></div>
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
