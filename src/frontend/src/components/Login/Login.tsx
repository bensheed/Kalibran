import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuthStore2 as useAuthStore } from '../../store/authStore2';
import './Login.css';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const { login, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/create-board');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            console.log('--- Login Attempt (Frontend) ---');
            console.log('PIN entered:', pin);
            
            console.log('Sending login request to backend...');
            const data = await loginUser(pin);
            
            console.log('Response status: 200');
            console.log('Response data:', data);
            
            // Show success message briefly
            setSuccess('Login successful! Redirecting...');
            console.log('Login successful on frontend with token:', data.token);
            
            // Update auth state
            login(data.token);
            
            // Check auth state after login
            console.log('Auth state after login:', isAuthenticated ? 'Authenticated' : 'Not Authenticated');
            console.log('Token stored:', useAuthStore.getState().token);
            
            // Navigate after a brief delay to show success message
            console.log('Navigating to /create-board');
            setTimeout(() => {
                navigate('/create-board');
            }, 1000);
            
        } catch (err: any) {
            setError(err.message || 'Invalid PIN. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only digits, max 4
        setPin(value);
        setError(''); // Clear error when user starts typing
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">🔬</div>
                    <h1 className="login-title">Kalibran</h1>
                    <p className="login-subtitle">Calibration Lab Management System</p>
                </div>

                <div className="role-indicator">
                    <span className="role-icon">👤</span>
                    Admin Access Required
                </div>

                <form onSubmit={handleLogin}>
                    <div className="pin-input-container">
                        <label htmlFor="pin" className="pin-input-label">
                            Enter 4-Digit PIN
                        </label>
                        <input
                            id="pin"
                            type="password"
                            value={pin}
                            onChange={handlePinChange}
                            placeholder="••••"
                            className="pin-input"
                            maxLength={4}
                            disabled={loading}
                            autoComplete="current-password"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="login-success">
                            {success}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading || pin.length !== 4}
                    >
                        {loading ? (
                            <div className="login-loading">
                                <div className="login-spinner"></div>
                                Authenticating...
                            </div>
                        ) : (
                            'Access Admin Panel'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="login-footer-text">
                        Lab technicians can access boards directly without login.
                    </p>
                    <Link to="/create-board" className="login-footer-link">
                        Continue as Lab Tech →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
