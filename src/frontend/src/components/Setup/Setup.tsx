import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Pin from './Pin';
import ExternalTool from './ExternalTool';
import Database from './Database';
import DataSync from './DataSync';
import './Setup.css';

const Setup: React.FC = () => {
    const [step, setStep] = useState(1);
    const [adminPin, setAdminPin] = useState('');
    const [dbType, setDbType] = useState('ProCal');
    const [dbHost, setDbHost] = useState('');
    const [dbPort, setDbPort] = useState('');
    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');
    const [dbName, setDbName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        setError('');

        try {
            // Step 1: Set PIN
            if (adminPin.length !== 4 || !/^\d{4}$/.test(adminPin)) {
                setError('Admin PIN must be exactly 4 digits.');
                setStep(1);
                return;
            }
            await api.post('/setup/pin', { adminPin });

            // Step 2: Set External Tool
            await api.post('/setup/external-tool', { dbType });

            // Step 3: Set Database
            await api.post('/setup/database', {
                dbHost,
                dbPort: parseInt(dbPort, 10),
                dbUser,
                dbPassword,
                dbName,
            });

            // Step 4: Complete Setup
            await api.post('/setup/complete');

            alert('Setup complete! You can now log in.');
            navigate('/login');
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="setup-container">
            <h2>First-Time Setup</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="setup-step">
                {step === 1 && <Pin adminPin={adminPin} setAdminPin={setAdminPin} onNext={handleNext} />}
                {step === 2 && <ExternalTool dbType={dbType} setDbType={setDbType} onNext={handleNext} onBack={handleBack} />}
                {step === 3 && (
                    <Database
                        dbHost={dbHost}
                        setDbHost={setDbHost}
                        dbPort={dbPort}
                        setDbPort={setDbPort}
                        dbUser={dbUser}
                        setDbUser={setDbUser}
                        dbPassword={dbPassword}
                        setDbPassword={setDbPassword}
                        dbName={dbName}
                        setDbName={setDbName}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {step === 4 && <DataSync onBack={handleBack} onSubmit={handleSubmit} />}
            </div>
        </div>
    );
};

export default Setup;
