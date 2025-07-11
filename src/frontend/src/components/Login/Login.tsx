import React, { useState } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('--- Login Attempt (Frontend) ---');
        console.log('PIN entered:', pin);

        try {
            console.log('Sending login request to backend...');
            const response = await api.post('/login', { pin });
            console.log('Backend response received:', response);

            if (response.status === 200 && response.data.token) {
                console.log('Login successful on frontend. Calling login() from auth store.');
                login(); // Update the auth state. App.tsx will handle the navigation.
            } else {
                console.warn('Login response was not successful or did not contain a token.', response);
                setError('Login failed. Please check the console for details.');
            }
        } catch (err: any) {
            console.error('--- CRITICAL ERROR during frontend login ---', err);
            if (err.response) {
                console.error('Error response from backend:', err.response);
                setError(`Login failed: ${err.response.data.message || 'Please try again.'}`);
            } else {
                setError('An unexpected network error occurred.');
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
