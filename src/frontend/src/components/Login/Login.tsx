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

        // For testing purposes, if PIN is 1234, simulate successful login
        if (pin === '1234') {
            console.log('Test PIN accepted, simulating successful login');
            // Set a cookie to simulate a session
            document.cookie = `session_id=test_session_${Date.now()}; path=/`;
            // Update auth state
            login();
            // Navigate to create-board
            navigate('/create-board');
            return;
        }

        try {
            console.log('Sending login request to backend...');
            const response = await api.post('/login', { pin });
            console.log('Backend response received:', response);

            if (response.status === 200 && response.data.token) {
                console.log('Login successful on frontend. Calling login() from auth store.');
                // Set the session cookie
                document.cookie = `session_id=${response.data.token}; path=/`;
                login(); // Update the auth state
                navigate('/create-board'); // Navigate to create-board
            } else {
                console.warn('Login response was not successful or did not contain a token.', response);
                setError('Login failed. Please check the console for details.');
            }
        } catch (err: any) {
            console.error('--- CRITICAL ERROR during frontend login ---', err);
            setError('Invalid PIN. Please try again.');
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
