import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

console.log('[LOGIN] ===== ABOUT TO IMPORT API MODULE =====');
console.log('[LOGIN] Import timestamp:', new Date().toISOString());

import { loginUser } from '../../services/api';
import * as apiModule from '../../services/api';
import apiDefault from '../../services/api';

console.log('[LOGIN] ===== API MODULE IMPORTED =====');
console.log('[LOGIN] Named import loginUser:', loginUser);
console.log('[LOGIN] Namespace import apiModule:', apiModule);
console.log('[LOGIN] Default import apiDefault:', apiDefault);
console.log('[LOGIN] apiModule.loginUser:', apiModule.loginUser);
console.log('[LOGIN] apiDefault.loginUser:', apiDefault?.loginUser);

import { useAuthStore2 as useAuthStore } from '../../store/authStore2';
import './Login.css';

console.log('[LOGIN] ===== LOGIN COMPONENT LOADING =====');
console.log('[LOGIN] Component loaded at:', new Date().toISOString());
console.log('[LOGIN] loginUser imported:', loginUser);
console.log('[LOGIN] typeof loginUser:', typeof loginUser);
console.log('[LOGIN] loginUser.name:', loginUser?.name);
console.log('[LOGIN] loginUser instanceof Function:', loginUser instanceof Function);

// Test import immediately
try {
    console.log('[LOGIN] Testing loginUser is callable...');
    if (typeof loginUser === 'function') {
        console.log('[LOGIN] ✓ loginUser is a function');
    } else {
        console.error('[LOGIN] ✗ loginUser is NOT a function, it is:', typeof loginUser);
        console.error('[LOGIN] loginUser value:', loginUser);
    }
} catch (e) {
    console.error('[LOGIN] Error testing loginUser:', e);
}

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const { login, isAuthenticated, token } = useAuthStore();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/create-board');
        }
    }, [isAuthenticated, navigate]);

    // Monitor token changes for debugging
    useEffect(() => {
        console.log('Login: Token changed to:', token);
    }, [token]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            console.log('[LOGIN] ===== LOGIN ATTEMPT STARTED =====');
            console.log('[LOGIN] PIN entered:', pin);
            console.log('[LOGIN] Timestamp:', new Date().toISOString());
            
            console.log('[LOGIN] ===== FUNCTION VALIDATION =====');
            console.log('[LOGIN] loginUser reference:', loginUser);
            console.log('[LOGIN] typeof loginUser:', typeof loginUser);
            console.log('[LOGIN] loginUser === undefined:', loginUser === undefined);
            console.log('[LOGIN] loginUser === null:', loginUser === null);
            console.log('[LOGIN] loginUser instanceof Function:', loginUser instanceof Function);
            
            // Check window object for debugging
            if (typeof window !== 'undefined') {
                console.log('[LOGIN] window.loginUser:', (window as any).loginUser);
                console.log('[LOGIN] window.apiModule:', (window as any).apiModule);
            }
            
            // Try to find a working loginUser function from multiple sources
            let workingLoginUser = null;
            
            console.log('[LOGIN] ===== TRYING DIFFERENT IMPORT METHODS =====');
            
            if (typeof loginUser === 'function') {
                console.log('[LOGIN] ✓ Named import loginUser works');
                workingLoginUser = loginUser;
            } else if (typeof apiModule.loginUser === 'function') {
                console.log('[LOGIN] ✓ Namespace import apiModule.loginUser works');
                workingLoginUser = apiModule.loginUser;
            } else if (typeof apiDefault?.loginUser === 'function') {
                console.log('[LOGIN] ✓ Default import apiDefault.loginUser works');
                workingLoginUser = apiDefault.loginUser;
            } else if (typeof (window as any).loginUser === 'function') {
                console.log('[LOGIN] ✓ Window.loginUser works');
                workingLoginUser = (window as any).loginUser;
            } else if (typeof (window as any).apiModule?.loginUser === 'function') {
                console.log('[LOGIN] ✓ Window.apiModule.loginUser works');
                workingLoginUser = (window as any).apiModule.loginUser;
            }
            
            if (!workingLoginUser) {
                console.error('[LOGIN] ✗ No working loginUser function found');
                console.error('[LOGIN] loginUser:', loginUser);
                console.error('[LOGIN] apiModule.loginUser:', apiModule.loginUser);
                console.error('[LOGIN] apiDefault?.loginUser:', apiDefault?.loginUser);
                throw new Error('No working loginUser function found from any import method');
            }
            
            console.log('[LOGIN] ✓ Found working loginUser function');
            console.log('[LOGIN] ===== CALLING LOGINUSER =====');
            
            const data = await workingLoginUser(pin);
            
            console.log('[LOGIN] ===== LOGINUSER CALL COMPLETED =====');
            
            console.log('Response status: 200');
            console.log('Response data:', data);
            
            // Show success message briefly
            setSuccess('Login successful! Redirecting...');
            console.log('Login successful on frontend with token:', data.token);
            
            // Update auth state
            login(data.token);
            
            // Check auth state after login with a small delay to allow state to update
            setTimeout(() => {
                const currentState = useAuthStore.getState();
                console.log('Auth state after login:', isAuthenticated ? 'Authenticated' : 'Not Authenticated');
                console.log('Token stored (hook):', token);
                console.log('Token stored (getState):', currentState.token);
                console.log('isAuthenticated (hook):', isAuthenticated);
                console.log('isAuthenticated (getState):', currentState.isAuthenticated);
            }, 100);
            
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
