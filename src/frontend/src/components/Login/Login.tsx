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
            console.log('API URL:', api.defaults.baseURL);
            
            console.log('Using API URL:', api.defaults.baseURL);
            const response = await api.post('/login', { pin }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Backend response received:', response);

            if (response.status === 200 && response.data.token) {
                console.log('Login successful on frontend. Calling login() from auth store with token:', response.data.token);
                // The login function will set the cookie
                login(response.data.token); // Update the auth state with token
                
                console.log('Auth state after login:', useAuthStore.getState().isAuthenticated ? 'Authenticated' : 'Not authenticated');
                console.log('Token stored:', useAuthStore.getState().token);
                console.log('Navigating to /create-board');
                
                // Force a hard redirect instead of using React Router
                console.log('Forcing hard redirect to /create-board');
                window.location.href = '/create-board';
            } else {
                console.warn('Login response was not successful or did not contain a token.', response);
                setError('Login failed. Please check the console for details.');
            }
        } catch (err: any) {
            console.error('--- CRITICAL ERROR during frontend login ---', err);
            console.error('Error object:', err);
            
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status code:', err.response.status);
                setError(`Error (${err.response.status}): ${err.response.data?.message || 'An error occurred'}`);
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Please check your connection.');
            } else {
                console.error('Error message:', err.message);
                setError(`Error: ${err.message}`);
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
