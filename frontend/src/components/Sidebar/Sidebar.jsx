import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  Brain,
  TrendingDown,
  FileBarChart,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const allNavItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, roles: ['ADMIN', 'OWNER', 'MANAGER'] },
  { path: '/sales', label: 'Sales', icon: TrendingUp, roles: ['ADMIN', 'OWNER', 'MANAGER', 'SALES'] },
  { path: '/products', label: 'Products', icon: Package, roles: ['ADMIN', 'OWNER', 'MANAGER', 'SALES'] },
  { path: '/customers', label: 'Customers', icon: Users, roles: ['ADMIN', 'OWNER'] },
  { path: '/ai-insights', label: 'AI Insights', icon: Brain, roles: ['ADMIN', 'OWNER'] },
  { path: '/churn-prediction', label: 'Churn Prediction', icon: TrendingDown, roles: ['ADMIN', 'OWNER'] },
  { path: '/reports', label: 'Reports', icon: FileBarChart, roles: ['ADMIN', 'OWNER', 'MANAGER'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const role = user?.role || 'OWNER';

  const visibleNavItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div className="brand-text">
          <span className="brand-name">MarketMind</span>
          <span className="brand-tag">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">MAIN MENU</div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {isActive && <ChevronRight size={16} className="nav-arrow" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        <div className="sidebar-upgrade">
          <div className="upgrade-glow"></div>
          <Shield size={18} className="upgrade-icon" />
          <p className="upgrade-title">{role} Access</p>
          <p className="upgrade-desc">{user?.email || 'user@marketmind.ai'}</p>
        </div>
        <NavLink to="/settings" className="nav-item" id="nav-settings">
          <Settings size={20} className="nav-icon" />
          <span className="nav-label">Settings</span>
        </NavLink>
        <button className="nav-item" onClick={handleLogout} id="nav-logout">
          <LogOut size={20} className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
