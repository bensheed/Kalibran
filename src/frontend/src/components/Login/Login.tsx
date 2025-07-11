import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/login', { pin });
            login(); // Update the auth state
            
            // After successful login, check for existing boards
            const boardsResponse = await api.get('/boards');
            if (boardsResponse.data && boardsResponse.data.length > 0) {
                // Redirect to the first board
                navigate(`/board/${boardsResponse.data[0].id}`);
            } else {
                // Redirect to a page to create the first board
                navigate('/create-board');
            }
        } catch (err: any) {
            if (err.response && err.response.status === 401) {
                setError('Invalid PIN. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again later.');
                console.error(err);
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
