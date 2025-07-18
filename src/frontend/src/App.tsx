import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore2 as useAuthStore } from './store/authStore2';
import Login from './components/Login/Login';
import CreateBoard from './components/CreateBoard/CreateBoard';
import Setup from './components/Setup/Setup';

// Debug component to show current route and auth state
const RouteDebugger: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, token } = useAuthStore();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Route: {location.pathname}</div>
      <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Token: {token ? 'Present' : 'None'}</div>
    </div>
  );
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppContent() {
  const { initializeAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App: Initializing auth...');
    try {
      initializeAuth();
      console.log('App: Auth initialized');
    } catch (err) {
      console.error('App: Error initializing auth:', err);
    } finally {
      setLoading(false);
    }
  }, [initializeAuth]);

  if (loading) {
    return <div style={{ padding: '20px', fontSize: '18px' }}>Loading...</div>;
  }

  return (
    <>
      <RouteDebugger />
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-board" element={
          <ProtectedRoute>
            <CreateBoard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/create-board" replace />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
