import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Setup: React.FC = () => {
    const [adminPin, setAdminPin] = useState('');
    const [dbType, setDbType] = useState('ProCal');
    const [dbHost, setDbHost] = useState('');
    const [dbPort, setDbPort] = useState('');
    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');
    const [dbName, setDbName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (adminPin.length !== 4 || !/^\d{4}$/.test(adminPin)) {
            setError('Admin PIN must be exactly 4 digits.');
            return;
        }

        try {
            await api.post('/setup', {
                adminPin,
                externalDb: {
                    type: dbType,
                    host: dbHost,
                    port: parseInt(dbPort, 10),
                    user: dbUser,
                    password: dbPassword,
                    database: dbName,
                },
            });
            alert('Setup complete! You can now log in.');
            navigate('/login');
        } catch (err) {
            setError('Setup failed. Please check your details and try again.');
        }
    };

    return (
        <div>
            <h2>First-Time Setup</h2>
            <form onSubmit={handleSubmit}>
                <h4>Admin PIN</h4>
                <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter a 4-digit PIN"
                    maxLength={4}
                />

                <h4>External Database Configuration</h4>
                <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
                    <option value="ProCal">ProCal</option>
                    <option value="MetCal" disabled>MetCal (coming soon)</option>
                    <option value="IndySoft" disabled>IndySoft (coming soon)</option>
                </select>
                <input type="text" value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="Host/IP" />
                <input type="text" value={dbPort} onChange={(e) => setDbPort(e.target.value)} placeholder="Port" />
                <input type="text" value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="Username" />
                <input type="password" value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} placeholder="Password" />
                <input type="text" value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="Database Name" />

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Complete Setup</button>
            </form>
        </div>
    );
};

export default Setup;
