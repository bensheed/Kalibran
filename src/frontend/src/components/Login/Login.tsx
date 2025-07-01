import React, { useState } from 'react';
import api from '../../services/api';

const Login: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { pin });
            // Assuming the API returns a token, which you would then store.
            // For now, we'll just reload the page to reflect the logged-in state.
            window.location.reload();
        } catch (err) {
            setError('Invalid PIN');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN"
                />
                <button type="submit">Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default Login;
