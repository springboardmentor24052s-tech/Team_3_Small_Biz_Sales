import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, User, Shield, Bell, Database, Save, Check,
  UserPlus, Lock, AlertTriangle, Users, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user: currentUser, isAdmin } = useAuth();
  const [usersList, setUsersList] = useState([
    { id: '1', email: 'admin@marketmind.ai', full_name: 'System Administrator', is_active: true, roles: ['ADMIN'] },
    { id: '2', email: 'owner@marketmind.ai', full_name: 'Business Owner', is_active: true, roles: ['OWNER'] },
    { id: '3', email: 'manager@marketmind.ai', full_name: 'Store Manager', is_active: true, roles: ['MANAGER'] },
    { id: '4', email: 'sales@marketmind.ai', full_name: 'Sales Executive', is_active: true, roles: ['SALES'] },
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('SALES');
  const [newPassword, setNewPassword] = useState('user123');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    // Fetch live users from backend API if Admin
    if (isAdmin) {
      async function loadUsers() {
        try {
          const res = await fetch('http://localhost:8000/api/v1/users/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setUsersList(data);
            }
          }
        } catch (err) {
          console.log('Using default users list:', err);
        }
      }
      loadUsers();
    }
  }, [isAdmin]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg('');

    if (newRole === 'ADMIN') {
      setUserMsg('Cannot create another Admin. There can be only ONE System Administrator.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newName,
          role: newRole
        })
      });

      if (res.ok) {
        const created = await res.json();
        setUsersList(prev => [...prev, created]);
        setShowAddModal(false);
        setNewEmail('');
        setNewName('');
      } else {
        const errData = await res.json();
        setUserMsg(errData.detail || 'Failed to create user');
      }
    } catch (err) {
      const created = {
        id: String(Date.now()),
        email: newEmail,
        full_name: newName,
        is_active: true,
        roles: [newRole]
      };
      setUsersList(prev => [...prev, created]);
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
    }
  };

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        if (u.roles.includes('ADMIN')) {
          alert('Cannot deactivate the System Administrator account.');
          return u;
        }
        return { ...u, is_active: !u.is_active };
      }
      return u;
    }));
  };

  const roleBadgeClass = (roles) => {
    const r = Array.isArray(roles) ? roles[0] : roles;
    switch (r) {
      case 'ADMIN': return 'danger';
      case 'OWNER': return 'primary';
      case 'MANAGER': return 'info';
      case 'SALES': return 'success';
      default: return 'neutral';
    }
  };

  return (
    <div className="page-content animate-in">
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* User Profile Card — Visible to ALL Roles */}
        <div className="card">
          <div className="card-header">
            <h3><User size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> User Profile & Settings</h3>
            <span className={`badge ${roleBadgeClass(currentUser?.role)}`}>
              Role: {currentUser?.role || 'OWNER'}
            </span>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={currentUser?.full_name || 'User'} readOnly />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={currentUser?.email || 'user@marketmind.ai'} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Non-Admin Access Control Notice */}
        {!isAdmin && (
          <div className="card" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--primary-800)' }}>
              <Shield size={24} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>System Administrator Restrictions</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                  User Management, Access Controls, and General Platform Settings are restricted to the <strong>System Administrator</strong> (<code>admin@marketmind.ai</code>).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Management & Access Control — ADMIN ONLY */}
        {isAdmin && (
          <div className="card" id="user-management-section">
            <div className="card-header">
              <div>
                <h3><Users size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> User Management & Access Control</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  System Administrator Panel. Exactly <strong>ONE System Admin</strong> allowed.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} id="add-user-btn">
                <UserPlus size={16} /> Create New User
              </button>
            </div>
            <div className="card-body">
              <table className="data-table" id="users-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Assigned Role</th>
                    <th>Access Scope</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => {
                    const primaryRole = u.roles ? u.roles[0] : 'OWNER';
                    return (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${roleBadgeClass(primaryRole)}`}>
                            {primaryRole === 'ADMIN' && <Lock size={11} style={{ marginRight: '4px' }} />}
                            {primaryRole}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {primaryRole === 'ADMIN' && 'System Config & User Admin (1 Only)'}
                          {primaryRole === 'OWNER' && 'Full Business Analytics & Reports'}
                          {primaryRole === 'MANAGER' && 'Products, Stock Alerts & Reorders'}
                          {primaryRole === 'SALES' && 'Transactions & Invoice Entry'}
                        </td>
                        <td>
                          <span className={`badge ${u.is_active ? 'success' : 'neutral'}`}>
                            {u.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          {primaryRole !== 'ADMIN' ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => toggleUserStatus(u.id)}>
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Protected Admin</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating User — ADMIN ONLY */}
        {isAdmin && showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create System User</h2>
                <button onClick={() => setShowAddModal(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  {userMsg && (
                    <div className="login-error" style={{ marginBottom: '14px' }}>
                      <AlertTriangle size={16} /> {userMsg}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" required />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@marketmind.ai" required />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                      <option value="OWNER">OWNER — Business Owner (Analytics & Reports)</option>
                      <option value="MANAGER">MANAGER — Store Manager (Products & Inventory)</option>
                      <option value="SALES">SALES — Sales Executive (Transactions)</option>
                      <option value="ADMIN" disabled>ADMIN — (Disabled: Only 1 Admin Allowed)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* General Platform Settings — ADMIN ONLY */}
        {isAdmin && (
          <div className="card">
            <div className="card-header">
              <h3><SettingsIcon size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> General Platform Settings</h3>
              {saved && <span className="badge success"><Check size={14} /> Saved</span>}
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveSettings} className="settings-form">
                <div className="settings-section">
                  <h4><Shield size={18} /> Default Currency & Locale</h4>
                  <div className="form-row">
                    <div>
                      <label className="form-label">Currency</label>
                      <select className="form-select" defaultValue="GBP">
                        <option value="GBP">GBP (£) British Pound</option>
                        <option value="USD">USD ($) US Dollar</option>
                        <option value="EUR">EUR (€) Euro</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Backend API URL</label>
                      <input type="text" className="form-input" defaultValue="http://localhost:8000/api/v1" />
                    </div>
                  </div>
                </div>

                <div className="toolbar-right" style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
