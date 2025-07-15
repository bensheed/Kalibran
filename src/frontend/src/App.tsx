import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login/Login';
import Board from './components/Board/Board';
import Settings from './components/Settings/Settings';
import Setup from './components/Setup/Setup';
import CreateBoard from './components/CreateBoard/CreateBoard';
import api from './services/api';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    // Check if setup is required and authentication status
    const initialize = async () => {
      try {
        // Try to access a protected endpoint to see if setup is required
        await api.get('/api/boards');
        
        // If we get here, setup is complete, check authentication
        const cookies = document.cookie.split(';');
        let sessionToken = null;
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'session_id') {
            sessionToken = value;
            break;
          }
        }
        if (sessionToken) {
          useAuthStore.getState().login(sessionToken);
        }
      } catch (err: any) {
        if (err.response && err.response.status === 409 && err.response.data.setupRequired) {
          console.log('Setup required, will redirect to setup page');
          setSetupRequired(true);
        } else {
          // Other error, but setup is probably complete
          const cookies = document.cookie.split(';');
          let sessionToken = null;
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'session_id') {
              sessionToken = value;
              break;
            }
          }
          if (sessionToken) {
            useAuthStore.getState().login(sessionToken);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* If setup is required, redirect to setup page from any route except /setup */}
        {setupRequired && (
          <>
            <Route path="/setup" element={<Setup />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        )}
        
        {/* Normal routes when setup is complete */}
        {!setupRequired && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/create-board" element={isAuthenticated ? <CreateBoard /> : <Login />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Login />} />
            <Route path="/board/:boardId" element={isAuthenticated ? <Board /> : <Login />} />
            <Route path="/" element={isAuthenticated ? <Board /> : <Login />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
