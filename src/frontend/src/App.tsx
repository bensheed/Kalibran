import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login/Login';
import Board from './components/Board/Board';
import Settings from './components/Settings/Settings';
import Setup from './components/Setup/Setup';
import api from './services/api';

function App() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
        try {
            // A simple API call to check the server status
            await api.get('/settings'); 
        } catch (error: any) {
            if (error.response && error.response.data.setupRequired) {
                navigate('/setup');
            }
        } finally {
            setLoading(false);
        }
    };
    checkStatus();
}, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const lastViewedBoardId = localStorage.getItem('lastViewedBoardId');
      if (lastViewedBoardId) {
        navigate(`/board/${lastViewedBoardId}`);
      }
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/settings" element={isAuthenticated ? <Settings /> : <Login />} />
      <Route path="/board/:boardId" element={isAuthenticated ? <Board /> : <Login />} />
      <Route path="/" element={isAuthenticated ? <Board /> : <Login />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
