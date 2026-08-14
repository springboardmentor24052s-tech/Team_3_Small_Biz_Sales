import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const pageTitles = {
  '/': 'Overview Dashboard',
  '/sales': 'Sales Management',
  '/products': 'Products & Inventory',
  '/customers': 'Customer Directory & RFM',
  '/ai-insights': 'AI Insights & Analytics',
  '/reports': 'Reports & Export',
  '/settings': 'Settings & User Management',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const title = pageTitles[location.pathname] || 'Dashboard';
  const role = user?.role || 'OWNER';
  const name = user?.full_name || 'Business Owner';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header" id="main-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="header-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search invoice, StockCode, customer..."
            className="search-input"
            id="global-search"
          />
        </div>
        <button className="header-notification" id="notifications-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="header-profile-wrap" style={{ position: 'relative' }}>
          <div
            className="header-profile"
            id="user-profile"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar">{initials}</div>
            <div className="profile-info">
              <span className="profile-name">{name}</span>
              <span className="profile-role">{role}</span>
            </div>
            <ChevronDown size={16} className="profile-chevron" />
          </div>

          {showDropdown && (
            <div
              className="profile-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--surface-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px 0',
                width: '180px',
                zIndex: 100
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-light)', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Role: <strong style={{ color: 'var(--primary-600)' }}>{role}</strong>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowDropdown(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none' }}
              >
                <SettingsIcon size={16} /> User Settings
              </Link>
              <button
                onClick={handleLogout}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--danger-600)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
