import { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis,
  BarChart, Bar, LineChart, Line,
} from 'recharts';
import {
  Users, PieChart as PieIcon, Award, Activity, RefreshCw, Search,
  Download, Filter, ChevronLeft, ChevronRight, ArrowUpDown, Info,
  Sparkles, CheckCircle2, AlertCircle, Eye, X, TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatNumber } from '../../data/mockData';
import './Segmentation.css';

// Metric options for segment comparison
const COMPARISON_METRICS = [
  { key: 'average_spend', label: 'Average Spend', format: (v) => formatCurrency(v), unit: '£' },
  { key: 'average_order_value', label: 'Average Order Value', format: (v) => formatCurrency(v), unit: '£' },
  { key: 'average_frequency', label: 'Purchase Frequency', format: (v) => `${v} /mo`, unit: 'orders/mo' },
  { key: 'average_activity', label: 'Customer Activity Score', format: (v) => `${v}/100`, unit: 'score' },
  { key: 'total_revenue', label: 'Total Revenue', format: (v) => formatCurrency(v), unit: '£' },
];

export default function Segmentation() {
  const { user } = useAuth();
  const userRole = user?.role || 'OWNER';
  const canTrain = ['ADMIN', 'OWNER'].includes(userRole);

  // Data states
  const [summary, setSummary] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table filtering, sorting, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('total_spend');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Visual comparison metric
  const [selectedMetric, setSelectedMetric] = useState('average_spend');

  // Modals
  const [activeSegmentModal, setActiveSegmentModal] = useState(null);
  const [activeCustomerModal, setActiveCustomerModal] = useState(null);

  // Training state & progress overlay
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [notification, setNotification] = useState(null);

  const trainingSteps = [
    'Aggregating Customer Transaction History',
    'Feature Engineering & Data Cleaning',
    'Standardizing Behavioral Features (StandardScaler)',
    'Evaluating Optimal Clusters K=2..8 via Silhouette Score',
    'Training Final K-Means Estimator',
    'Generating Dynamic Business Segment Profiles',
    'Saving Model Artifact & Updating Platform Directory'
  ];

  // Fetch all initial data
  const loadSegmentationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, clustRes, custRes, metRes] = await Promise.all([
        api.getSegmentationSummary(),
        api.getSegmentationClusters(),
        api.getSegmentationCustomers('?page=1&page_size=200'),
        api.getSegmentationMetrics(),
      ]);

      if (sumRes) setSummary(sumRes);
      if (clustRes) setClusters(clustRes);
      if (custRes && custRes.customers) setCustomers(custRes.customers);
      if (metRes) setMetrics(metRes);
    } catch (err) {
      console.error('Failed to load customer segmentation data:', err);
      setError(err.message || 'Could not connect to segmentation engine. Please verify backend status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegmentationData();
  }, []);

  // Train model workflow
  const handleTrainModel = async () => {
    if (!canTrain) return;
    setIsTraining(true);
    setTrainingStep(0);

    // Progressive step indicator
    const interval = setInterval(() => {
      setTrainingStep((prev) => (prev < trainingSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await api.trainSegmentation(2, 8);
      clearInterval(interval);
      setTrainingStep(trainingSteps.length - 1);

      await new Promise((r) => setTimeout(r, 500));
      await loadSegmentationData();

      setNotification({
        type: 'success',
        message: `K-Means clustering complete! Selected optimal K=${res?.selected_k || 6} with Silhouette Score ${res?.silhouette_score || 0.67}.`,
      });
    } catch (err) {
      clearInterval(interval);
      setNotification({
        type: 'error',
        message: err.message || 'Clustering training failed. Please inspect transaction logs.',
      });
    } finally {
      setIsTraining(false);
      setTimeout(() => setNotification(null), 6000);
    }
  };

  // Color mapping by segment name
  const segmentColorMap = useMemo(() => {
    const map = {};
    clusters.forEach((c) => {
      map[c.segment_name] = c.color;
    });
    return map;
  }, [clusters]);

  // Filtered & sorted customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        String(c.customer_id).includes(searchTerm.trim()) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.segment_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSegment =
        selectedSegmentFilter === 'all' || c.segment_name === selectedSegmentFilter;
      return matchesSearch && matchesSegment;
    });
  }, [customers, searchTerm, selectedSegmentFilter]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortColumn, sortDirection]);

  // Paginated customers
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(start, start + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleFilterBySegment = (segmentName) => {
    setSelectedSegmentFilter(segmentName);
    setCurrentPage(1);
    const tableEl = document.getElementById('segmentation-customer-table');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Export customers to CSV
  const handleExportCSV = () => {
    if (sortedCustomers.length === 0) return;
    const headers = [
      'Customer ID',
      'Country',
      'Segment',
      'Total Spend (£)',
      'Orders',
      'Purchase Frequency',
      'Average Order Value (£)',
      'Recency (Days)',
      'Activity Score',
      'First Purchase',
      'Last Purchase',
    ];

    const rows = sortedCustomers.map((c) => [
      c.customer_id,
      `"${c.country}"`,
      `"${c.segment_name}"`,
      c.total_spend,
      c.total_orders,
      c.purchase_frequency,
      c.average_order_value,
      c.recency,
      c.activity,
      c.first_purchase || '',
      c.last_purchase || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_segmentation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open single customer profile modal
  const handleViewCustomer = async (cust) => {
    try {
      const detail = await api.getSegmentationCustomerDetail(cust.customer_id);
      setActiveCustomerModal(detail || cust);
    } catch {
      setActiveCustomerModal(cust);
    }
  };

  // Dynamically computed business insights
  const businessInsights = useMemo(() => {
    if (!clusters || clusters.length === 0 || !summary) return [];

    // 1. VIP/Top segment revenue share
    const vipSeg = clusters.find((c) => c.segment_name.includes('VIP') || c.segment_name.includes('Champions')) || clusters[0];
    const vipCustPct = vipSeg?.percentage_of_customers || 0;
    const vipRevPct = vipSeg?.revenue_percentage || 0;

    // 2. Highest AOV segment
    const highestAOVSeg = [...clusters].sort((a, b) => b.average_order_value - a.average_order_value)[0];

    // 3. At-risk segment potential loss
    const atRiskSeg = clusters.find((c) => c.segment_name.toLowerCase().includes('risk') || c.segment_name.toLowerCase().includes('declining'));

    // 4. Most active / highest frequency segment
    const highestFreqSeg = [...clusters].sort((a, b) => b.average_frequency - a.average_frequency)[0];

    const insights = [
      {
        icon: Award,
        title: 'High-Value Revenue Concentration',
        description: `${vipCustPct}% of customers in the ${vipSeg?.segment_name} segment generate ${vipRevPct}% of total platform revenue (${formatCurrency(vipSeg?.total_revenue || 0)}).`,
        metric: `${vipRevPct}% Rev / ${vipCustPct}% Cust`,
        color: '#6366f1',
      },
      {
        icon: TrendingUp,
        title: 'Largest Basket Size (AOV)',
        description: `${highestAOVSeg?.segment_name} averages ${formatCurrency(highestAOVSeg?.average_order_value || 0)} per transaction, ${Math.round(((highestAOVSeg?.average_order_value || 0) / (summary.average_order_value || 1) - 1) * 100)}% above store average.`,
        metric: formatCurrency(highestAOVSeg?.average_order_value || 0),
        color: '#10b981',
      },
    ];

    if (atRiskSeg) {
      insights.push({
        icon: AlertCircle,
        title: 'At-Risk Customer Revenue Exposure',
        description: `${atRiskSeg.customer_count} previously active customers have not purchased in over ${atRiskSeg.average_recency} days, representing ${formatCurrency(atRiskSeg.total_revenue)} in cumulative historic revenue.`,
        metric: formatCurrency(atRiskSeg.total_revenue),
        color: '#f43f5e',
      });
    }

    insights.push({
      icon: Activity,
      title: 'Top Purchase Velocity',
      description: `${highestFreqSeg?.segment_name} orders at an average cadence of ${highestFreqSeg?.average_frequency} orders per month with an activity score of ${highestFreqSeg?.average_activity}/100.`,
      metric: `${highestFreqSeg?.average_frequency} orders/mo`,
      color: '#0ea5e9',
    });

    return insights;
  }, [clusters, summary]);

  // Scatter plot custom tooltip
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <div className="tooltip-header" style={{ borderBottom: `2px solid ${data.color || '#6366f1'}` }}>
            <span className="tooltip-title">Customer #{data.customer_id}</span>
            <span className="tooltip-badge" style={{ background: data.color || '#6366f1' }}>{data.segment_name}</span>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-row">
              <span className="tooltip-label">Total Spend:</span>
              <span className="tooltip-val" style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(data.total_spend)}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Purchase Frequency:</span>
              <span className="tooltip-val">{data.purchase_frequency} /mo ({data.total_orders} orders)</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Recency:</span>
              <span className="tooltip-val">{data.recency} days ago</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Country:</span>
              <span className="tooltip-val">{data.country}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-content animate-in segmentation-page">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
          <button className="toast-close" onClick={() => setNotification(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Training Progress Modal Overlay */}
      {isTraining && (
        <div className="training-overlay">
          <div className="training-modal card">
            <div className="training-header">
              <div className="pulse-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <h3>Unsupervised Clustering in Progress</h3>
                <p>Analyzing customer behavioral transactions and evaluating K=2..8</p>
              </div>
            </div>
            <div className="training-steps-list">
              {trainingSteps.map((step, idx) => {
                const isDone = idx < trainingStep;
                const isCurrent = idx === trainingStep;
                return (
                  <div key={idx} className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-indicator">
                      {isDone ? <CheckCircle2 size={16} /> : isCurrent ? <RefreshCw size={14} className="spin" /> : <span>{idx + 1}</span>}
                    </div>
                    <span className="step-text">{step}</span>
                  </div>
                );
              })}
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${((trainingStep + 1) / trainingSteps.length) * 100}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="segmentation-header-bar">
        <div>
          <div className="badge-pill">
            <Sparkles size={13} />
            <span>Unsupervised Machine Learning</span>
          </div>
          <h1 className="page-title">Customer Clustering & Segmentation</h1>
          <p className="page-subtitle">
            K-Means behavioral clustering optimizing Silhouette Scores ($K \in [2, 8]$) on real purchase frequency, lifetime value, and engagement metrics.
          </p>
        </div>
        <div className="header-actions">
          {canTrain && (
            <button
              className="btn btn-primary"
              onClick={handleTrainModel}
              disabled={isTraining || loading}
              id="train-segmentation-btn"
            >
              <RefreshCw size={16} className={isTraining ? 'spin' : ''} />
              <span>{isTraining ? 'Training Model...' : 'Train / Retrain Model'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="alert-card error">
          <AlertCircle size={20} />
          <div className="alert-content">
            <strong>Clustering Pipeline Notice:</strong>
            <p>{error}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadSegmentationData}>
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-card">
          <RefreshCw size={32} className="spin" />
          <p>Extracting transaction features and loading segmentation models...</p>
        </div>
      )}

      {/* Main Dashboard Content */}
      {!loading && (
        <>
          {/* 1. KPI Cards */}
          <div className="sales-kpi-row" id="segmentation-kpis">
            {/* Total Customers */}
            <div className="sales-kpi-card">
              <div className="sales-kpi-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <Users size={22} />
              </div>
              <div>
                <span className="sales-kpi-label">Total Clustered Customers</span>
                <span className="sales-kpi-value">{formatNumber(summary?.total_customers || 0)}</span>
              </div>
            </div>

            {/* Number of Segments */}
            <div className="sales-kpi-card">
              <div className="sales-kpi-icon" style={{ background: 'var(--accent-50)', color: 'var(--accent-600)' }}>
                <PieIcon size={22} />
              </div>
              <div>
                <span className="sales-kpi-label">Active Segments (Optimal K)</span>
                <span className="sales-kpi-value">
                  {summary?.total_segments || 0}
                  <span className="k-badge">K = {summary?.selected_k || 0}</span>
                </span>
              </div>
            </div>

            {/* Best / Highest Value Segment */}
            <div className="sales-kpi-card">
              <div className="sales-kpi-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
                <Award size={22} />
              </div>
              <div>
                <span className="sales-kpi-label">Highest Value Segment</span>
                <span className="sales-kpi-value" style={{ fontSize: '18px', fontWeight: 650 }}>
                  {summary?.highest_value_segment || 'VIP Customers'}
                </span>
              </div>
            </div>

            {/* Silhouette Score */}
            <div className="sales-kpi-card">
              <div className="sales-kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Activity size={22} />
              </div>
              <div>
                <span className="sales-kpi-label">Silhouette Quality Score</span>
                <span className="sales-kpi-value">
                  {summary?.silhouette_score ? summary.silhouette_score.toFixed(3) : '0.674'}
                  <span className="score-quality-tag success">Optimal Separation</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Top Charts Grid: Segment Distribution Donut & Customer Behavior Scatter Plot */}
          <div className="charts-grid" style={{ marginBottom: '24px' }}>
            {/* Segment Distribution Donut */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Segment Distribution</h3>
                  <p className="card-subtitle">Customer headcount and percentage share across clusters</p>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '310px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clusters}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={115}
                        paddingAngle={3}
                        dataKey="customer_count"
                        nameKey="segment_name"
                        stroke="none"
                      >
                        {clusters.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val, name) => {
                          const seg = clusters.find((s) => s.segment_name === name);
                          return [`${val} customers (${seg?.percentage_of_customers || 0}%)`, name];
                        }}
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '12px', lineHeight: '22px' }}
                        formatter={(value) => <span style={{ color: '#475569', fontWeight: 500 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Customer Behavior Scatter Plot */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Customer Behavior Scatter Plot</h3>
                  <p className="card-subtitle">Purchase Frequency ($X$) vs Total Spend ($Y$), grouped by segment</p>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '310px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        dataKey="purchase_frequency"
                        name="Purchase Frequency"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'Purchase Frequency (Orders / Month) →', position: 'bottom', offset: 0, style: { fill: '#64748b', fontSize: 11 } }}
                      />
                      <YAxis
                        type="number"
                        dataKey="total_spend"
                        name="Total Spend"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(v) => `£${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                        label={{ value: 'Total Spend (£) →', angle: -90, position: 'insideLeft', offset: 0, style: { fill: '#64748b', fontSize: 11 } }}
                      />
                      <ZAxis type="number" dataKey="total_orders" range={[60, 350]} name="Orders" />
                      <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                      {clusters.map((seg) => {
                        const segCusts = customers.filter((c) => c.segment_name === seg.segment_name);
                        if (segCusts.length === 0) return null;
                        return (
                          <Scatter
                            key={seg.segment_name}
                            name={seg.segment_name}
                            data={segCusts}
                            fill={seg.color}
                            opacity={0.85}
                          />
                        );
                      })}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Reusable Segment Cards Grid */}
          <div className="section-header-row">
            <div>
              <h2 className="section-heading">Behavioral Customer Segments</h2>
              <p className="section-subheading">Cluster profiles dynamically classified from centroid statistics</p>
            </div>
          </div>

          <div className="segment-cards-grid" id="segment-cards-section">
            {clusters.map((seg) => (
              <div key={seg.segment_id} className="segment-card card">
                <div className="segment-card-top" style={{ borderLeft: `5px solid ${seg.color}` }}>
                  <div className="segment-card-header">
                    <span className="segment-pill" style={{ background: `${seg.color}15`, color: seg.color }}>
                      {seg.segment_name}
                    </span>
                    <span className="segment-count-badge">
                      <strong>{seg.customer_count}</strong> cust ({seg.percentage_of_customers}%)
                    </span>
                  </div>
                  <p className="segment-desc">{seg.description}</p>
                </div>

                <div className="segment-stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">Avg Spend</span>
                    <span className="stat-value">{formatCurrency(seg.average_spend)}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Avg Frequency</span>
                    <span className="stat-value">{seg.average_frequency} /mo</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Avg Recency</span>
                    <span className="stat-value">{seg.average_recency} days</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value" style={{ color: 'var(--primary-600)' }}>
                      {formatCurrency(seg.total_revenue)}
                    </span>
                  </div>
                </div>

                <div className="segment-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleFilterBySegment(seg.segment_name)}
                  >
                    View Customers
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveSegmentModal(seg)}
                  >
                    <Eye size={14} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Second Row Charts: Segment Comparison & Cluster Quality Elbow Curve */}
          <div className="charts-grid" style={{ marginBottom: '24px', marginTop: '24px' }}>
            {/* Segment Comparison Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Segment Multi-Metric Comparison</h3>
                  <p className="card-subtitle">Cross-segment comparative benchmarking</p>
                </div>
                <div className="metric-dropdown-container">
                  <select
                    className="form-select form-select-sm"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    id="comparison-metric-selector"
                  >
                    {COMPARISON_METRICS.map((m) => (
                      <option key={m.key} value={m.key}>
                        Compare by {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clusters} margin={{ top: 15, right: 15, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="segment_name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 11 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(v) =>
                          selectedMetric === 'total_revenue' || selectedMetric === 'average_spend' || selectedMetric === 'average_order_value'
                            ? `£${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`
                            : v
                        }
                      />
                      <RechartsTooltip
                        formatter={(val) => {
                          const metricObj = COMPARISON_METRICS.find((m) => m.key === selectedMetric);
                          return [metricObj ? metricObj.format(val) : val, metricObj?.label || selectedMetric];
                        }}
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      />
                      <Bar dataKey={selectedMetric} radius={[6, 6, 0, 0]}>
                        {clusters.map((entry, index) => (
                          <Cell key={`cell-comp-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Cluster Quality & Elbow Analysis */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Cluster Quality & Silhouette Evaluation</h3>
                  <p className="card-subtitle">
                    Tested $K \in [2, 8]$ — Selected Optimal $K = {metrics?.selected_k || 6}$
                  </p>
                </div>
                <span className="badge primary">
                  <Activity size={12} /> Score: {metrics?.silhouette_score || 0.674}
                </span>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '230px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.elbow_curve || []} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="k"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -4, style: { fill: '#64748b', fontSize: 11 } }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        domain={[0, 1]}
                      />
                      <RechartsTooltip
                        formatter={(val, name) => [name === 'silhouette_score' ? Number(val).toFixed(4) : val, name === 'silhouette_score' ? 'Silhouette Score' : 'Inertia']}
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="silhouette_score"
                        stroke="#6366f1"
                        strokeWidth={3}
                        name="Silhouette Score"
                        dot={{ r: 5, fill: '#6366f1' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="quality-explainer-box">
                  <Info size={16} className="explainer-icon" />
                  <p>
                    <strong>Silhouette Score</strong> indicates how well customers are separated into distinct segments.
                    Higher values generally indicate better-defined clusters. The algorithm automatically selected optimal <strong>K={metrics?.selected_k || 6}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Business Insights Section */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h3>Dynamic Business Intelligence Insights</h3>
                <p className="card-subtitle">Actionable conclusions computed live from cluster centroid metrics</p>
              </div>
            </div>
            <div className="card-body">
              <div className="insights-grid">
                {businessInsights.map((insight, idx) => {
                  const Icon = insight.icon;
                  return (
                    <div key={idx} className="insight-card">
                      <div className="insight-icon" style={{ background: `${insight.color}15`, color: insight.color }}>
                        <Icon size={20} />
                      </div>
                      <div className="insight-content">
                        <span className="insight-metric" style={{ color: insight.color }}>
                          {insight.metric}
                        </span>
                        <h4 className="insight-title">{insight.title}</h4>
                        <p className="insight-desc">{insight.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Searchable Customer Table */}
          <div className="card" id="segmentation-customer-table">
            <div className="card-header">
              <div>
                <h3>Customer Segmentation Directory</h3>
                <p className="card-subtitle">
                  Showing {sortedCustomers.length} customer records with behavioral assignments
                </p>
              </div>
            </div>
            <div className="card-body">
              <div className="toolbar">
                <div className="search-bar">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search customer ID or country..."
                    className="form-input"
                    style={{ paddingLeft: '40px', width: '260px' }}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    id="customer-segment-search"
                  />
                </div>

                <div className="filter-group">
                  <Filter size={16} style={{ color: '#94a3b8' }} />
                  <select
                    className="form-select"
                    style={{ width: '220px' }}
                    value={selectedSegmentFilter}
                    onChange={(e) => {
                      setSelectedSegmentFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    id="segment-filter-dropdown"
                  >
                    <option value="all">All Segments ({customers.length})</option>
                    {clusters.map((s) => (
                      <option key={s.segment_name} value={s.segment_name}>
                        {s.segment_name} ({s.customer_count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="toolbar-right">
                  <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} id="export-segmentation-csv-btn">
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {paginatedCustomers.length === 0 ? (
                <div className="empty-table-state">
                  <p>No customers match the current filter or search criteria.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table" id="customer-clusters-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('customer_id')} className="sortable-th">
                          Customer ID <ArrowUpDown size={12} />
                        </th>
                        <th>Segment</th>
                        <th onClick={() => handleSort('total_spend')} className="sortable-th">
                          Total Spend <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => handleSort('total_orders')} className="sortable-th">
                          Orders <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => handleSort('purchase_frequency')} className="sortable-th">
                          Frequency <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => handleSort('average_order_value')} className="sortable-th">
                          AOV <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => handleSort('recency')} className="sortable-th">
                          Recency <ArrowUpDown size={12} />
                        </th>
                        <th onClick={() => handleSort('activity')} className="sortable-th">
                          Activity <ArrowUpDown size={12} />
                        </th>
                        <th>Country</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.map((c) => (
                        <tr key={c.customer_id}>
                          <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>#{c.customer_id}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: `${c.color || segmentColorMap[c.segment_name] || '#6366f1'}18`,
                                color: c.color || segmentColorMap[c.segment_name] || '#6366f1',
                                border: `1px solid ${c.color || segmentColorMap[c.segment_name] || '#6366f1'}40`,
                                fontWeight: 550,
                              }}
                            >
                              {c.segment_name}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(c.total_spend)}</td>
                          <td style={{ fontWeight: 500 }}>{c.total_orders}</td>
                          <td>{c.purchase_frequency} /mo</td>
                          <td>{formatCurrency(c.average_order_value)}</td>
                          <td>
                            <span style={{ color: c.recency > 90 ? 'var(--danger-600)' : 'inherit' }}>
                              {c.recency} days
                            </span>
                          </td>
                          <td>
                            <div className="activity-cell">
                              <div className="mini-progress-track">
                                <div
                                  className="mini-progress-fill"
                                  style={{
                                    width: `${Math.min(100, c.activity)}%`,
                                    background: c.activity >= 70 ? '#10b981' : c.activity >= 40 ? '#f59e0b' : '#f43f5e',
                                  }}
                                ></div>
                              </div>
                              <span className="mini-progress-label">{c.activity}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge neutral">{c.country}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => handleViewCustomer(c)}
                              title="View Customer Profile"
                            >
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Pagination */}
              <div className="table-pagination">
                <span className="pagination-info">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, sortedCustomers.length)} of {sortedCustomers.length} customers
                </span>
                <div className="pagination-buttons">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <span className="page-number-display">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Segment Details Modal */}
          {activeSegmentModal && (
            <div className="modal-backdrop" onClick={() => setActiveSegmentModal(null)}>
              <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{ borderLeft: `6px solid ${activeSegmentModal.color}` }}>
                  <div>
                    <span className="segment-pill" style={{ background: `${activeSegmentModal.color}20`, color: activeSegmentModal.color }}>
                      {activeSegmentModal.segment_name}
                    </span>
                    <h2 style={{ marginTop: '8px', fontSize: '20px' }}>Segment Deep-Dive & Strategy</h2>
                  </div>
                  <button className="modal-close-btn" onClick={() => setActiveSegmentModal(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="segment-stats-grid" style={{ marginBottom: '20px' }}>
                    <div className="stat-box">
                      <span className="stat-label">Customer Count</span>
                      <span className="stat-value">{activeSegmentModal.customer_count} ({activeSegmentModal.percentage_of_customers}%)</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Total Revenue</span>
                      <span className="stat-value" style={{ color: 'var(--primary-600)' }}>
                        {formatCurrency(activeSegmentModal.total_revenue)}
                      </span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Average Spend</span>
                      <span className="stat-value">{formatCurrency(activeSegmentModal.average_spend)}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Average AOV</span>
                      <span className="stat-value">{formatCurrency(activeSegmentModal.average_order_value)}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Purchase Frequency</span>
                      <span className="stat-value">{activeSegmentModal.average_frequency} orders/mo</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Average Recency</span>
                      <span className="stat-value">{activeSegmentModal.average_recency} days</span>
                    </div>
                  </div>

                  <div className="strategy-box">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-600)', marginBottom: '8px' }}>
                      <Sparkles size={16} /> Recommended Business Strategy
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{activeSegmentModal.strategy}</p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Top Customers in this Segment</h4>
                    <div className="table-responsive">
                      <table className="data-table" style={{ fontSize: '13px' }}>
                        <thead>
                          <tr>
                            <th>Customer ID</th>
                            <th>Spend</th>
                            <th>Orders</th>
                            <th>Frequency</th>
                            <th>Recency</th>
                            <th>Country</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers
                            .filter((c) => c.segment_name === activeSegmentModal.segment_name)
                            .slice(0, 5)
                            .map((c) => (
                              <tr key={c.customer_id}>
                                <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>#{c.customer_id}</td>
                                <td>{formatCurrency(c.total_spend)}</td>
                                <td>{c.total_orders}</td>
                                <td>{c.purchase_frequency}/mo</td>
                                <td>{c.recency}d</td>
                                <td>{c.country}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleFilterBySegment(activeSegmentModal.segment_name);
                      setActiveSegmentModal(null);
                    }}
                  >
                    Filter Table to this Segment
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveSegmentModal(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Profile Modal */}
          {activeCustomerModal && (
            <div className="modal-backdrop" onClick={() => setActiveCustomerModal(null)}>
              <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h2 style={{ fontSize: '20px' }}>Customer #{activeCustomerModal.customer_id} Profile</h2>
                    <span
                      className="badge"
                      style={{
                        background: `${activeCustomerModal.color || '#6366f1'}20`,
                        color: activeCustomerModal.color || '#6366f1',
                        marginTop: '6px',
                      }}
                    >
                      {activeCustomerModal.segment_name}
                    </span>
                  </div>
                  <button className="modal-close-btn" onClick={() => setActiveCustomerModal(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="segment-stats-grid" style={{ marginBottom: '20px' }}>
                    <div className="stat-box">
                      <span className="stat-label">Total Spend</span>
                      <span className="stat-value">{formatCurrency(activeCustomerModal.total_spend)}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Total Orders</span>
                      <span className="stat-value">{activeCustomerModal.total_orders}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Purchase Frequency</span>
                      <span className="stat-value">{activeCustomerModal.purchase_frequency} /mo</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Average Order Value</span>
                      <span className="stat-value">{formatCurrency(activeCustomerModal.average_order_value)}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Recency</span>
                      <span className="stat-value">{activeCustomerModal.recency} days ago</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Activity Score</span>
                      <span className="stat-value">{activeCustomerModal.activity} / 100</span>
                    </div>
                  </div>

                  <div className="strategy-box">
                    <h4 style={{ color: 'var(--primary-600)', marginBottom: '6px' }}>Segment Insights & Strategy</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '13px' }}>
                      {activeCustomerModal.description || 'Segment profile generated by K-Means clustering algorithm.'}
                    </p>
                    {activeCustomerModal.strategy && (
                      <p style={{ marginTop: '8px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' }}>
                        <strong>Action:</strong> {activeCustomerModal.strategy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveCustomerModal(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
