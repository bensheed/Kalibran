import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated, token, test } = useAuthStore();
    const navigate = useNavigate();

    // Monitor auth state changes for debugging
    useEffect(() => {
        console.log('[LOGIN] Auth state changed:', { isAuthenticated, token: token ? `${token.substring(0, 10)}...` : 'null' });
    }, [isAuthenticated, token]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('--- Login Attempt (Frontend) ---');
        console.log('PIN entered:', pin);

        try {
            console.log('Sending login request to backend...');
            
            // NUCLEAR APPROACH: Use fetch directly to bypass axios issues
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ pin })
            });
            
            if (!response.ok) {
                // Try to get the error message from the response
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    // If we can't parse JSON, use the status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            console.log('Response status:', response.status);
            console.log('Response data:', data);
            
            // With fetch, successful responses come here
            console.log('Login successful on frontend with token:', data.token);
            
            // First test the store with a simple function
            console.log('[LOGIN] Testing store with test function...');
            try {
                test();
                console.log('[LOGIN] Test function completed successfully');
            } catch (testError) {
                console.error('[LOGIN] Error calling test function:', testError);
            }
            
            // The login function will set the cookie
            console.log('[LOGIN] About to call login function with token:', data.token);
            console.log('[LOGIN] Login function reference:', typeof login);
            
            try {
                login(data.token); // Update the auth state with token
                console.log('[LOGIN] Login function completed successfully');
            } catch (loginError) {
                console.error('[LOGIN] Error calling login function:', loginError);
                throw loginError;
            }
            
            // Check state immediately after login call
            const stateAfterLogin = useAuthStore.getState();
            console.log('[LOGIN] State immediately after login call:', stateAfterLogin);
            
            // The useEffect above will log the state changes
            console.log('[LOGIN] Navigating to /create-board');
            navigate('/create-board');
        } catch (err: any) {
            console.error('--- CRITICAL ERROR during frontend login ---', err);
            console.error('Error object:', err);
            
            // With fetch, we handle errors differently
            setError(err.message || 'Unknown error occurred');
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
