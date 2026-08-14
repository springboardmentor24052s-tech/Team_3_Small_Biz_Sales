import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, KeyRound, AlertCircle, LogIn, Lock, CheckCircle2, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Login.css';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res && res.success) {
        navigate('/');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (selectedRole === 'ADMIN') {
      setError('Only ONE System Administrator is allowed in the platform.');
      setLoading(false);
      return;
    }

    try {
      const registerRes = await api.register({
        full_name: fullName,
        email: email,
        password: password,
        role: selectedRole
      });

      if (registerRes) {
        setSuccessMsg(`Account created as ${selectedRole}! Signing you in...`);
        setTimeout(async () => {
          const loginRes = await login(email, password);
          if (loginRes && loginRes.success) {
            navigate('/');
          }
        }, 1200);
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPwd) => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setPassword(demoPwd);
  };

  return (
    <div className="login-container animate-in">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-brand-icon">
            <Sparkles size={28} />
          </div>
          <h2>MarketMind AI</h2>
          <p>{isSignUp ? 'Create a New Account' : 'Sales Intelligence Platform Sign In'}</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-switcher">
          <button
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
          >
            <UserPlus size={15} /> Sign Up
          </button>
        </div>

        {/* Notice Badge */}
        {/* <div className="admin-rule-notice">
          <Shield size={16} className="notice-icon" />
          <span>
            {isSignUp ? (
              <>Register as <strong>Owner</strong>, <strong>Manager</strong>, or <strong>Executive</strong>. Admin account is restricted to single System Admin.</>
            ) : (
              <>Admin & Owner are distinct. Only <strong>ONE System Admin</strong> (<code>admin@marketmind.ai</code>) is allowed in the platform.</>
            )}
          </span>
        </div> */}

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="login-success">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {!isSignUp ? (
          <form onSubmit={handleSignInSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@marketmind.ai"
                required
                id="login-email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                id="login-password"
              />
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading} id="login-submit-btn">
              {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUpSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Jenkins"
                required
                id="signup-fullname"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                required
                id="signup-email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                id="signup-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                id="signup-role"
              >
                <option value="OWNER">OWNER — Business Owner (Full Analytics & Reports)</option>
                <option value="MANAGER">MANAGER — Store Manager (Products & Stock)</option>
                <option value="SALES">SALES — Sales Executive (Transactions)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading} id="signup-submit-btn">
              {loading ? 'Creating Account...' : <><UserPlus size={18} /> Register Account</>}
            </button>
          </form>
        )}

        {/* Quick Demo Logins */}
        <div className="quick-login-section">
          <span className="quick-title">Quick Demo Sign-In:</span>
          <div className="quick-buttons">
            <button
              className={`quick-btn ${!isSignUp && email === 'admin@marketmind.ai' ? 'active' : ''}`}
              onClick={() => handleQuickLogin('admin@marketmind.ai', 'admin123')}
            >
              <Lock size={13} /> Admin
            </button>
            <button
              className={`quick-btn ${!isSignUp && email === 'owner@marketmind.ai' ? 'active' : ''}`}
              onClick={() => handleQuickLogin('owner@marketmind.ai', 'owner123')}
            >
              <Sparkles size={13} /> Owner
            </button>
            <button
              className={`quick-btn ${!isSignUp && email === 'manager@marketmind.ai' ? 'active' : ''}`}
              onClick={() => handleQuickLogin('manager@marketmind.ai', 'manager123')}
            >
              <KeyRound size={13} /> Manager
            </button>
            <button
              className={`quick-btn ${!isSignUp && email === 'sales@marketmind.ai' ? 'active' : ''}`}
              onClick={() => handleQuickLogin('sales@marketmind.ai', 'sales123')}
            >
              <CheckCircle2 size={13} /> Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
