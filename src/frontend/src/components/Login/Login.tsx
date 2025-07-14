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
            
            // Use fetch directly instead of axios
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pin }),
                credentials: 'include'
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Login successful on frontend with token:', data.token);
                
                // The login function will set the cookie
                login(data.token); // Update the auth state with token
                
                console.log('Auth state after login:', useAuthStore.getState().isAuthenticated ? 'Authenticated' : 'Not authenticated');
                console.log('Token stored:', useAuthStore.getState().token);
                
                // Use React Router for navigation
                console.log('Navigating to /create-board');
                navigate('/create-board');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.warn('Login response was not successful:', errorData);
                setError(`Error (${response.status}): ${errorData.message || 'An error occurred'}`);
            }
        } catch (err: any) {
            console.error('--- CRITICAL ERROR during frontend login ---', err);
            console.error('Error object:', err);
            setError(`Error: ${err.message || 'Unknown error'}`);
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
