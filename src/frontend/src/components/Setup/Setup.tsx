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
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleDbSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            await api.post('/setup', {
                adminPin,
                dbType,
                dbHost,
                dbPort: parseInt(dbPort, 10),
                dbUser,
                dbPassword,
                dbName,
            });
            handleNext();
        } catch (err: any) {
            if (err.response) {
                setError(err.response.data.message || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = () => {
        alert('Setup complete! You can now log in.');
        navigate('/login');
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
                        onNext={handleDbSubmit}
                        onBack={handleBack}
                    />
                )}
                {step === 4 && <DataSync onBack={handleBack} onSubmit={handleFinalSubmit} loading={loading} />}
            </div>
        </div>
    );
};

export default Setup;
