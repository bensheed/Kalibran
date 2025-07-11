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
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
        try {
            // A simple API call to check the server status
            await api.get('/settings'); 
        } catch (error: any) {
            console.error("Failed to check server status:", error);
            if (error.response) {
                console.error("Error response:", error.response);
                if (error.response.status === 409) {
                    navigate('/setup');
                }
            } else {
                console.error("The error object does not have a 'response' property.");
            }
        } finally {
            setLoading(false);
        }
    };
    checkStatus();
}, [navigate]);

  useEffect(() => {
    const handleAuthChange = async () => {
      if (isAuthenticated) {
        try {
          const boardsResponse = await api.get('/boards');
          if (boardsResponse.data && boardsResponse.data.length > 0) {
            navigate(`/board/${boardsResponse.data[0].id}`);
          } else {
            navigate('/create-board');
          }
        } catch (error) {
          console.error("Failed to fetch boards after login:", error);
          // Optional: handle error, e.g., navigate to an error page
        }
      }
    };
    handleAuthChange();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/create-board" element={isAuthenticated ? <CreateBoard /> : <Login />} />
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
