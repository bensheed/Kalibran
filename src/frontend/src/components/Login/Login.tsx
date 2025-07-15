import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('--- Login Attempt (Frontend) ---');
        console.log('PIN entered:', pin);

        try {
            console.log('Sending login request to backend...');
            
            // Use the API instance
            const response = await api.post('/api/login', { pin });
            
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            
            // With axios, successful responses come here
            console.log('Login successful on frontend with token:', response.data.token);
            
            // The login function will set the cookie
            login(response.data.token); // Update the auth state with token
            
            console.log('Auth state after login:', useAuthStore.getState().isAuthenticated ? 'Authenticated' : 'Not authenticated');
            console.log('Token stored:', useAuthStore.getState().token);
            
            // Use React Router for navigation
            console.log('Navigating to /create-board');
            navigate('/create-board');
        } catch (err: any) {
            console.error('--- CRITICAL ERROR during frontend login ---', err);
            console.error('Error object:', err);
            
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                setError(`Error (${err.response.status}): ${err.response.data.message || 'An error occurred'}`);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
                setError('No response from server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', err.message);
                setError(`Error: ${err.message || 'Unknown error'}`);
            }
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Admin Login</h2>
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN"
                    className="login-input"
                />
                <button type="submit" className="login-button">Login</button>
                {error && <p className="login-error">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
