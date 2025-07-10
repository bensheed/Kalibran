import React from 'react';

interface DatabaseProps {
    dbHost: string;
    setDbHost: (host: string) => void;
    dbPort: string;
    setDbPort: (port: string) => void;
    dbUser: string;
    setDbUser: (user: string) => void;
    dbPassword: string;
    setDbPassword: (password: string) => void;
    dbName: string;
    setDbName: (name: string) => void;
    onNext: () => void;
    onBack: () => void;
    loading: boolean;
}

const Database: React.FC<DatabaseProps> = ({
    dbHost,
    setDbHost,
    dbPort,
    setDbPort,
    dbUser,
    setDbUser,
    dbPassword,
    setDbPassword,
    dbName,
    setDbName,
    onNext,
    onBack,
    loading,
}) => {
    const areFieldsFilled = dbHost && dbPort && dbUser && dbPassword && dbName;

    return (
        <div>
            <h2>Step 3: Database Configuration</h2>
            <input type="text" value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="Host/IP" />
            <input type="text" value={dbPort} onChange={(e) => setDbPort(e.target.value)} placeholder="Port" />
            <input type="text" value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="Username" />
            <input type="password" value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} placeholder="Password" />
            <input type="text" value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="Database Name" />
            <button onClick={onBack}>Back</button>
            <button onClick={onNext} disabled={!areFieldsFilled || loading}>
                {loading ? 'Connecting...' : 'Next'}
            </button>
        </div>
    );
};

export default Database;
