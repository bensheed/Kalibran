import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login/Login';
import Board from './components/Board/Board';
import Settings from './components/Settings/Settings';
import Setup from './components/Setup/Setup';
import CreateBoard from './components/CreateBoard/CreateBoard';
import api from './services/api';

function App() {
  const { isAuthenticated, checkAuthentication } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await checkAuthentication();
      setLoading(false);
    };
    initialize();
  }, [checkAuthentication]);

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
