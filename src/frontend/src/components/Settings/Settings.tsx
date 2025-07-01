import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CardLayoutEditor from './CardLayoutEditor';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
            } catch (err) {
                setError('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/settings', settings);
            alert('Settings updated successfully');
        } catch (err) {
            setError('Failed to update settings');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Settings</h2>
            <form onSubmit={handleSubmit}>
                {Object.keys(settings).map((key) => (
                    <div key={key}>
                        <label>{key}</label>
                        <input
                            type="text"
                            name={key}
                            value={settings[key]}
                            onChange={handleChange}
                        />
                    </div>
                ))}
                <button type="submit">Save Settings</button>
            </form>
            <hr />
            <CardLayoutEditor />
        </div>
    );
};

export default Settings;
