import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login/Login';
import Board from './components/Board/Board';
import Settings from './components/Settings/Settings';
import Setup from './components/Setup/Setup';
import CreateBoard from './components/CreateBoard/CreateBoard';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple initialization without async
    const checkAuth = () => {
      const hasSession = document.cookie.includes('session_id');
      if (hasSession) {
        useAuthStore.getState().login();
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/create-board" element={isAuthenticated ? <CreateBoard /> : <Login />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Login />} />
        <Route path="/board/:boardId" element={isAuthenticated ? <Board /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Board /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
