import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('access_token') || '');

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data && data.access_token) {
      const userInfo = {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role
      };
      setToken(data.access_token);
      setUser(userInfo);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      return { success: true, user: userInfo };
    } else {
      // Offline fallback for demo
      let role = 'OWNER';
      let name = 'Business Owner';
      if (email.includes('admin')) { role = 'ADMIN'; name = 'System Administrator'; }
      else if (email.includes('manager')) { role = 'MANAGER'; name = 'Store Manager'; }
      else if (email.includes('sales')) { role = 'SALES'; name = 'Sales Executive'; }

      const userInfo = { id: 'demo-id', email, full_name: name, role };
      setToken('demo-token');
      setUser(userInfo);
      localStorage.setItem('access_token', 'demo-token');
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      return { success: true, user: userInfo };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'OWNER';
  const isManager = user?.role === 'MANAGER';
  const isSales = user?.role === 'SALES';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isOwner, isManager, isSales }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
