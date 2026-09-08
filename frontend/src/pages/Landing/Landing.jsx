import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Package,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Moon,
  Sun,
  Lock,
  Zap,
  LineChart,
  Activity,
  Layers,
  ArrowUpRight,
  Check,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Cpu,
  Eye,
  Sliders,
  DollarSign,
  ShoppingCart,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

const previewForecastData = [
  { month: 'Jan', actual: 68200, forecast: null, upper: null, lower: null },
  { month: 'Mar', actual: 81500, forecast: null, upper: null, lower: null },
  { month: 'May', actual: 88900, forecast: null, upper: null, lower: null },
  { month: 'Jul', actual: 97800, forecast: null, upper: null, lower: null },
  { month: 'Sep', actual: 103200, forecast: null, upper: null, lower: null },
  { month: 'Nov', actual: 136800, forecast: null, upper: null, lower: null },
  { month: 'Dec', actual: 124500, forecast: 124500, upper: 124500, lower: 124500 },
  { month: 'W01+', actual: null, forecast: 128500, upper: 141350, lower: 115650 },
  { month: 'W02+', actual: null, forecast: 132000, upper: 145200, lower: 118800 },
  { month: 'W03+', actual: null, forecast: 136400, upper: 150040, lower: 122760 },
  { month: 'W04+', actual: null, forecast: 141000, upper: 155100, lower: 126900 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('forecast');
  const [demoLoading, setDemoLoading] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const handleQuickDemo = async (email, password) => {
    setDemoLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.success) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className={`enterprise-landing ${darkMode ? 'dark-theme' : ''}`}>
      {/* Top Navbar */}
      <header className="ent-navbar">
        <div className="ent-container ent-nav-container">
          <div className="ent-brand" onClick={() => navigate('/')}>
            <div className="ent-brand-badge">
              <TrendingUp size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div className="ent-brand-text">
              <span className="ent-brand-name">MarketMind</span>
              <span className="ent-brand-tag">AI Enterprise</span>
            </div>
          </div>

          <nav className="ent-nav-links">
            <a href="#showcase" className="ent-nav-link">Platform Preview</a>
            <a href="#features" className="ent-nav-link">AI Engine</a>
            <a href="#roles" className="ent-nav-link">Role Scopes</a>
            <a href="#security" className="ent-nav-link">Security & RBAC</a>
          </nav>

          <div className="ent-nav-actions">
            <button
              className="ent-icon-btn"
              onClick={toggleDarkMode}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              className="ent-btn-ghost"
              onClick={() => navigate('/login')}
              id="landing-signin-btn"
            >
              Sign In
            </button>

            <button
              className="ent-btn-primary"
              onClick={() => navigate('/login?signup=true')}
              id="landing-register-btn"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Centered Hero Section */}
      <section className="ent-hero-section">
        <div className="ent-container">
          <div className="ent-hero-center">
            {/* Pill Badge */}
            <div className="ent-hero-pill">
              <Sparkles size={14} className="pill-icon" />
              <span>Next-Gen Retail Sales Intelligence & AI Forecasting</span>
            </div>

            {/* Main Headline */}
            <h1 className="ent-hero-title">
              Transform Retail Sales Data Into <br />
              <span className="ent-gradient-text">Predictive Growth & Profit</span>
            </h1>

            {/* Subheading */}
            <p className="ent-hero-subtitle">
              MarketMind AI connects historical retail transaction logs with enterprise-grade machine learning — delivering automated revenue forecasting, inventory optimization, and customer retention intelligence in real time.
            </p>

            {/* Action Buttons */}
            <div className="ent-hero-actions">
              <button
                className="ent-cta-primary"
                onClick={() => navigate('/login?signup=true')}
                id="hero-cta-get-started"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="ent-cta-secondary"
                onClick={() => handleQuickDemo('owner@marketmind.ai', 'owner123')}
                id="hero-cta-live-demo"
              >
                <Eye size={17} />
                <span>Launch Live Demo</span>
              </button>
            </div>

            {/* Quick Demo Role Switcher Chips */}
            <div className="ent-role-chips-box">
              <span className="chips-label">Instant Live Demo As:</span>
              <div className="chips-row">
                <button
                  className="role-chip"
                  disabled={demoLoading}
                  onClick={() => handleQuickDemo('owner@marketmind.ai', 'owner123')}
                >
                  <Sparkles size={13} className="chip-icon purple" />
                  <span>Business Owner</span>
                </button>
                <button
                  className="role-chip"
                  disabled={demoLoading}
                  onClick={() => handleQuickDemo('manager@marketmind.ai', 'manager123')}
                >
                  <Package size={13} className="chip-icon green" />
                  <span>Store Manager</span>
                </button>
                <button
                  className="role-chip"
                  disabled={demoLoading}
                  onClick={() => handleQuickDemo('sales@marketmind.ai', 'sales123')}
                >
                  <Activity size={13} className="chip-icon blue" />
                  <span>Sales Executive</span>
                </button>
                <button
                  className="role-chip"
                  disabled={demoLoading}
                  onClick={() => handleQuickDemo('admin@marketmind.ai', 'admin123')}
                >
                  <Lock size={13} className="chip-icon red" />
                  <span>System Admin</span>
                </button>
              </div>
            </div>

            {/* Trust Checklist */}
            <div className="ent-trust-bar">
              <div className="trust-node">
                <CheckCircle2 size={15} color="#10b981" />
                <span>Zero Complex Setup</span>
              </div>
              <div className="trust-node">
                <CheckCircle2 size={15} color="#10b981" />
                <span>XGBoost & Prophet Forecasting</span>
              </div>
              <div className="trust-node">
                <CheckCircle2 size={15} color="#10b981" />
                <span>Single-Admin RBAC Security</span>
              </div>
              <div className="trust-node">
                <CheckCircle2 size={15} color="#10b981" />
                <span>Real-Time CSV Ingestion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Dashboard Showcase (Centerpiece) */}
      <section className="ent-showcase-section" id="showcase">
        <div className="ent-container">
          <div className="mockup-frame">
            {/* Mockup Window Bar */}
            <div className="mockup-window-bar">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="window-url-box">
                <Lock size={12} color="#64748b" />
                <span>marketmind.ai/overview-dashboard</span>
              </div>
              <div className="window-badge">
                <span className="live-pulse"></span>
                <span>Live Retail Analytics</span>
              </div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="mockup-dashboard-body">
              {/* Top KPI Metrics Row */}
              <div className="preview-kpi-grid">
                <div className="preview-kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-label">TOTAL REVENUE</span>
                    <span className="kpi-icon-box purple"><DollarSign size={16} /></span>
                  </div>
                  <div className="kpi-val">£124,500</div>
                  <div className="kpi-change positive">
                    <TrendingUp size={13} />
                    <span>+12.5% vs last period</span>
                  </div>
                </div>

                <div className="preview-kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-label">TOTAL ORDERS</span>
                    <span className="kpi-icon-box green"><ShoppingCart size={16} /></span>
                  </div>
                  <div className="kpi-val">1,210</div>
                  <div className="kpi-change positive">
                    <TrendingUp size={13} />
                    <span>+8.3% transaction volume</span>
                  </div>
                </div>

                <div className="preview-kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-label">ACTIVE CUSTOMERS</span>
                    <span className="kpi-icon-box amber"><Users size={16} /></span>
                  </div>
                  <div className="kpi-val">420</div>
                  <div className="kpi-change positive">
                    <TrendingUp size={13} />
                    <span>+15.2% retention rate</span>
                  </div>
                </div>

                <div className="preview-kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-label">RETURN RATE</span>
                    <span className="kpi-icon-box rose"><AlertTriangle size={16} /></span>
                  </div>
                  <div className="kpi-val">3.2%</div>
                  <div className="kpi-change positive">
                    <TrendingUp size={13} />
                    <span>-0.8% return rate reduction</span>
                  </div>
                </div>
              </div>

              {/* Showcase Tab Navigation */}
              <div className="preview-tabs-bar">
                <button
                  className={`preview-tab ${activeTab === 'forecast' ? 'active' : ''}`}
                  onClick={() => setActiveTab('forecast')}
                >
                  <LineChart size={15} />
                  <span>Revenue Forecasting (XGBoost & Prophet)</span>
                </button>
                <button
                  className={`preview-tab ${activeTab === 'rfm' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rfm')}
                >
                  <Users size={15} />
                  <span>Customer RFM Segmentation</span>
                </button>
                <button
                  className={`preview-tab ${activeTab === 'inventory' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  <Package size={15} />
                  <span>Smart Stock Alerts & Reorders</span>
                </button>
              </div>

              {/* Tab 1: Revenue Forecast View */}
              {activeTab === 'forecast' && (
                <div className="preview-tab-view animate-in">
                  <div className="chart-wrapper-card">
                    <div className="chart-header-row">
                      <div>
                        <h4>Revenue Time-Series Forecast</h4>
                        <p>Historical revenue logs integrated with XGBoost forward predictions</p>
                      </div>
                      <div className="model-pill-group">
                        <span className="model-tag selected">Prophet ($R^2$ 0.85)</span>
                        <span className="model-tag available">XGBoost ($R^2$ 0.84)</span>
                      </div>
                    </div>

                    <div className="chart-canvas" style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={previewForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="entActualGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="entForecastGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
                          <Tooltip formatter={(v) => v ? `£${Number(v).toLocaleString()}` : 'N/A'} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={2.5} fill="url(#entActualGrad)" name="Historical Revenue" connectNulls={false} />
                          <Area type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 4" fill="url(#entForecastGrad)" name="AI Forecast" connectNulls={false} />
                          <Area type="monotone" dataKey="upper" stroke="transparent" fill="rgba(245,158,11,0.08)" name="Upper Bound (90%)" connectNulls={false} />
                          <Area type="monotone" dataKey="lower" stroke="transparent" fill="rgba(245,158,11,0.08)" name="Lower Bound (90%)" connectNulls={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: RFM Customer View */}
              {activeTab === 'rfm' && (
                <div className="preview-tab-view animate-in">
                  <div className="rfm-showcase-grid">
                    <div className="rfm-segment-box champions">
                      <div className="rfm-header">
                        <span className="rfm-title">Champions</span>
                        <span className="rfm-badge">24% of Base</span>
                      </div>
                      <p className="rfm-desc">Recent buyers with highest monetary spend and frequent repurchase cycles.</p>
                      <div className="rfm-stat">Avg LTV: <strong>£4,850</strong></div>
                    </div>

                    <div className="rfm-segment-box loyal">
                      <div className="rfm-header">
                        <span className="rfm-title">Loyal Customers</span>
                        <span className="rfm-badge">31% of Base</span>
                      </div>
                      <p className="rfm-desc">Consistent purchase cadence with strong affinity to core catalog items.</p>
                      <div className="rfm-stat">Avg LTV: <strong>£2,920</strong></div>
                    </div>

                    <div className="rfm-segment-box atrisk">
                      <div className="rfm-header">
                        <span className="rfm-title">At Risk & Needs Attention</span>
                        <span className="rfm-badge warning">18% of Base</span>
                      </div>
                      <p className="rfm-desc">High past value but declining recency. Automated retention triggers activated.</p>
                      <div className="rfm-stat">Churn Risk: <strong>68%</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Smart Inventory View */}
              {activeTab === 'inventory' && (
                <div className="preview-tab-view animate-in">
                  <div className="inventory-preview-table">
                    <div className="table-row-head">
                      <span>Stock Code & Description</span>
                      <span>Category</span>
                      <span>Stock Level</span>
                      <span>Return Rate</span>
                      <span>Status</span>
                    </div>
                    <div className="table-row-item">
                      <div>
                        <strong>85123A</strong> — White Hanging Heart T-Light
                      </div>
                      <span>Home Decor</span>
                      <span>24 units (Low)</span>
                      <span className="text-warning">15.2%</span>
                      <span className="badge-warning">Reorder Triggered</span>
                    </div>
                    <div className="table-row-item">
                      <div>
                        <strong>71053</strong> — White Metal Lantern
                      </div>
                      <span>Lighting</span>
                      <span>140 units</span>
                      <span className="text-normal">2.1%</span>
                      <span className="badge-normal">Optimal</span>
                    </div>
                    <div className="table-row-item">
                      <div>
                        <strong>84029E</strong> — Red Woolly Hottie Faux Fur
                      </div>
                      <span>Apparel</span>
                      <span>8 units (Critical)</span>
                      <span className="text-normal">1.8%</span>
                      <span className="badge-danger">Restock Immediate</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Feature Grid */}
      <section className="ent-features-section" id="features">
        <div className="ent-container">
          <div className="ent-section-header">
            <span className="section-pretitle">INTELLIGENCE PLATFORM CAPABILITIES</span>
            <h2 className="section-headline">
              Engineered for Precision Retail Decision Making
            </h2>
            <p className="section-subtext">
              Comprehensive analytics stack replacing scattered spreadsheets with machine learning models and actionable insights.
            </p>
          </div>

          <div className="ent-feature-cards-grid">
            <div className="ent-feature-card">
              <div className="ent-card-icon-box">
                <LineChart size={24} color="#4f46e5" />
              </div>
              <h3>Time-Series Demand Forecasting</h3>
              <p>Predict weekly revenue and seasonality cycles with XGBoost, Prophet, and Random Forest ensemble models.</p>
            </div>

            <div className="ent-feature-card">
              <div className="ent-card-icon-box">
                <Users size={24} color="#059669" />
              </div>
              <h3>9-Segment RFM Customer Clusters</h3>
              <p>Cluster 400+ customers by Recency, Frequency, and Monetary spend to drive tailored retention workflows.</p>
            </div>

            <div className="ent-feature-card">
              <div className="ent-card-icon-box">
                <Package size={24} color="#0284c7" />
              </div>
              <h3>Inventory & Return Spike Auditing</h3>
              <p>Automated threshold monitoring flagging low-stock SKUs and abnormal product return rates in real time.</p>
            </div>

            <div className="ent-feature-card">
              <div className="ent-card-icon-box">
                <Zap size={24} color="#d97706" />
              </div>
              <h3>Automated Anomaly Detection</h3>
              <p>Isolation Forest engine scanning transactions for zero-price errors, duplicate entries, and data anomalies.</p>
            </div>

            <div className="ent-feature-card">
              <div className="ent-card-icon-box">
                <Shield size={24} color="#e11d48" />
              </div>
              <h3>Single-Admin RBAC Governance</h3>
              <p>Role-based access permissions tailored for Business Owners, Store Managers, Sales Execs, and System Admin.</p>
            </div>

            <div className="ent-feature-card">
              <div className="ent-card-icon-box">
                <FileSpreadsheet size={24} color="#7c3aed" />
              </div>
              <h3>Executive CSV & PDF Reporting</h3>
              <p>Export executive summaries, historical sales logs, and customer segmentation breakdowns in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Workflow Section */}
      <section className="ent-roles-section" id="roles">
        <div className="ent-container">
          <div className="ent-section-header">
            <span className="section-pretitle">TAILORED ACCESS SCOPES</span>
            <h2 className="section-headline">
              One Unified System, Customized for Every Role
            </h2>
          </div>

          <div className="ent-roles-grid">
            <div className="ent-role-card">
              <div className="role-top">
                <Sparkles size={20} className="role-icon purple" />
                <h4>Business Owner</h4>
              </div>
              <p>Executive KPIs, multi-period revenue forecasts, customer lifetime values, and automated churn prevention.</p>
            </div>

            <div className="ent-role-card">
              <div className="role-top">
                <Package size={20} className="role-icon green" />
                <h4>Store Manager</h4>
              </div>
              <p>Product catalog, real-time inventory monitoring, return rate audits, and automated stock reorder triggers.</p>
            </div>

            <div className="ent-role-card">
              <div className="role-top">
                <Activity size={20} className="role-icon blue" />
                <h4>Sales Executive</h4>
              </div>
              <p>Daily transaction management, fast invoice lookup, real-time sales logging, and product search.</p>
            </div>

            <div className="ent-role-card">
              <div className="role-top">
                <Lock size={20} className="role-icon red" />
                <h4>System Admin</h4>
              </div>
              <p>User management, access controls, model retraining triggers, and platform currency & API configurations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Centered CTA Section */}
      <section className="ent-cta-section" id="security">
        <div className="ent-container">
          <div className="ent-cta-box">
            <h2>Ready to Elevate Your Small Business Sales Intelligence?</h2>
            <p>Join businesses using MarketMind AI to forecast revenue, eliminate stockouts, and retain high-value customers.</p>
            <div className="ent-cta-btns">
              <button
                className="ent-cta-primary large"
                onClick={() => navigate('/login?signup=true')}
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </button>
              <button
                className="ent-cta-secondary large"
                onClick={() => navigate('/login')}
              >
                <span>Sign In to Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="ent-footer">
        <div className="ent-container ent-footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <TrendingUp size={18} color="#4f46e5" />
              <span>MarketMind AI</span>
            </div>
            <p>Advanced Retail Sales Intelligence Platform.</p>
          </div>
          <div className="footer-right">
            <span>© 2026 MarketMind AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
