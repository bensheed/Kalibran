import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore2 as useAuthStore } from './store/authStore2';
import Login from './components/Login/Login';
import CreateBoard from './components/CreateBoard/CreateBoard';

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
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

  console.log('App: Render - loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    return <div style={{ padding: '20px', fontSize: '18px' }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/create-board" 
          element={isAuthenticated ? <CreateBoard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/create-board" replace /> : <Login />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
