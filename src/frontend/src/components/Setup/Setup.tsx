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

    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');

    const handlePinNext = () => {
        if (adminPin.length < 4) {
            setPinError('PIN must be at least 4 digits.');
            return;
        }
        if (adminPin !== confirmPin) {
            setPinError('PINs do not match.');
            return;
        }
        setPinError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleDbSubmit = async () => {
        setError('');
        setLoading(true);
        console.log('Submitting database credentials...');
        try {
            const response = await api.post('/setup', {
                adminPin,
                dbType,
                dbHost,
                dbPort: parseInt(dbPort, 10),
                dbUser,
                dbPassword,
                dbName,
            });

            console.log('API Response:', response);

            if (response.status === 201) {
                console.log('Setup successful, navigating to next step.');
                setStep(step + 1);
            } else {
                console.error('API call was not successful, but did not throw an error.', response);
                setError(response.data.message || 'An unexpected error occurred.');
            }
        } catch (err: any) {
            console.error('API call failed and threw an error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Error: ${err.response.data.message}`);
            } else {
                setError('An unknown error occurred. Please check the server logs.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = () => {
        alert('Setup complete! You can now log in.');
        navigate('/login');
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset the setup? This will clear all settings.')) {
            try {
                await api.post('/setup/reset');
                // Reset state to the beginning
                setStep(1);
                setAdminPin('');
                setDbType('ProCal');
                setDbHost('');
                setDbPort('');
                setDbUser('');
                setDbPassword('');
                setDbName('');
                setError('');
                alert('Setup has been reset. You can now start over.');
            } catch (err: any) {
                setError('Failed to reset setup. Please check the server logs.');
            }
        }
    };

    return (
        <div className="setup-container">
            <div className="setup-header">
                <h2>First-Time Setup</h2>
                <button onClick={handleReset} className="reset-button">Reset Setup</button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="setup-step">
                {step === 1 && <Pin
    adminPin={adminPin}
    setAdminPin={setAdminPin}
    confirmPin={confirmPin}
    setConfirmPin={setConfirmPin}
    onNext={handlePinNext}
    error={pinError}
/>}
                {step === 2 && <ExternalTool dbType={dbType} setDbType={setDbType} onNext={() => setStep(step + 1)} onBack={handleBack} />}
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
                        loading={loading}
                    />
                )}
                {step === 4 && <DataSync onBack={handleBack} onSubmit={handleFinalSubmit} loading={loading} />}
            </div>
        </div>
    );
};

export default Setup;
