import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import Sales from './pages/Sales/Sales';
import Inventory from './pages/Inventory/Inventory';
import Customers from './pages/Customers/Customers';
import AIInsights from './pages/AIInsights/AIInsights';
import Segmentation from './pages/Segmentation/Segmentation';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Login from './pages/Login/Login';

function LoginWrapper() {
  const { user } = useAuth();
  if (user) {
    const defaultPath = user.role === 'SALES' ? '/sales' : '/';
    return <Navigate to={defaultPath} replace />;
  }
  return <Login />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'SALES' ? '/sales' : '/';
    return <Navigate to={fallbackPath} replace />;
  }
  return children;
}

function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const defaultPath = user.role === 'SALES' ? '/sales' : '/';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER', 'SALES']}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER', 'SALES']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/segmentation"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER', 'SALES']}>
                <Segmentation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-insights"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']}>
                <AIInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'MANAGER', 'SALES']}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
