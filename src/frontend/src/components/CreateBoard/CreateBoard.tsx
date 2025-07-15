import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import './CreateBoard.css';

const CreateBoard: React.FC = () => {
    const [boardName, setBoardName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuthStore();
    
    useEffect(() => {
        console.log('CreateBoard component mounted');
        console.log('Auth state in CreateBoard:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
        console.log('Token in CreateBoard:', token ? `${token.substring(0, 5)}...` : 'No token');
        
        // Check if user is authenticated
        if (!isAuthenticated) {
            console.error('User is not authenticated in CreateBoard component');
            
            // Check if we have a token in cookies before redirecting
            const cookies = document.cookie.split(';');
            let hasSessionCookie = false;
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'session_id' && value) {
                    console.log('Found session cookie, logging in with it');
                    useAuthStore.getState().login(value);
                    hasSessionCookie = true;
                    break;
                }
            }
            
            if (!hasSessionCookie) {
                console.log('No session cookie found, redirecting to login');
                navigate('/login');
            }
        }
    }, [isAuthenticated, token, navigate]);

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!boardName.trim()) {
            setError('Board name cannot be empty.');
            return;
        }
        try {
            console.log('Attempting to create board with name:', boardName);
            console.log('Auth state:', useAuthStore.getState().isAuthenticated ? 'Authenticated' : 'Not authenticated');
            console.log('Token for board creation:', useAuthStore.getState().token);
            
            // Get the token directly from the store
            const currentToken = useAuthStore.getState().token;
            console.log('Token for board creation (raw):', currentToken);
            
            // Get token from cookie as fallback
            let tokenToUse = currentToken;
            if (!tokenToUse) {
                const cookies = document.cookie.split(';');
                for (const cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'session_id') {
                        tokenToUse = value;
                        console.log('Using token from cookie instead:', tokenToUse);
                        break;
                    }
                }
            }
            
            if (!tokenToUse) {
                console.error('No authentication token found in store or cookies!');
                setError('Authentication error: No token found');
                return;
            }
            
            // Manually set the Authorization header for this specific request
            const response = await api.post('/api/boards', 
                { name: boardName },
                { 
                    headers: { 
                        'Authorization': `Bearer ${tokenToUse}` 
                    } 
                }
            );
            
            console.log('Request headers sent:', {
                'Authorization': `Bearer ${currentToken}`
            });
            
            console.log('Create board response:', response);
            
            if (response.data && response.data.id) {
                console.log('Board created successfully, navigating to:', `/board/${response.data.id}`);
                navigate(`/board/${response.data.id}`);
            } else {
                console.error('Board creation response did not contain an ID:', response.data);
                setError('Failed to create board. Please try again.');
            }
        } catch (err: any) {
            console.error('Error creating board:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                console.error('Status code:', err.response.status);
                setError(`Error (${err.response.status}): ${err.response.data.message || 'An error occurred'}`);
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Please check your connection.');
            } else {
                console.error('Error message:', err.message);
                setError(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="create-board-container">
            <form className="create-board-form" onSubmit={handleCreateBoard}>
                <h2>Create Your First Kanban Board</h2>
                <p>Welcome! It looks like you don't have any boards yet. Let's create one.</p>
                <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="Enter board name"
                    className="create-board-input"
                />
                <button type="submit" className="create-board-button">Create Board</button>
                {error && <p className="create-board-error">{error}</p>}
            </form>
        </div>
    );
};

export default CreateBoard;
