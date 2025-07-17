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
            console.log('User is not authenticated, redirecting to login');
            navigate('/login');
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
            console.log('Auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
            console.log('Token for board creation:', token);
            
            if (!token) {
                console.error('No authentication token found!');
                setError('Authentication error: No token found');
                return;
            }
            
            // The API service will automatically add the Authorization header
            const response = await api.post('/api/boards', { name: boardName });
            
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
