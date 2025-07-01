import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login/Login';
import Board from './components/Board/Board';
import Settings from './components/Settings/Settings';

function App() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const lastViewedBoardId = localStorage.getItem('lastViewedBoardId');
      if (lastViewedBoardId) {
        navigate(`/board/${lastViewedBoardId}`);
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
